import { forwardRef, Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsQueueModule } from '../../background/queues/tickets-queue/tickets-queue.module';

@Module({
  imports: [forwardRef(() => TicketsQueueModule)],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
