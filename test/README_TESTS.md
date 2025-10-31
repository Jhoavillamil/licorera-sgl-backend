# Tests — instrucciones y guía rápida

Este archivo explica cómo ejecutar las pruebas del backend, la estructura de las factorías (factories)
y qué esperar de los tests de integración.

Ubicación
- Archivo principal de pruebas: `backend/test`
- Tests de integración: `backend/test/integration`
- Factorías de test: `backend/test/factories`

Comandos comunes
- Instalar dependencias (desde `backend`):

```powershell
npm ci
```

- Ejecutar toda la suite de tests (unit + integration):

```powershell
npm test
```

- Ejecutar sólo tests de integración:

```powershell
npx jest test/integration --runInBand
```

- Ejecutar un fichero de tests específico (ej. orders integration):

```powershell
npx jest test/integration/orders.integration.spec.ts -i --runInBand
```

Entorno y bases de datos para pruebas
- Las pruebas de integración usan `TestDataSource` (SQLite en memoria o fichero según `test/test-data-source.ts`).
- Usa `.env.test` para variables de entorno específicas de test si es necesario.

Factories y cómo usarlas
- `createTestProduct(dataSource, options?)`
  - Crea y guarda un `Producto` con valores por defecto.
  - Opciones relevantes:
    - `nombre`, `precioAdquisicion`, `precioVenta`, `stockActual`, `stockMinimo`.
  - Importante: en este repo las defaults usan `??` para permitir `stockActual: 0` en tests que quieran simular agotado.

- `createTestProducts(dataSource, count, baseOptions?)`
  - Crea múltiples productos. `baseOptions` se propaga a cada producto.

- `createTestOrder(dataSource, options?)`
  - Crea cliente, productos (o reutiliza existentes) y un `Pedido` dentro de una transacción.
  - Opciones relevantes:
    - `productCount` (cantidad de productos en el pedido)
    - `cantidadPorProducto` (cantidad de cada producto)
  - Nota: para evitar falsos negativos en tests que esperan crear pedidos con éxito, la factoría
    reutiliza productos si existen; si crea nuevos productos les asigna `stockActual: 20` por defecto.

Mocks y transacciones en unit tests
- Algunos tests unitarios (ej. `movimiento-inventario.service.spec.ts`) mockean `DataSource` y `QueryRunner`.
  - El mock incluye `createQueryRunner()` que devuelve un `mockQueryRunner` con `connect/startTransaction/commit/rollback/release`.
  - También se mockea el `manager` del query runner (métodos: `findOne`, `save`, `getRepository`).
  - Esto permite testear commits/rollbacks y la lógica de validación de stock sin tocar la BD.

Consejos para desarrollar tests
- Si añades tests que dependen de stock inicial, pásalo explícitamente a `createTestProduct`.
- Mantén las factorías parametrizables: evita lógica mágica que cree datos por defecto complicados.
- Para pruebas de integración largas, usa `--runInBand` para mayor estabilidad en CI.

Si quieres, puedo añadir scripts npm (por ejemplo `test:unit`, `test:integration`) y/o un README más detallado
con ejemplos de fixtures específicos.
