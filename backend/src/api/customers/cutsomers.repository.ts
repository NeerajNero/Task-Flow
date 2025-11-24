// backend/src/db/customers/customers.repository.ts
import { Injectable } from '@nestjs/common';
import { DbService } from '../../db/db.service';
import { Prisma, Customer } from '@prisma/client';

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: DbService) {}

  // 1. Create Customer (Linked to Tenant)
  async createCustomer(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return this.prisma.customer.create({
      data,
    });
  }

  // 2. Find All Customers (CRITICAL: Filter by Tenant)
  async findAllByTenant(tenantId: string): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      where: {
        tenantId: tenantId, // <--- THE SECURITY FILTER
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 3. Count Customers
  async count(tenantId: string): Promise<number> {
    return this.prisma.customer.count({
      where: { tenantId },
    });
  }
}
