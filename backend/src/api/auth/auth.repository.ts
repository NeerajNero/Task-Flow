import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private prisma: DbService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUserWithTenant(
    userData: Prisma.UserCreateInput,
    tenantName: string,
  ): Promise<User> {
    // TRANSACTION: Create Tenant AND User together
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: { name: tenantName },
      });

      // 2. Create User linked to Tenant
      const user = await tx.user.create({
        data: {
          email: userData.email,
          password: userData.password,
          roles: userData.roles,
          tenantId: tenant.id,
        },
      });

      return user;
    });
  }
}
