/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, ConflictException } from '@nestjs/common';
import { CustomersRepository } from './cutsomers.repository';
import { Customer } from '@prisma/client';

@Injectable()
export class CustomersDbService {
  constructor(private readonly repository: CustomersRepository) {}

  async createCustomer(
    tenantId: string,
    name: string,
    email: string,
  ): Promise<Customer> {
    try {
      return await this.repository.createCustomer({
        name,
        email,
        Tenant: { connect: { id: tenantId } }, // Link to Tenant
      });
    } catch (error: any) {
      // Check for Unique Constraint (email + tenantId)
      if (error?.code === 'P2002') {
        throw new ConflictException(
          'A customer with this email already exists for your tenant.',
        );
      }
      throw error;
    }
  }

  async getCustomers(tenantId: string): Promise<Customer[]> {
    return this.repository.findAllByTenant(tenantId);
  }

  async countCustomers(tenantId: string): Promise<number> {
    return this.repository.count(tenantId);
  }
}
