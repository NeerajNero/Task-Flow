import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class TicketsQueueService {
  constructor(@InjectQueue('tickets-events') private ticketsQueue: Queue) {}

  async addTicketCreatedJob(ticketId: string, tenantId: string, email: string) {
    // We add a job named 'TICKET_CREATED' to the queue
    await this.ticketsQueue.add('TICKET_CREATED', {
      ticketId,
      tenantId,
      email,
      timestamp: new Date(),
    });
  }
}
