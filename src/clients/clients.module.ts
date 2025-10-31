import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../entities/cliente/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente])],
  exports: [TypeOrmModule],
})
export class ClientsModule {}
