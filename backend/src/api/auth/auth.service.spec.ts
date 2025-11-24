// backend/src/api/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthDbService } from './auth-db.service';
import { HashingService } from '../../common/services/hashing.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client'; // Ensure you import the Enum

// --- MOCK DATA ---
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  password: 'hashed-password',
  roles: ['admin'] as UserRole[],
  tenantId: 'tenant-123',
};

const mockToken = 'mock-jwt-token';

// --- MOCKS ---
const mockAuthDbService = {
  createUserWithTenant: jest.fn(),
  findUserByEmail: jest.fn(),
};

const mockHashingService = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let dbService: AuthDbService;
  let hashingService: HashingService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthDbService, useValue: mockAuthDbService },
        { provide: HashingService, useValue: mockHashingService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    dbService = module.get<AuthDbService>(AuthDbService);
    hashingService = module.get<HashingService>(HashingService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  // 1. TEST REGISTRATION
  describe('registerUser', () => {
    it('should hash password, create user/tenant, and return token', async () => {
      // Arrange
      const dto = {
        email: 'test@example.com',
        password: 'plain-password',
        tenantName: 'Test Corp',
      };

      mockHashingService.hash.mockResolvedValue('hashed-password');
      mockAuthDbService.createUserWithTenant.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken); // Mock the token generation

      // Act
      const result = await service.registerUser(dto);

      // Assert
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(hashingService.hash).toHaveBeenCalledWith(dto.password);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(dbService.createUserWithTenant).toHaveBeenCalledWith(
        expect.objectContaining({
          email: dto.email,
          password: 'hashed-password',
          roles: ['admin'],
        }),
        dto.tenantName,
      );
      // Verify it returns the structure { user, access_token }
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          roles: mockUser.roles,
          tenantId: mockUser.tenantId,
        },
        access_token: mockToken,
      });
    });
  });

  // 2. TEST LOGIN VALIDATION
  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      mockAuthDbService.findUserByEmail.mockResolvedValue(mockUser);
      mockHashingService.compare.mockResolvedValue(true);

      const result = await service.validateUser({
        email: 'test@example.com',
        password: 'pw',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw Unauthorized if password does not match', async () => {
      mockAuthDbService.findUserByEmail.mockResolvedValue(mockUser);
      mockHashingService.compare.mockResolvedValue(false);

      await expect(
        service.validateUser({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFound if user does not exist', async () => {
      mockAuthDbService.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser({ email: 'missing@example.com', password: 'pw' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
