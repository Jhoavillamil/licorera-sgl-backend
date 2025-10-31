import { DataSource } from 'typeorm';
import { TestDataSource } from '../test-data-source';
import { TestCleanup } from '../utils/cleanup.util';
import { createTestOrder, createTestProduct } from '../factories';
import { EstadoPedido, Pedido } from '../../src/entities/pedido/pedido.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MovimientoInventarioService } from '../../src/inventory/movimiento-inventario.service';
import { MovimientoInventario, TipoMovimiento } from '../../src/entities/movimiento-inventario/movimiento-inventario.entity';
import { Producto } from '../../src/entities/producto/producto.entity';
import { PedidoProducto } from '../../src/entities/pedido-producto/pedido-producto.entity';
import { Cliente } from '../../src/entities/cliente/cliente.entity';

describe('Orders integration (sqlite)', () => {
  let dataSource: DataSource;
  let movimientoInventarioService: MovimientoInventarioService;

  beforeAll(async () => {
    dataSource = TestDataSource;
    await dataSource.initialize();
    
    // Inicializar servicios necesarios
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
    await dataSource.getRepository(Cliente).clear();
  });

  describe('createOrder', () => {
    it('crea pedido con productos y actualiza stock', async () => {
      // Crear producto con stock inicial
      const producto = await createTestProduct(dataSource, {
        stockActual: 10
      });

      // Crear pedido que consume 2 unidades
      const { pedido, pedidoProductos } = await createTestOrder(dataSource, {
        productCount: 1,
        cantidadPorProducto: 2
      });

      // Verificar pedido creado
      expect(pedido.estado).toBe(EstadoPedido.ABIERTO);
      expect(pedidoProductos).toHaveLength(1);
      expect(pedidoProductos[0].cantidad).toBe(2);

      // Verificar stock actualizado
      const productoActualizado = await dataSource
        .getRepository(Producto)
        .findOne({ where: { id: producto.id } });

      if (!productoActualizado) {
        throw new Error('Producto actualizado no encontrado');
      }
      
      expect(productoActualizado.stockActual).toBe(8);
    });

    it('falla si stock insuficiente', async () => {
      // Crear producto con stock bajo
      const producto = await createTestProduct(dataSource, {
        stockActual: 1
      });

      // Intentar crear pedido que requiere más stock
      await expect(
        createTestOrder(dataSource, {
          productCount: 1,
          cantidadPorProducto: 2
        })
      ).rejects.toThrow(ConflictException);

      // Verificar que el stock no cambió
      const productoVerificado = await dataSource
        .getRepository(Producto)
        .findOne({ where: { id: producto.id } });

      if (!productoVerificado) {
        throw new Error('Producto verificado no encontrado');
      }

      expect(productoVerificado.stockActual).toBe(1);
    });
  });

  describe('updateOrder', () => {
    it('actualiza estado del pedido', async () => {
      const { pedido } = await createTestOrder(dataSource);
      const pedidoRepository = dataSource.getRepository(Pedido);

      // Actualizar estado
      await pedidoRepository.update(pedido.id, {
        estado: EstadoPedido.CERRADO,
        horaFin: new Date()
      });

      // Verificar actualización
      const pedidoActualizado = await pedidoRepository.findOne({
        where: { id: pedido.id }
      });

      if (!pedidoActualizado) {
        throw new Error('Pedido actualizado no encontrado');
      }

      expect(pedidoActualizado.estado).toBe(EstadoPedido.CERRADO);
      expect(pedidoActualizado.horaFin).toBeTruthy();
    });

    it('revierte stock al cancelar pedido', async () => {
      // Crear pedido inicial
      const producto = await createTestProduct(dataSource, {
        stockActual: 10
      });

      const { pedido, pedidoProductos } = await createTestOrder(dataSource, {
        productCount: 1,
        cantidadPorProducto: 2
      });

      const pedidoRepository = dataSource.getRepository(Pedido);

      // Verificar stock después de crear pedido
      let productoVerificado = await dataSource
        .getRepository(Producto)
        .findOne({ where: { id: producto.id } });

      if (!productoVerificado) {
        throw new Error('Producto verificado no encontrado');
      }

      expect(productoVerificado.stockActual).toBe(8);

      // Cancelar pedido
      await pedidoRepository.update(pedido.id, {
        estado: EstadoPedido.CANCELADO,
        horaFin: new Date()
      });

      // Crear movimiento de inventario para revertir
      await movimientoInventarioService.create({
        productoId: producto.id,
        cantidad: pedidoProductos[0].cantidad, // Devolver la misma cantidad
        tipo: TipoMovimiento.AJUSTE,
        nota: `Cancelación pedido ${pedido.id}`
      });

      // Verificar que el stock se restauró
      productoVerificado = await dataSource
        .getRepository(Producto)
        .findOne({ where: { id: producto.id } });

      if (!productoVerificado) {
        throw new Error('Producto verificado no encontrado');
      }

      expect(productoVerificado.stockActual).toBe(10);
    });
  });

  describe('pedido queries', () => {
    it('obtiene pedido con productos y cliente', async () => {
      const { pedido } = await createTestOrder(dataSource, {
        productCount: 2
      });

      const pedidoCompleto = await dataSource
        .getRepository(Pedido)
        .findOne({
          where: { id: pedido.id },
          relations: ['cliente', 'pedidosProductos', 'pedidosProductos.producto']
        });

      if (!pedidoCompleto) {
        throw new Error('Pedido completo no encontrado');
      }

      expect(pedidoCompleto.cliente).toBeTruthy();
      expect(pedidoCompleto.pedidosProductos).toHaveLength(2);
      expect(pedidoCompleto.pedidosProductos[0].producto).toBeTruthy();
    });

    it('falla al buscar pedido inexistente', async () => {
      await expect(
        dataSource
          .getRepository(Pedido)
          .findOneOrFail({
            where: { id: 'non-existent-id' }
          })
      ).rejects.toThrow(Error);
    });
  });
});