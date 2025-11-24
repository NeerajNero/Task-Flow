/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { TicketsDbService } from '../tickets/tickets-db.service';
import { CustomersDbService } from '../customers/customers-db.service';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(
    private readonly ticketsDb: TicketsDbService,
    private readonly customersDb: CustomersDbService,
  ) {}

  async getDashboardStats(tenantId: string) {
    // 1. Run both queries in parallel for performance
    const [ticketGroups, totalCustomers] = await Promise.all([
      this.ticketsDb.getTicketStats(tenantId),
      this.customersDb.countCustomers(tenantId),
    ]);

    // 2. Format Ticket Stats (Convert array to object)
    // The DB returns: [{ status: 'OPEN', _count: { _all: 5 } }, ...]
    // We want: { open: 5, resolved: 0, ... }

    const stats = {
      totalTickets: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      totalCustomers,
    };

    ticketGroups.forEach((group) => {
      const count = (group as any)?._count?._all || 0;
      stats.totalTickets += count;

      if (group?.status === TicketStatus.OPEN) stats.open = count;
      if (group?.status === TicketStatus.IN_PROGRESS) stats.inProgress = count;
      if (group?.status === TicketStatus.RESOLVED) stats.resolved = count;
    });

    return stats;
  }
}
