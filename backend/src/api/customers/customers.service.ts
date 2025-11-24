// backend/src/api/customers/customers.service.ts
import { Injectable } from '@nestjs/common';
import { CustomersDbService } from './customers-db.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly dbService: CustomersDbService) {}

  // 1. Create a Customer
  // Notice: We REQUIRE tenantId here. The controller must provide it.
  async create(tenantId: string, dto: CreateCustomerDto): Promise<Customer> {
    return this.dbService.createCustomer(tenantId, dto.name, dto.email);
  }

  // 2. List All Customers for a Tenant
  async findAll(tenantId: string): Promise<Customer[]> {
    return this.dbService.getCustomers(tenantId);
  }
}
