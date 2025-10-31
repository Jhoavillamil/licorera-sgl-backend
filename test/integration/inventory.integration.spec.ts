import TestDataSource from '../test-data-source';
import { Repository } from 'typeorm';
import { Producto } from '../../src/entities/producto/producto.entity';
import { MovimientoInventario, TipoMovimiento } from '../../src/entities/movimiento-inventario/movimiento-inventario.entity';
import { MovimientoInventarioService } from '../../src/inventory/movimiento-inventario.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('Inventory integration (sqlite)', () => {
  let productoRepo: Repository<Producto>;
  let movimientoRepo: Repository<MovimientoInventario>;
  let service: MovimientoInventarioService;

  beforeAll(async () => {
    await TestDataSource.initialize();
    productoRepo = TestDataSource.getRepository(Producto);
    movimientoRepo = TestDataSource.getRepository(MovimientoInventario);
    service = new MovimientoInventarioService(movimientoRepo, productoRepo, TestDataSource);
  });

  afterAll(async () => {
    await TestDataSource.destroy();
  });

  beforeEach(async () => {
    await movimientoRepo.clear();
    await productoRepo.clear();
  });

  it('compra aumenta stock y crea movimiento', async () => {
    const producto = productoRepo.create({
      nombre: 'Prod Test',
      precioAdquisicion: 10,
      precioVenta: 15,
      stockActual: 5,
    });
    await productoRepo.save(producto);

    const dto = {
      productoId: producto.id,
      cantidad: 4,
      tipo: TipoMovimiento.COMPRA,
    } as any;

    const movimiento = await service.create(dto);

  const productoDb = await productoRepo.findOne({ where: { id: producto.id } });
  expect(productoDb).not.toBeNull();
  expect(productoDb!.stockActual).toBe(9);
  const savedMovimiento = await movimientoRepo.findOne({ where: { id: movimiento.id }, relations: ['producto'] });
  expect(savedMovimiento).not.toBeNull();
  expect(savedMovimiento!.cantidad).toBe(Math.abs(dto.cantidad));
  });

  it('venta decrementa stock y falla si insuficiente', async () => {
    const producto = productoRepo.create({
      nombre: 'Prod Sell',
      precioAdquisicion: 8,
      precioVenta: 12,
      stockActual: 2,
    });
    await productoRepo.save(producto);

    const dto = {
      productoId: producto.id,
      cantidad: 1,
      tipo: TipoMovimiento.VENTA,
    } as any;

    const movimiento = await service.create(dto);
  const productoDb = await productoRepo.findOne({ where: { id: producto.id } });
  expect(productoDb).not.toBeNull();
  expect(productoDb!.stockActual).toBe(1);

    // intento venta mayor al stock
    const dto2 = { productoId: producto.id, cantidad: 5, tipo: TipoMovimiento.VENTA } as any;
    await expect(service.create(dto2)).rejects.toThrow(ConflictException);
  });

  it('getKardex ordena movimientos por timestamp', async () => {
    const producto = productoRepo.create({
      nombre: 'Kardex Prod',
      precioAdquisicion: 5,
      precioVenta: 7,
      stockActual: 0,
    });
    await productoRepo.save(producto);

    // crear movimientos
    await service.create({ productoId: producto.id, cantidad: 2, tipo: TipoMovimiento.COMPRA } as any);
    await service.create({ productoId: producto.id, cantidad: 1, tipo: TipoMovimiento.VENTA } as any);

    const movimientos = await service.getKardex(producto.id);
    expect(movimientos.length).toBeGreaterThanOrEqual(2);
    // timestamps ascendentes
    for (let i = 1; i < movimientos.length; i++) {
      expect(new Date(movimientos[i].timestamp).getTime()).toBeGreaterThanOrEqual(new Date(movimientos[i - 1].timestamp).getTime());
    }
  });

  it('lanza NotFoundException si producto inexistente', async () => {
    await expect(service.getKardex('no-existe')).rejects.toThrow(NotFoundException);
  });
});
