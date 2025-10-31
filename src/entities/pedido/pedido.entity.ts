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

  @Column({ type: 'timestamp' })
  horaInicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  horaFin: Date | null;

  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.ABIERTO,
  })
  estado: EstadoPedido;

  @Column({ type: 'uuid' })
  clienteId: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.pedidos)
  @JoinColumn({ name: 'clienteId' })
  cliente: Cliente;

  @OneToMany(() => PedidoProducto, (pedidoProducto) => pedidoProducto.pedido)
  pedidosProductos: PedidoProducto[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
