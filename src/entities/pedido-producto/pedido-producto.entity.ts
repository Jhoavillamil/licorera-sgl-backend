import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pedido } from '../pedido/pedido.entity';
import { Producto } from '../producto/producto.entity';

@Entity('pedido_productos')
export class PedidoProducto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pedidoId: string;

  @Column({ type: 'uuid' })
  productoId: string;

  @Column({ type: 'integer' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioVentaSnapshot: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costoSnapshot: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.pedidosProductos)
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @ManyToOne(() => Producto, (producto) => producto.pedidosProductos)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
