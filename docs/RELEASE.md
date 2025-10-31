# Release / Tagging Guide

Este archivo describe el flujo sugerido para crear releases y tags en el repositorio `licorera-sgl-backend`.

1) Política de versionado
- Usar Semantic Versioning (semver): MAJOR.MINOR.PATCH
  - Aumentar MAJOR para cambios incompatibles.
  - Aumentar MINOR para nuevas funcionalidades compatibles.
  - Aumentar PATCH para correcciones y ajustados (hotfixes).

2) Preparar release
- Verifica que `main` esté actualizado y pase CI.
- Revisa la rama de feature/bugfix y asegúrate de que la PR esté aprobada y mergeada.

3) Crear tag y release (ejemplo):
```powershell
# desde el repo backend
git checkout main
git pull origin main
# cambiar versión en package.json si aplica
git tag -a v1.0.0 -m "Release v1.0.0 - Hito 15: correcciones de inventory and tests"
git push origin v1.0.0

# crear release en GitHub (opcional con gh)
gh release create v1.0.0 --title "v1.0.0 - Hito 15" --notes "Correcciones en MovimientoInventario, tests verdes. PR: https://github.com/Jhoavillamil/licorera-sgl-backend/pull/1"
```

4) CHANGELOG
- Actualizar `CHANGELOG.md` con la entrada del release y mover la sección `Unreleased` a la versión creada.

5) Notas
- Mantener un `CHANGELOG.md` legible y vinculado en el README para referencias de auditoría.
