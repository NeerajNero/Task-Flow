/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
// backend/src/api/auth/auth.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthDbService } from './auth-db.service';
import { HashingService } from '../../common/services/hashing.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

// Define the clean, final structure of what the API returns on success
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    roles: string[];
    tenantId: string;
  };
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: AuthDbService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
  ) {}

  // 1. REGISTRATION (FIXED: Chains to login flow and matches return type)
  async registerUser(dto: RegisterDto): Promise<AuthResponse> {
    // <-- CHANGED RETURN TYPE
    const hashedPassword = await this.hashingService.hash(dto.password);

    // Create the user and tenant atomically
    const newUser = await this.dbService.createUserWithTenant(
      {
        email: dto.email,
        password: hashedPassword,
        roles: ['admin'],
        Tenant: {
          create: undefined,
          connectOrCreate: undefined,
          connect: undefined,
        },
      },
      dto.tenantName,
    );

    // CRITICAL FIX: Log the user in immediately after successful creation
    return this.login(newUser); // <-- CHAINED CALL
  }

  // 2. VALIDATION (Used internally by the login process)
  async validateUser({ email, password }: LoginDto): Promise<User> {
    const user = await this.dbService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isPasswordValid = await this.hashingService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    return user;
  }

  // 3. TOKEN GENERATION (Updated to match the new AuthResponse interface)
  async login(user: User): Promise<AuthResponse> {
    // <-- ADDED RETURN TYPE
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    };

    // We must return a clean user object, without the password hash.
    const cleanUser = {
      id: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    };

    return {
      user: cleanUser,
      access_token: this.jwtService.sign(payload),
    };
  }
}
