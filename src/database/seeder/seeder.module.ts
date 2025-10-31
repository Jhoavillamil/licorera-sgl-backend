import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user/user.entity';
import { Role } from '../../entities/role/role';
import { Supplier } from '../../entities/supplier/supplier.entity';
import { RuleParam } from '../../entities/rule-param/rule-param.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Supplier, RuleParam])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
