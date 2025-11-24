import { Module } from '@nestjs/common';
import { LoggerModule } from './logger/logger.module';
import { DbModule } from './db/db.module';
import { EnvConfigModule } from './config/env-config.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './api/auth/auth.module';
import { CustomersModule } from './api/customers/customers.module';
import { TicketsQueueModule } from './background/queues/tickets-queue/tickets-queue.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { TicketsModule } from './api/tickets/tickets.module';
import { StatsModule } from './api/stats/stats.module';

@Module({
  imports: [
    EnvConfigModule,
    LoggerModule,
    DbModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60,
        limit: 15,
      },
    ]),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    AuthModule,
    CustomersModule,
    TicketsQueueModule,
    TicketsModule,
    StatsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
