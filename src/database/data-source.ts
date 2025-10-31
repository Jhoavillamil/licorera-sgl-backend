import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { User } from '../entities/user/user.entity';
import { Role } from '../entities/role/role';
import { Supplier } from '../entities/supplier/supplier.entity';
import { RuleParam } from '../entities/rule-param/rule-param.entity';
import { Producto } from '../entities/producto/producto.entity';
import { Cliente } from '../entities/cliente/cliente.entity';
import { Pedido } from '../entities/pedido/pedido.entity';
import { PedidoProducto } from '../entities/pedido-producto/pedido-producto.entity';
import { MovimientoInventario } from '../entities/movimiento-inventario/movimiento-inventario.entity';

// Cargar variables de entorno
config({ path: path.join(__dirname, '../../.env') });

// Detectar si estamos ejecutando desde TypeORM CLI (fuera de Docker)
// Si DB_HOST es 'postgres' y estamos fuera de Docker, usar localhost
const dbHost =
  process.env.DB_HOST === 'postgres' && !process.env.DOCKER_ENV
    ? 'localhost'
    : process.env.DB_HOST || 'localhost';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  // Para TypeORM CLI fuera de Docker, usar localhost (puerto expuesto)
  // Para la app dentro de Docker, usar 'postgres'
  host: dbHost,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'sgl_user',
  password: process.env.DB_PASSWORD || 'sgl_password_secret',
  database: process.env.DB_DATABASE || 'sgl_database',
  entities: [
    User,
    Role,
    Supplier,
    RuleParam,
    Producto,
    Cliente,
    Pedido,
    PedidoProducto,
    MovimientoInventario,
  ],
  migrations: [path.join(__dirname, './migrations/**/*{.ts,.js}')],
  synchronize: false,
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
