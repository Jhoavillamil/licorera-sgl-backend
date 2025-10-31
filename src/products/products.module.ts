import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../entities/producto/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
