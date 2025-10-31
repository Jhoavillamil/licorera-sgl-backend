import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MovimientoInventario } from '../movimiento-inventario/movimiento-inventario.entity';
import { PedidoProducto } from '../pedido-producto/pedido-producto.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioAdquisicion: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioVenta: number;

  @Column({ type: 'integer', default: 0 })
  stockActual: number;

  @Column({ type: 'integer', default: 0 })
  stockMinimo: number;

  @OneToMany(() => MovimientoInventario, (movimiento) => movimiento.producto)
  movimientosInventario: MovimientoInventario[];

  @OneToMany(() => PedidoProducto, (pedidoProducto) => pedidoProducto.producto)
  pedidosProductos: PedidoProducto[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
