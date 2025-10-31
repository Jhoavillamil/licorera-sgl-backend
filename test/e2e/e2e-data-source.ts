import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Cargar variables de entorno para tests
config({ path: '.env.test' });

export const E2EDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USER || 'test_user',
  password: process.env.DB_PASS || 'test_pass',
  database: process.env.DB_NAME || 'sgl_test',
  entities: [__dirname + '/../src/entities/**/*.entity{.ts,.js}'],
  synchronize: true, // Solo para tests
  dropSchema: true // Limpiar DB entre tests
});