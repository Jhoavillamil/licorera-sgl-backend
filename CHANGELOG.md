# CHANGELOG

All notable changes to this project will be documented in this file.

The format is loosely based on "Keep a Changelog" and semantic versioning. This file is intended for human consumption and to provide a single place to track release notes and milestones (Hitos).

## [Unreleased]

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
