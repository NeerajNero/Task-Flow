/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { TicketsDbService } from './tickets-db.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket, TicketStatus } from '@prisma/client';
import { UpdateTicketStatusDto } from './dto/update-ticket.dto';
import { AssignTicketDto } from './dto/update-ticket.dto';
import { TicketsQueueService } from 'src/background/queues/tickets-queue/tickets-queue.service';

@Injectable()
export class TicketsService {
  constructor(
    private readonly dbService: TicketsDbService,
    private readonly ticketsQueueService: TicketsQueueService,
  ) {}

  // 1. Create a Ticket
  // We rely on the Controller to give us the secure tenantId
  async create(tenantId: string, dto: CreateTicketDto): Promise<Ticket> {
    const ticket = await this.dbService.createTicket(
      tenantId,
      dto.customerId,
      dto.title,
      dto.description,
    );
    const customerEmail = (ticket as any).Customer?.email;

    await this.ticketsQueueService.addTicketCreatedJob(
      ticket.id,
      tenantId,
      customerEmail,
    );

    return ticket;
  }

  // 2. Find All (with optional status filter)
  async findAll(tenantId: string, status?: TicketStatus): Promise<Ticket[]> {
    return this.dbService.getTickets(tenantId, status);
  }

  // 3. Find One
  async findOne(tenantId: string, ticketId: string): Promise<Ticket> {
    return this.dbService.getTicketById(ticketId, tenantId);
  }

  async updateStatus(
    tenantId: string,
    ticketId: string,
    dto: UpdateTicketStatusDto,
  ) {
    return this.dbService.updateStatus(ticketId, tenantId, dto.status);
  }

  async assignTicket(tenantId: string, ticketId: string, dto: AssignTicketDto) {
    return this.dbService.assignTicket(ticketId, tenantId, dto.assignedTo);
  }
}
