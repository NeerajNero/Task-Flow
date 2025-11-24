/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { LoggerService } from '../../../logger/logger.service';
import { DbService } from '../../../db/db.service';

@Processor('tickets-events')
export class TicketsProcessor extends WorkerHost {
  constructor(
    private readonly logger: LoggerService,
    private readonly dbService: DbService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(
      `[Worker] Processing job ${job.name} for Ticket ${job?.data?.ticketId}`,
    );

    switch (job.name) {
      case 'TICKET_CREATED':
        return this.handleTicketCreated(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleTicketCreated(data: any) {
    // 1. Simulate sending an email (Log it for now)
    this.logger.log(`📧 SENDING EMAIL TO: ${data.email} - "Ticket Created!"`);

    // 2. Write to the NotificationLog table in the DB
    await this.dbService.notificationLog.create({
      data: {
        message: `Ticket created for customer ${data.email}`,
        tenantId: data.tenantId,
        ticketId: data.ticketId,
      },
    });

    this.logger.log(`✅ Notification log saved for Ticket ${data.ticketId}`);
  }
}
