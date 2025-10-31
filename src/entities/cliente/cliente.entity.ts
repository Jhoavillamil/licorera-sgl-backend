import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pedido } from '../pedido/pedido.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombreUsuario: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipoID: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numeroID: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  genero: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @OneToMany(() => Pedido, (pedido) => pedido.cliente)
  pedidos: Pedido[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
