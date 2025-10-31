import { Test, TestingModule } from '@nestjs/testing';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovimientoInventario, TipoMovimiento } from '../entities/movimiento-inventario/movimiento-inventario.entity';
import { Producto } from '../entities/producto/producto.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface CreateMovimientoDto {
  productoId: string;
  cantidad: number;
  tipo: TipoMovimiento;
  precioUnitario?: number;
  nota?: string;
  vendedorId?: string;
  proveedorId?: string;
}

describe('MovimientoInventarioService', () => {
  let service: MovimientoInventarioService;
  let movimientoRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
  };
  let productoRepo: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let mockManager: {
    findOne: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    getRepository: jest.Mock;
  };
  let mockDataSource: {
    transaction: jest.Mock;
    createQueryRunner: jest.Mock;
  };

  beforeEach(async () => {
    movimientoRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    productoRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    // Define un mockManager que simule el comportamiento del EntityManager
    mockManager = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      getRepository: jest.fn((entity) => {
        if (entity === MovimientoInventario) return movimientoRepo;
        if (entity === Producto) return productoRepo;
        return undefined;
      }),
    };

    // Prepara un queryRunner simulado y el dataSource con createQueryRunner
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: mockManager,
    };

    // Configura mockDataSource para simular transacciones (transaction y createQueryRunner)
    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(mockManager);
      }),
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientoInventarioService,
        {
          provide: getRepositoryToken(MovimientoInventario),
          useValue: movimientoRepo,
        },
        {
          provide: getRepositoryToken(Producto),
          useValue: productoRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<MovimientoInventarioService>(MovimientoInventarioService);
  });

  describe('create', () => {
    it('crea movimiento de entrada y actualiza stock', async () => {
      const mockProducto = {
        id: 'p1',
        stockActual: 10,
      };

      const createDto: CreateMovimientoDto = {
        productoId: 'p1',
        cantidad: 5,
        tipo: TipoMovimiento.COMPRA,
        precioUnitario: 100,
        nota: 'Entrada de mercancía',
      };

  productoRepo.findOne.mockResolvedValue(mockProducto);
      const nuevoStock = mockProducto.stockActual + createDto.cantidad;
      
      movimientoRepo.create.mockReturnValue({
        ...createDto,
        producto: mockProducto,
        timestamp: new Date()
      });

      await service.create(createDto);

      expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({
        stockActual: nuevoStock,
      }));
    });

    it('crea movimiento de salida y actualiza stock', async () => {
      const mockProducto = {
        id: 'p1',
        stockActual: 10,
      };

      const createDto: CreateMovimientoDto = {
        productoId: 'p1',
        cantidad: 3,
        tipo: TipoMovimiento.VENTA,
        precioUnitario: 150,
      };

  productoRepo.findOne.mockResolvedValue(mockProducto);
      const nuevoStock = mockProducto.stockActual - createDto.cantidad;

      movimientoRepo.create.mockReturnValue({
        ...createDto,
        producto: mockProducto,
        timestamp: new Date()
      });

      await service.create(createDto);

      expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({
        stockActual: nuevoStock,
      }));
    });

    it('lanza error si no hay stock suficiente para salida', async () => {
      const mockProducto = {
        id: 'p1',
        stockActual: 5,
      };

      const createDto: CreateMovimientoDto = {
        productoId: 'p1',
        cantidad: 10,
        tipo: TipoMovimiento.VENTA,
        precioUnitario: 150,
      };

  productoRepo.findOne.mockResolvedValue(mockProducto);

  await expect(service.create(createDto)).rejects.toThrow(ConflictException);
  expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
  expect(productoRepo.findOne).toHaveBeenCalled();
    });

    it('lanza error si producto no existe', async () => {
  productoRepo.findOne.mockResolvedValue(null);

      const createDto: CreateMovimientoDto = {
        productoId: 'noexiste',
        cantidad: 1,
        tipo: TipoMovimiento.COMPRA,
        precioUnitario: 100,
      };

  await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
  expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
  expect(productoRepo.findOne).toHaveBeenCalled();
    });

  it('maneja cantidad negativa tomando el valor absoluto', async () => {
      const mockProducto = {
        id: 'p1',
        stockActual: 10,
      };

      const createDto: CreateMovimientoDto = {
        productoId: 'p1',
        cantidad: -4,
        tipo: TipoMovimiento.COMPRA,
      };

        productoRepo.findOne.mockResolvedValue(mockProducto);
        const nuevoStock = mockProducto.stockActual + Math.abs(createDto.cantidad);

      movimientoRepo.create.mockReturnValue({
        ...createDto,
        producto: mockProducto,
        timestamp: new Date(),
      });

      await service.create(createDto);

      expect(mockManager.save).toHaveBeenCalledWith(expect.objectContaining({
        stockActual: nuevoStock,
      }));
        expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
    });
  });

  describe('getKardex', () => {
    it('devuelve movimientos ordenados por fecha', async () => {
      const mockProducto = { id: 'p1' };
      const mockMovimientos = [
        { id: 'm1', timestamp: new Date('2025-01-01') },
        { id: 'm2', timestamp: new Date('2025-01-02') },
      ];

      productoRepo.findOne.mockResolvedValue(mockProducto);
      movimientoRepo.find.mockResolvedValue(mockMovimientos);

      const result = await service.getKardex('p1');

      expect(result).toEqual(mockMovimientos);
      expect(movimientoRepo.find).toHaveBeenCalledWith({
        where: { producto: { id: 'p1' } },
        order: { timestamp: 'ASC' },
      });
    });

    it('lanza error si producto no existe', async () => {
      productoRepo.findOne.mockResolvedValue(null);

      await expect(service.getKardex('noexiste')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUltimosCostos', () => {
    it('devuelve últimas compras ordenadas por fecha', async () => {
      const mockMovimientos = [
        { id: 'm1', tipo: TipoMovimiento.COMPRA, timestamp: new Date('2025-01-02') },
        { id: 'm2', tipo: TipoMovimiento.COMPRA, timestamp: new Date('2025-01-01') },
      ];

      movimientoRepo.find.mockResolvedValue(mockMovimientos);

      const result = await service.getUltimosCostos('p1', 2);

      expect(result).toEqual(mockMovimientos);
      expect(movimientoRepo.find).toHaveBeenCalledWith({
        where: {
          producto: { id: 'p1' },
          tipo: TipoMovimiento.COMPRA,
        },
        order: { timestamp: 'DESC' },
        take: 2,
      });
    });
  });
});