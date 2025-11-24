// backend/src/api/auth/auth.controller.ts
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication') // Groups these endpoints in Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 1. REGISTER
  @Post('register')
  @ApiOperation({ summary: 'Register a new Tenant and Admin User' })
  @ApiResponse({
    status: 201,
    description: 'Tenant and User created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation Error (e.g. weak password)',
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.registerUser(dto);
  }

  // 2. LOGIN
  @Post('login')
  @HttpCode(HttpStatus.OK) // Login should be 200 OK, not 201 Created
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access token.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    // 1. Validate the credentials against the DB
    const user = await this.authService.validateUser(dto);

    // 2. Generate the token
    return this.authService.login(user);
  }
}
