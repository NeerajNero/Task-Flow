// backend/src/api/customers/customers.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Customers') // Group in Swagger
@ApiBearerAuth() // Tell Swagger this API needs a Bearer Token
@UseGuards(JwtAuthGuard) // Protect ALL endpoints in this controller
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // 1. CREATE CUSTOMER
  @Post()
  @ApiOperation({ summary: 'Create a new customer for your tenant' })
  @ApiResponse({ status: 201, description: 'Customer created successfully.' })
  @ApiResponse({ status: 409, description: 'Customer email already exists.' })
  create(
    @User('tenantId') tenantId: string, // <-- Magic: Auto-extract tenantId
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customersService.create(tenantId, createCustomerDto);
  }

  // 2. LIST CUSTOMERS
  @Get()
  @ApiOperation({ summary: 'List all customers for your tenant' })
  @ApiResponse({ status: 200, description: 'List of customers.' })
  findAll(@User('tenantId') tenantId: string) {
    return this.customersService.findAll(tenantId);
  }
}
