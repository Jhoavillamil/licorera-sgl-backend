import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../cliente/cliente.entity';
import { PedidoProducto } from '../pedido-producto/pedido-producto.entity';

export enum EstadoPedido {
  ABIERTO = 'Abierto',
  CERRADO = 'Cerrado',
  CANCELADO = 'Cancelado',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetime' })
  horaInicio: Date;

  @Column({ type: 'datetime', nullable: true })
  horaFin: Date | null;

  @Column({
    type: 'simple-enum',
    enum: EstadoPedido,
    default: EstadoPedido.ABIERTO,
  })
  estado: EstadoPedido;

  @ManyToOne(() => Cliente, (cliente) => cliente.pedidos, { nullable: false })
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @Column({ type: 'uuid' })
  clienteId: string;

  @OneToMany(() => PedidoProducto, (pedidoProducto) => pedidoProducto.pedido)
  pedidosProductos: PedidoProducto[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
