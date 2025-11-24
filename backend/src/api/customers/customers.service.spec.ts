/* eslint-disable @typescript-eslint/unbound-method */
// backend/src/api/customers/customers.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { CustomersDbService } from './customers-db.service';

// --- MOCK DATA ---
const mockTenantId = 'tenant-123';
const mockCustomerDto = {
  name: 'Test Client',
  email: 'test@client.com',
};

const mockCustomerResult = {
  id: 'cust-1',
  ...mockCustomerDto,
  tenantId: mockTenantId,
  createdAt: new Date(),
};

// --- MOCK DEPENDENCY ---
const mockCustomersDbService = {
  createCustomer: jest.fn(),
  getCustomers: jest.fn(),
};

describe('CustomersService', () => {
  let service: CustomersService;
  let dbService: CustomersDbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: CustomersDbService, useValue: mockCustomersDbService },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    dbService = module.get<CustomersDbService>(CustomersDbService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 1. TEST CREATE
  describe('create', () => {
    it('should call dbService.createCustomer with correct args', async () => {
      // Arrange
      mockCustomersDbService.createCustomer.mockResolvedValue(
        mockCustomerResult,
      );

      // Act
      const result = await service.create(mockTenantId, mockCustomerDto);

      // Assert
      // This ensures the tenantId was passed down correctly
      expect(dbService.createCustomer).toHaveBeenCalledWith(
        mockTenantId,
        mockCustomerDto.name,
        mockCustomerDto.email,
      );
      expect(result).toEqual(mockCustomerResult);
    });
  });

  // 2. TEST FIND ALL
  describe('findAll', () => {
    it('should call dbService.getCustomers with tenantId', async () => {
      // Arrange
      const mockList = [mockCustomerResult];
      mockCustomersDbService.getCustomers.mockResolvedValue(mockList);

      // Act
      const result = await service.findAll(mockTenantId);

      // Assert
      // This ensures we didn't forget the tenant filter
      expect(dbService.getCustomers).toHaveBeenCalledWith(mockTenantId);
      expect(result).toEqual(mockList);
    });
  });
});
