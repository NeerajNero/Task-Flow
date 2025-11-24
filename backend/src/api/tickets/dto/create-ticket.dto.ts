import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ example: 'Login issue', description: 'Title of the ticket' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'I cannot reset my password',
    description: 'Detailed description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'uuid-of-customer',
    description: 'The ID of the customer having the issue',
  })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;
}
