import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { E2EDataSource } from './e2e-data-source';
import { createTestProduct, createTestOrder } from '../factories';
import { EstadoPedido } from '../../src/entities/pedido/pedido.entity';
import { Producto } from '../../src/entities/producto/producto.entity';
import { Pedido } from '../../src/entities/pedido/pedido.entity';

describe('Order Flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Inicializar la base de datos
    await E2EDataSource.initialize();

    // Crear y configurar la aplicación
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await E2EDataSource.destroy();
  });

  it('completes full order process', async () => {
    // 1. Crear producto inicial
    const producto = await createTestProduct(E2EDataSource, {
      stockActual: 10,
      precioVenta: 15000
    });

    // 2. Login como vendedor
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'vendedor@test.com',
        password: 'test123'
      });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.access_token;

    // 3. Crear pedido
    const { pedido } = await createTestOrder(E2EDataSource, {
      productCount: 1,
      cantidadPorProducto: 2
    });

    // 4. Verificar stock actualizado
    const productoActualizado = await E2EDataSource
      .getRepository(Producto)
      .findOne({ where: { id: producto.id } });

    if (!productoActualizado) {
      throw new Error('Producto no encontrado después de la actualización');
    }

    expect(productoActualizado.stockActual).toBe(8);

    // 5. Cerrar pedido
    const closeResponse = await request(app.getHttpServer())
      .patch(`/orders/${pedido.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        estado: EstadoPedido.CERRADO
      });

    expect(closeResponse.status).toBe(200);

    // 6. Verificar estado final
    const pedidoFinal = await E2EDataSource
      .getRepository(Pedido)
      .findOne({
        where: { id: pedido.id },
        relations: ['pedidosProductos']
      });

    if (!pedidoFinal) {
      throw new Error('Pedido no encontrado al verificar estado final');
    }

    expect(pedidoFinal.estado).toBe(EstadoPedido.CERRADO);
    expect(pedidoFinal.horaFin).toBeTruthy();
  });
});