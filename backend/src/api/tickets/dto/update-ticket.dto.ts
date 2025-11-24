import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '@prisma/client';

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus, example: 'IN_PROGRESS' })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}

export class AssignTicketDto {
  @ApiProperty({
    example: 'uuid-of-agent',
    description: 'User ID of the Agent',
  })
  @IsUUID()
  @IsNotEmpty()
  assignedTo: string;
}
