import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuleParam } from '../../entities/rule-param/rule-param.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RuleParam])],
  exports: [TypeOrmModule],
})
export class RulesParamsModule {}

