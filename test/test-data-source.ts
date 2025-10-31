import { DataSource } from 'typeorm';
import { Producto } from '../src/entities/producto/producto.entity';
import { MovimientoInventario } from '../src/entities/movimiento-inventario/movimiento-inventario.entity';
import { User } from '../src/entities/user/user.entity';
import { Role } from '../src/entities/role/role';
import { Supplier } from '../src/entities/supplier/supplier.entity';
import { Pedido } from '../src/entities/pedido/pedido.entity';
import { Cliente } from '../src/entities/cliente/cliente.entity';
import { PedidoProducto } from '../src/entities/pedido-producto/pedido-producto.entity';

export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  dropSchema: true,
  logging: false,
  entities: [
    Producto,
    MovimientoInventario,
    User,
    Role,
    Supplier,
    Pedido,
    Cliente,
    PedidoProducto,
  ],
});

export default TestDataSource;
