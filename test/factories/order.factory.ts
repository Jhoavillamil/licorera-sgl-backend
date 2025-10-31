import { DataSource } from 'typeorm';
import { Pedido, EstadoPedido } from '../../src/entities/pedido/pedido.entity';
import { createTestCliente } from './cliente.factory';
import { createTestProducts } from './product.factory';
import { PedidoProducto } from '../../src/entities/pedido-producto/pedido-producto.entity';
import { MovimientoInventarioService } from '../../src/inventory/movimiento-inventario.service';
import { MovimientoInventario, TipoMovimiento } from '../../src/entities/movimiento-inventario/movimiento-inventario.entity';
import { Producto } from '../../src/entities/producto/producto.entity';

export interface CreateTestOrderOptions {
  estado?: EstadoPedido;
  productCount?: number;
  cantidadPorProducto?: number;
}

export const createTestOrder = async (
  dataSource: DataSource,
  options: CreateTestOrderOptions = {}
): Promise<{pedido: Pedido; pedidoProductos: PedidoProducto[]}> => {
  // Crear cliente y productos de prueba
  const cliente = await createTestCliente(dataSource);

  // Reuse existing products if present, otherwise create new ones.
  const productoRepository = dataSource.getRepository(Producto);
  const wantedCount = options.productCount || 2;
  let productos = await productoRepository.find({ take: wantedCount });
  if (productos.length < wantedCount) {
    const toCreate = wantedCount - productos.length;
    // For orders, ensure created products have initial stock so orders can be fulfilled
    const created = await createTestProducts(dataSource, toCreate, { stockActual: 20 });
    productos = productos.concat(created);
  }
  
  // Crear el pedido
  const pedidoRepository = dataSource.getRepository(Pedido);
  const pedido = pedidoRepository.create({
    estado: options.estado || EstadoPedido.ABIERTO,
    horaInicio: new Date()
  });

  // Establecer las relaciones
  pedido.cliente = cliente;
  pedido.clienteId = cliente.id;
  
  // Guardar todo en una transacción
  return await dataSource.transaction(async transactionalEntityManager => {
    // Guardar el pedido primero
    await transactionalEntityManager.save(pedido);
    
    const pedidoProductoRepository = transactionalEntityManager.getRepository(PedidoProducto);
    const pedidoProductos: PedidoProducto[] = [];
  
  for (const producto of productos) {
    const pedidoProducto = pedidoProductoRepository.create({
      cantidad: options.cantidadPorProducto || 1,
      precioVentaSnapshot: producto.precioVenta,
      costoSnapshot: producto.precioAdquisicion
    });
    
    // Establecer las relaciones manualmente
    pedidoProducto.pedido = pedido;
    pedidoProducto.producto = producto;
    pedidoProducto.pedidoId = pedido.id;
    pedidoProducto.productoId = producto.id;

    // El movimiento de inventario se manejará en la transacción
    
      pedidoProductos.push(await pedidoProductoRepository.save(pedidoProducto));

      // Actualizar el stock usando el mismo transaction manager
      const movimientoInventarioRepo = dataSource.getRepository(MovimientoInventario);
      const productoRepo = dataSource.getRepository(Producto);
      const movimientoInventarioService = new MovimientoInventarioService(
        movimientoInventarioRepo,
        productoRepo,
        dataSource
      );

      await movimientoInventarioService.create({
        productoId: producto.id,
        cantidad: options.cantidadPorProducto || 1,
        tipo: TipoMovimiento.VENTA,
        nota: `Venta en pedido ${pedido.id}`
      }, transactionalEntityManager);
    }

    return { pedido, pedidoProductos };
  });
};