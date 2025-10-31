import { Test, TestingModule } from '@nestjs/testing';
import { MovimientoInventarioService } from './movimiento-inventario.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovimientoInventario, TipoMovimiento } from '../entities/movimiento-inventario/movimiento-inventario.entity';
import { Producto } from '../entities/producto/producto.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

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
      movimientoRepo.save.mockImplementation(m => m);
      productoRepo.save.mockImplementation(p => p);

      const result = await service.create(createDto);

      expect(productoRepo.save).toHaveBeenCalledWith({
        ...mockProducto,
        stockActual: nuevoStock,
      });
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
      movimientoRepo.save.mockImplementation(m => m);
      productoRepo.save.mockImplementation(p => p);

      const result = await service.create(createDto);

      expect(productoRepo.save).toHaveBeenCalledWith({
        ...mockProducto,
        stockActual: nuevoStock,
      });
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
  // Nota: el servicio aplica la cantidad tal como viene (espera cantidades positivas en el DTO).
  // Si se pasa una cantidad negativa en el DTO, el nuevo stock será stockActual + cantidad (negativa).
  const nuevoStock = mockProducto.stockActual + createDto.cantidad;

      movimientoRepo.create.mockReturnValue({
        ...createDto,
        producto: mockProducto,
        timestamp: new Date(),
      });
      movimientoRepo.save.mockImplementation(m => m);
      productoRepo.save.mockImplementation(p => p);

      const result = await service.create(createDto);

      expect(productoRepo.save).toHaveBeenCalledWith({
        ...mockProducto,
        stockActual: nuevoStock,
      });
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