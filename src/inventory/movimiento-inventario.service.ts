import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovimientoInventario, TipoMovimiento } from '../entities/movimiento-inventario/movimiento-inventario.entity';
import { Producto } from '../entities/producto/producto.entity';

export interface CreateMovimientoDto {
  productoId: string;
  cantidad: number;
  tipo: TipoMovimiento;
  precioUnitario?: number;
  nota?: string;
  vendedorId?: string;
  proveedorId?: string;
}

@Injectable()
export class MovimientoInventarioService {
  constructor(
    @InjectRepository(MovimientoInventario)
    private readonly movimientoRepository: Repository<MovimientoInventario>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createMovimientoDto: CreateMovimientoDto): Promise<MovimientoInventario> {
    const producto = await this.productoRepository.findOne({
      where: { id: createMovimientoDto.productoId }
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Determinar si es un movimiento que suma o resta stock
    const esSalida = createMovimientoDto.tipo === TipoMovimiento.VENTA;
    const cantidad = esSalida ? -createMovimientoDto.cantidad : createMovimientoDto.cantidad;

    const nuevoStock = producto.stockActual + cantidad;
    if (nuevoStock < 0) {
      throw new ConflictException('Stock insuficiente para realizar el movimiento');
    }

    const movimiento = this.movimientoRepository.create({
      productoId: producto.id,
      tipo: createMovimientoDto.tipo,
      cantidad: Math.abs(createMovimientoDto.cantidad),
      nota: createMovimientoDto.nota,
      vendedorId: createMovimientoDto.vendedorId,
      proveedorId: createMovimientoDto.proveedorId,
      producto,
      timestamp: new Date()
    });

    await this.movimientoRepository.save(movimiento);

    // Actualizar stock del producto
    producto.stockActual = nuevoStock;
    await this.productoRepository.save(producto);

    return movimiento;
  }

  async getKardex(productoId: string): Promise<MovimientoInventario[]> {
    const producto = await this.productoRepository.findOne({
      where: { id: productoId }
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.movimientoRepository.find({
      where: { producto: { id: productoId } },
      order: { timestamp: 'ASC' }
    });
  }

  async getUltimosCostos(productoId: string, limit: number = 5): Promise<MovimientoInventario[]> {
    return this.movimientoRepository.find({
      where: {
        producto: { id: productoId },
        tipo: TipoMovimiento.COMPRA
      },
      order: { timestamp: 'DESC' },
      take: limit
    });
  }
}