import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from '../entities/supplier/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  exports: [TypeOrmModule],
})
export class SuppliersModule {}
