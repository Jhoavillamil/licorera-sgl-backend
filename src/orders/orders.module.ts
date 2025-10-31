import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from '../entities/pedido/pedido.entity';
import { PedidoProducto } from '../entities/pedido-producto/pedido-producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, PedidoProducto])],
  exports: [TypeOrmModule],
})
export class OrdersModule {}

