import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService, CreateProductDto, UpdateProductDto } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Producto } from '../entities/producto/producto.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };

    productRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Producto),
          useValue: productRepo,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findById', () => {
    it('devuelve producto cuando existe', async () => {
      const mockProduct = {
        id: '1',
        nombre: 'Test Product',
        stockActual: 10,
      };
      productRepo.findOne.mockResolvedValue(mockProduct);

      const result = await service.findById('1');

      expect(result).toBe(mockProduct);
      expect(productRepo.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['movimientosInventario', 'pedidosProductos'],
      });
    });

    it('devuelve null cuando no existe', async () => {
      productRepo.findOne.mockResolvedValue(null);

      const result = await service.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('crea producto con valores por defecto', async () => {
      const dto: CreateProductDto = {
        nombre: 'New Product',
        precioAdquisicion: 100,
        precioVenta: 150,
      };

      const mockProduct = {
        ...dto,
        id: '1',
        stockActual: 0,
        stockMinimo: 0,
      };

      productRepo.create.mockReturnValue(mockProduct);
      productRepo.save.mockResolvedValue(mockProduct);

      const result = await service.create(dto);

      expect(result).toEqual(mockProduct);
      expect(productRepo.create).toHaveBeenCalledWith({
        ...dto,
        stockActual: 0,
        stockMinimo: 0,
      });
    });

    it('crea producto con stock inicial', async () => {
      const dto: CreateProductDto = {
        nombre: 'New Product',
        precioAdquisicion: 100,
        precioVenta: 150,
        stockActual: 10,
        stockMinimo: 5,
      };

      productRepo.create.mockReturnValue({ ...dto, id: '1' });
      productRepo.save.mockImplementation(product => product);

      const result = await service.create(dto);

      expect(result.stockActual).toBe(10);
      expect(result.stockMinimo).toBe(5);
    });
  });

  describe('updateStock', () => {
    it('actualiza stock cuando hay suficiente', async () => {
      const mockProduct = {
        id: '1',
        stockActual: 10,
      };

      productRepo.findOne.mockResolvedValue(mockProduct);
      productRepo.save.mockImplementation(product => product);

      const result = await service.updateStock('1', -5);

      expect(result.stockActual).toBe(5);
    });

    it('lanza error si no hay stock suficiente', async () => {
      const mockProduct = {
        id: '1',
        stockActual: 10,
      };

      productRepo.findOne.mockResolvedValue(mockProduct);

      await expect(service.updateStock('1', -15))
        .rejects.toThrow(ConflictException);
    });

    it('lanza error si producto no existe', async () => {
      productRepo.findOne.mockResolvedValue(null);

      await expect(service.updateStock('999', 5))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getStockBajo', () => {
    it('busca productos con stock bajo', async () => {
      const mockProducts = [
        { id: '1', nombre: 'Low Stock', stockActual: 2, stockMinimo: 5 },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockProducts),
      };

      productRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getStockBajo();

      expect(result).toEqual(mockProducts);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'producto.stockActual <= producto.stockMinimo',
      );
    });
  });
});