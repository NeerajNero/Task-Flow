import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { Prisma, Ticket, TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: DbService) {}

  // 1. Create Ticket (Linked to Tenant AND Customer)
  async createTicket(data: Prisma.TicketCreateInput): Promise<Ticket> {
    return this.prisma.ticket.create({
      data,
      include: { Customer: true }, // Return the customer details with the ticket
    });
  }

  // 2. Find All (Filtered by Tenant)
  async findAll(tenantId: string, status?: TicketStatus): Promise<Ticket[]> {
    const where: Prisma.TicketWhereInput = { tenantId };

    // Optional filter: If status is provided, add it to the query
    if (status) {
      where.status = status;
    }

    return this.prisma.ticket.findMany({
      where,
      include: { Customer: true }, // Always nice to see who opened the ticket
      orderBy: { createdAt: 'desc' },
    });
  }

  // 3. Find One (Security: Must match TenantId)
  async findOne(ticketId: string, tenantId: string): Promise<Ticket | null> {
    return this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        tenantId: tenantId, // <--- Critical Security Check
      },
      include: { Customer: true },
    });
  }

  async update(
    ticketId: string,
    tenantId: string, // Security: Ensure tenant owns ticket
    data: Prisma.TicketUpdateInput,
  ): Promise<Ticket> {
    // We use updateMany ensures we verify tenantId AND id in one query
    // (Prisma's simple .update only allows ID)
    const result = await this.prisma.ticket.updateMany({
      where: {
        id: ticketId,
        tenantId: tenantId,
      },
      data,
    });

    if (result.count === 0) {
      // If count is 0, either ticket doesn't exist OR it belongs to another tenant
      throw new Error('TicketNotFound');
    }

    // Fetch and return the updated record
    return this.findOne(ticketId, tenantId) as Promise<Ticket>;
  }

  // 4. Get Ticket Stats (Group By Status)
  async getStats(tenantId: string) {
    // This asks Postgres to do: SELECT status, COUNT(*) FROM Ticket GROUP BY status
    return this.prisma.ticket.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: {
        _all: true,
      },
    });
  }
}
