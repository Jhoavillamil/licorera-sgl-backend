import { DataSource } from 'typeorm';
import { Producto } from '../../src/entities/producto/producto.entity';

export interface CreateTestProductoOptions {
  nombre?: string;
  precioAdquisicion?: number;
  precioVenta?: number;
  stockActual?: number;
  stockMinimo?: number;
}

export const createTestProduct = async (
  dataSource: DataSource,
  options: CreateTestProductoOptions = {}
): Promise<Producto> => {
  const productoRepository = dataSource.getRepository(Producto);
  
  const producto = productoRepository.create({
    nombre: options.nombre || 'Producto Test',
    precioAdquisicion: options.precioAdquisicion ?? 10000,
    precioVenta: options.precioVenta ?? 15000,
    // Use nullish coalescing so 0 is a valid value in tests
    stockActual: options.stockActual ?? 0,
    stockMinimo: options.stockMinimo ?? 0,
  });

  return await productoRepository.save(producto);
};

export const createTestProducts = async (
  dataSource: DataSource,
  count: number,
  baseOptions: CreateTestProductoOptions = {}
): Promise<Producto[]> => {
  const productos: Producto[] = [];
  
  for (let i = 0; i < count; i++) {
    const producto = await createTestProduct(dataSource, {
      ...baseOptions,
      nombre: `${baseOptions.nombre || 'Producto Test'} ${i + 1}`
    });
    productos.push(producto);
  }
  
  return productos;
};