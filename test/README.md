# Tests — Backend

This folder documents the backend testing approach and how to run tests locally and in CI.

Quick commands (PowerShell):

```powershell
cd backend
npm ci
npm test
```

What we have
- Unit tests for Auth components:
  - `src/auth/auth.service.spec.ts`
  - `src/auth/strategies/jwt.strategy.spec.ts`
  - `src/auth/guards/roles.guard.spec.ts`
  - `src/auth/auth.controller.spec.ts`

Testing philosophy
- Unit tests should be fast and avoid DB access: mock TypeORM repositories and external services (JwtService, ConfigService).
- Reserve e2e tests for a separate suite that runs against a real Postgres instance (CI or Docker Compose). These should apply migrations and seeders before running.

CI notes
- The existing CI workflow runs lint/build/test for the backend. Add a separate `e2e` job if you want full integration tests; that job should include a Postgres service and set environment variables for DB and JWT.

If you want, I can add a sample GitHub Actions e2e job next.
