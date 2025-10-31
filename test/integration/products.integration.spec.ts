import { DataSource } from 'typeorm';
import { TestDataSource } from '../test-data-source';
import { TestCleanup } from '../utils/cleanup.util';
import { createTestProduct } from '../factories';
import { MovimientoInventarioService } from '../../src/inventory/movimiento-inventario.service';
import { MovimientoInventario, TipoMovimiento } from '../../src/entities/movimiento-inventario/movimiento-inventario.entity';
import { Producto } from '../../src/entities/producto/producto.entity';
import { ConflictException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { PedidoProducto } from '../../src/entities/pedido-producto/pedido-producto.entity';
import { Pedido } from '../../src/entities/pedido/pedido.entity';

describe('Products integration (sqlite)', () => {
  let dataSource: DataSource;
  let movimientoInventarioService: MovimientoInventarioService;

  beforeAll(async () => {
    dataSource = TestDataSource;
    await dataSource.initialize();
    
    const movimientoInventarioRepo = dataSource.getRepository(MovimientoInventario);
    const productoRepo = dataSource.getRepository(Producto);
    movimientoInventarioService = new MovimientoInventarioService(movimientoInventarioRepo, productoRepo, dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  afterEach(async () => {
    // Limpiar en orden de dependencia
    await dataSource.getRepository(MovimientoInventario).clear();
    await dataSource.getRepository(PedidoProducto).clear();
    await dataSource.getRepository(Pedido).clear();
    await dataSource.getRepository(Producto).clear();
  });

  describe('CRUD operations', () => {
    it('creates and retrieves product', async () => {
      const producto = await createTestProduct(dataSource, {
        nombre: 'Producto Test CRUD',
        precioVenta: 15000,
        stockMinimo: 5
      });

      const saved = await dataSource
        .getRepository(Producto)
        .findOne({ where: { id: producto.id } });

      expect(saved).not.toBeNull();
      expect(saved?.nombre).toBe('Producto Test CRUD');
      expect(saved?.precioVenta).toBe(15000);
      expect(saved?.stockMinimo).toBe(5);
    });

    it('updates product price and stock threshold', async () => {
      const producto = await createTestProduct(dataSource);
      const productoRepository = dataSource.getRepository(Producto);

      await productoRepository.update(producto.id, {
        precioVenta: 20000,
        stockMinimo: 10
      });

      const updated = await productoRepository.findOne({
        where: { id: producto.id }
      });

      expect(updated).not.toBeNull();
      expect(updated?.precioVenta).toBe(20000);
      expect(updated?.stockMinimo).toBe(10);
    });
  });

  describe('Inventory operations', () => {
    it('updates stock through movements', async () => {
      const producto = await createTestProduct(dataSource, {
        stockActual: 0
      });

      // Crear movimiento de compra
      await movimientoInventarioService.create({
        productoId: producto.id,
        cantidad: 10,
        tipo: TipoMovimiento.COMPRA
      });

      // Verificar stock actualizado
      const updated = await dataSource
        .getRepository(Producto)
        .findOne({ where: { id: producto.id } });

      expect(updated).not.toBeNull();
      expect(updated?.stockActual).toBe(10);
    });

    it('prevents negative stock', async () => {
      const producto = await createTestProduct(dataSource, {
        stockActual: 5
      });

      // Intentar vender más del stock disponible
      await expect(
        movimientoInventarioService.create({
          productoId: producto.id,
          cantidad: -10,
          tipo: TipoMovimiento.VENTA
        })
      ).rejects.toThrow(ConflictException);

      // Verificar que el stock no cambió
      const unchanged = await dataSource
        .getRepository(Producto)
        .findOne({ where: { id: producto.id } });

      expect(unchanged).not.toBeNull();
      expect(unchanged?.stockActual).toBe(5);
    });
  });

  describe('Product relationships', () => {
    it('tracks inventory movements', async () => {
      const producto = await createTestProduct(dataSource);

      // Crear varios movimientos
      await movimientoInventarioService.create({
        productoId: producto.id,
        cantidad: 10,
        tipo: TipoMovimiento.COMPRA
      });

      await movimientoInventarioService.create({
        productoId: producto.id,
        cantidad: -2,
        tipo: TipoMovimiento.VENTA
      });

      // Verificar movimientos registrados
      const productoConMovimientos = await dataSource
        .getRepository(Producto)
        .findOne({
          where: { id: producto.id },
          relations: ['movimientosInventario']
        });

      expect(productoConMovimientos).not.toBeNull();
      expect(productoConMovimientos?.movimientosInventario).toHaveLength(2);
      expect(productoConMovimientos?.stockActual).toBe(8);
    });
  });
});