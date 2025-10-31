import { Module } from '@nestjs/common';
import { KpisController } from './kpis/kpis.controller';
import { AnalysisService } from './analysis/analysis.service';

@Module({
  controllers: [KpisController],
  providers: [AnalysisService],
})
export class AnalyticsModule {}
