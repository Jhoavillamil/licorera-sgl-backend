import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
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
    private readonly dataSource: DataSource,
  ) {}

  async create(createMovimientoDto: CreateMovimientoDto, entityManager?: EntityManager): Promise<MovimientoInventario> {
    // Si estamos dentro de una transacción, usar el EntityManager proporcionado
    if (entityManager) {
      return this.createWithinTransaction(createMovimientoDto, entityManager);
    }

    // Si no hay transacción, crear una nueva
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await this.createWithinTransaction(createMovimientoDto, queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createWithinTransaction(
    createMovimientoDto: CreateMovimientoDto,
    manager: EntityManager
  ): Promise<MovimientoInventario> {
    const producto = await manager.getRepository(Producto).findOne({
      where: { id: createMovimientoDto.productoId }
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Trabajar siempre con cantidades absolutas
    const cantidadAbsoluta = Math.abs(createMovimientoDto.cantidad);
    let nuevoStock = producto.stockActual;

    switch (createMovimientoDto.tipo) {
      case TipoMovimiento.VENTA:
        if (producto.stockActual < cantidadAbsoluta) {
          throw new ConflictException(
            `Stock insuficiente. Disponible: ${producto.stockActual}, Solicitado: ${cantidadAbsoluta}`
          );
        }
        nuevoStock = producto.stockActual - cantidadAbsoluta;
        break;
      case TipoMovimiento.COMPRA:
      case TipoMovimiento.AJUSTE:
        nuevoStock = producto.stockActual + cantidadAbsoluta;
        break;
      default:
        throw new ConflictException(`Tipo de movimiento no válido: ${createMovimientoDto.tipo}`);
    }

    // Actualizar el stock dentro de la transacción
    producto.stockActual = nuevoStock;
    await manager.save(producto);

    // Crear y guardar el movimiento en la misma transacción
    const movimiento = this.movimientoRepository.create({
      productoId: producto.id,
      tipo: createMovimientoDto.tipo,
      cantidad: cantidadAbsoluta,
      nota: createMovimientoDto.nota,
      vendedorId: createMovimientoDto.vendedorId,
      proveedorId: createMovimientoDto.proveedorId,
      producto,
      timestamp: new Date()
    });

    return await manager.save(movimiento);
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