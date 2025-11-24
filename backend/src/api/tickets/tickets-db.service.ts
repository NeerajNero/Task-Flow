/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { TicketsRepository } from './tickets.repository';
import { Ticket, TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsDbService {
  constructor(private readonly repository: TicketsRepository) {}

  async createTicket(
    tenantId: string,
    customerId: string,
    title: string,
    description: string,
  ): Promise<Ticket> {
    // Note: We don't need to check if Customer exists here because
    // Prisma will throw a foreign key error if the ID is wrong.
    // We could catch that error here if we wanted a custom message.

    return this.repository.createTicket({
      title,
      description,
      status: 'OPEN', // Default status
      Tenant: { connect: { id: tenantId } },
      Customer: { connect: { id: customerId } },
    });
  }

  async getTickets(tenantId: string, status?: TicketStatus): Promise<Ticket[]> {
    return this.repository.findAll(tenantId, status);
  }

  async getTicketById(ticketId: string, tenantId: string): Promise<Ticket> {
    const ticket = await this.repository.findOne(ticketId, tenantId);

    if (!ticket) {
      throw new NotFoundException('Ticket not found or access denied');
    }

    return ticket;
  }

  async updateStatus(ticketId: string, tenantId: string, status: TicketStatus) {
    try {
      return await this.repository.update(ticketId, tenantId, { status });
    } catch (error) {
      if (error.message === 'TicketNotFound') {
        throw new NotFoundException('Ticket not found or access denied');
      }
      throw error;
    }
  }

  async assignTicket(ticketId: string, tenantId: string, assignedTo: string) {
    try {
      // In a real app, you might check if 'assignedTo' is a valid User ID here
      return await this.repository.update(ticketId, tenantId, { assignedTo });
    } catch (error) {
      if (error.message === 'TicketNotFound') {
        throw new NotFoundException('Ticket not found or access denied');
      }
      throw error;
    }
  }

  async getTicketStats(tenantId: string) {
    return this.repository.getStats(tenantId);
  }
}
