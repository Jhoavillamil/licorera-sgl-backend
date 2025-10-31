import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('regla_negocio_parametro')
@Index(['nombreParametro'], { unique: true })
export class RuleParam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombreParametro: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorNumerico: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
