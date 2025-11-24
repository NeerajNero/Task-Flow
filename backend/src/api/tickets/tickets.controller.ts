import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';
import {
  AssignTicketDto,
  UpdateTicketStatusDto,
} from './dto/update-ticket.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // 1. CREATE TICKET
  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully.' })
  create(
    @User('tenantId') tenantId: string,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.ticketsService.create(tenantId, createTicketDto);
  }

  // 2. LIST TICKETS
  @Get()
  @ApiOperation({ summary: 'List all tickets (Optional: filter by status)' })
  @ApiQuery({ name: 'status', enum: TicketStatus, required: false }) // Swagger Doc
  findAll(
    @User('tenantId') tenantId: string,
    @Query('status') status?: TicketStatus, // Extract ?status=OPEN
  ) {
    return this.ticketsService.findAll(tenantId, status);
  }

  // 3. GET ONE TICKET
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific ticket' })
  findOne(@User('tenantId') tenantId: string, @Param('id') id: string) {
    return this.ticketsService.findOne(tenantId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  @Roles('admin', 'agent')
  updateStatus(
    @User('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ticketsService.updateStatus(tenantId, id, dto);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign ticket to an agent' })
  @Roles('admin')
  assignTicket(
    @User('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: AssignTicketDto,
  ) {
    return this.ticketsService.assignTicket(tenantId, id, dto);
  }
}
