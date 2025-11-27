import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TicketsQueueService } from './tickets-queue.service';
import { TicketsProcessor } from './tickets.processor';
import { LoggerModule } from '../../../logger/logger.module';

@Module({
  imports: [
    // Register the specific queue
    BullModule.registerQueue({
      name: 'tickets-events',
    }),
    LoggerModule,
  ],
  providers: [
    TicketsQueueService, // The Producer (adds jobs)
    TicketsProcessor, // The Consumer (processes jobs)
  ],
  exports: [
    TicketsQueueService, // Export the service so TicketsModule can use it
  ],
})
export class TicketsQueueModule {}
