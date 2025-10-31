import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  // Para seeders ejecutados fuera de Docker, usar localhost
  if (!process.env.DB_HOST || process.env.DB_HOST === 'postgres') {
    process.env.DB_HOST = 'localhost';
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const seederModule = app.select(SeederModule);
  const seederService = seederModule.get(SeederService);

  try {
    await seederService.seedAll();
  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    throw error;
  } finally {
    await app.close();
  }
}

void bootstrap();
