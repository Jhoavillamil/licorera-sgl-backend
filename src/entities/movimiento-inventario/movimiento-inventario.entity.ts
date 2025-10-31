import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Producto } from '../producto/producto.entity';
import { Supplier } from '../supplier/supplier.entity';
import { User } from '../user/user.entity';

export enum TipoMovimiento {
  COMPRA = 'Compra',
  VENTA = 'Venta',
  AJUSTE = 'Ajuste',
}

@Entity('movimientos_inventario')
export class MovimientoInventario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productoId: string;

  @Column({ type: 'datetime', default: () => "(datetime('now'))" })
  timestamp: Date;

  @Column({
    type: 'varchar',
    length: 20,
    enum: TipoMovimiento,
  })
  tipo: TipoMovimiento;

  @Column({ type: 'integer' })
  cantidad: number;

  @Column({ type: 'uuid', nullable: true })
  vendedorId: string | null;

  @Column({ type: 'text', nullable: true })
  nota: string | null;

  @Column({ type: 'uuid', nullable: true })
  proveedorId: string | null;

  @ManyToOne(() => Producto, (producto) => producto.movimientosInventario)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Supplier | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'vendedorId' })
  vendedor: User | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
