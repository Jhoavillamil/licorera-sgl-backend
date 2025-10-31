# CHANGELOG

All notable changes to this project will be documented in this file.

The format is loosely based on "Keep a Changelog" and semantic versioning. This file is intended for human consumption and to provide a single place to track release notes and milestones (Hitos).

## [Unreleased]

### Hito 18 (Planificado) - 2025-10-31

- Resumen: Plan detallado para ampliación de tests y mejoras en infraestructura de testing.
- Detalles:
  - Estructura y casos de test para Orders y Products.
  - Configuración e2e con Postgres en Docker.
  - Implementación de test factories y utilidades.
  - Actualización de CI para soportar todos los tipos de test.
  - Documentación de patrones de test por tipo de entidad.

### Hito 17 - 2025-10-31

- Resumen: Implementación de tests de integración usando SQLite in-memory y adaptaciones en las entidades para soporte SQLite.
- Detalles:
  - Configuración de `test/test-data-source.ts` para SQLite in-memory.
  - Adaptación de entidades para compatibilidad SQLite:
    - Cambio de `timestamp` a `datetime` en todas las entidades.
    - Cambio de `enum` a `simple-enum` en `Pedido.estado`.
    - Cambio de `enum` a `varchar` con `enum` en `MovimientoInventario.tipo`.
  - Implementación de tests de integración para inventory (4 casos).
  - Adición de dependencia `sqlite3`.
  - Tests: ahora 41/41 tests pasan (unit + integration).

### Hito 16 - 2025-10-30

- Resumen: Adición de CHANGELOG.md, RELEASE.md y configuración CI básica.
- Detalles:
  - Creación de estructura de changelog.
  - Configuración de CI en GitHub Actions (lint + tests).
  - Documentación de proceso de release.
  - Mejora de la suite de tests.

### Hito 15 — 2025-10-30

- Resumen: Correcciones en el módulo de inventario y ajustes en tests unitarios; mejoras en UsersService para evitar mutaciones durante el hashing de contraseña.
- Detalles:
  - Alineación de `MovimientoInventarioService` con la entidad `MovimientoInventario` (uso de `TipoMovimiento`, `timestamp`, eliminación de `stockResultante`).
  - Validación de stock y lanzamiento de `ConflictException` cuando corresponde.
  - Corrección en `UsersService.updateUser` para hashear el password sobre una copia del DTO y evitar mutaciones inesperadas en objetos de prueba.
  - Actualización de tests: todos los tests unitarios del backend pasan (39/39).
  - Repositorio remoto creado para backend: `licorera-sgl-backend`.
  - Pull Request: https://github.com/Jhoavillamil/licorera-sgl-backend/pull/1

Commit(s) representativos:
- ef98e83 — fix(inventory): align movement entity, update tests
- 9d1076c — chore: crear rama main con README

## [Previous]

- Ver Hitos anteriores en la carpeta `analisisProyecto/`.
