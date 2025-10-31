import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../entities/producto/producto.entity';

export interface CreateProductDto {
  nombre: string;
  precioAdquisicion: number;
  precioVenta: number;
  stockActual?: number;
  stockMinimo?: number;
}

export interface UpdateProductDto {
  nombre?: string;
  precioAdquisicion?: number;
  precioVenta?: number;
  stockMinimo?: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Producto)
    private readonly productRepository: Repository<Producto>,
  ) {}

  async findById(id: string): Promise<Producto | null> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['movimientosInventario', 'pedidosProductos']
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Producto> {
    const nuevoProducto = this.productRepository.create({
      ...createProductDto,
      stockActual: createProductDto.stockActual || 0,
      stockMinimo: createProductDto.stockMinimo || 0
    });
    return this.productRepository.save(nuevoProducto);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Producto> {
    const producto = await this.findById(id);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    Object.assign(producto, updateProductDto);
    return this.productRepository.save(producto);
  }

  async updateStock(id: string, quantity: number): Promise<Producto> {
    const producto = await this.findById(id);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    const nuevoStock = producto.stockActual + quantity;
    if (nuevoStock < 0) {
      throw new ConflictException('Stock insuficiente');
    }

    producto.stockActual = nuevoStock;
    return this.productRepository.save(producto);
  }

  async getStockBajo(): Promise<Producto[]> {
    return this.productRepository
      .createQueryBuilder('producto')
      .where('producto.stockActual <= producto.stockMinimo')
      .getMany();
  }
}