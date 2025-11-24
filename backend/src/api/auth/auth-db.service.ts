import { Injectable, ConflictException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthDbService {
  constructor(private authRepository: AuthRepository) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.authRepository.findUserByEmail(email);
  }

  async createUserWithTenant(
    userData: Prisma.UserCreateInput,
    tenantName: string,
  ): Promise<User> {
    try {
      return await this.authRepository.createUserWithTenant(
        userData,
        tenantName,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A user with this email already exists.');
      }
      throw error;
    }
  }
}
