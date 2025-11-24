import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the tenant' })
  tenantName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty()
  @ApiProperty({ description: 'The password of the user' })
  password: string;
}
