import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
// Note: We don't need to import DbModule because it is @Global()

@Module({
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
