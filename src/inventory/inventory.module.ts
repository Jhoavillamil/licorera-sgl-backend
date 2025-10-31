import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovimientoInventario } from '../entities/movimiento-inventario/movimiento-inventario.entity';
import { Producto } from '../entities/producto/producto.entity';
import { MovimientoInventarioService } from './movimiento-inventario.service';

@Module({
  imports: [TypeOrmModule.forFeature([MovimientoInventario, Producto])],
  providers: [MovimientoInventarioService],
  exports: [TypeOrmModule, MovimientoInventarioService],
})
export class InventoryModule {}
