import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the customer',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
