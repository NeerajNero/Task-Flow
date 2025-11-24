/* eslint-disable @typescript-eslint/require-await */
// backend/src/api/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HashingService } from '../../common/services/hashing.service';
import { JwtModule } from '@nestjs/jwt'; // <-- For token generation
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Configure JWT globally using secrets from ConfigService
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' }, // Access token expiration
      }),
    }),
  ],
  providers: [AuthService, HashingService, JwtStrategy],
  controllers: [AuthController], // <-- Controller will be added next
  exports: [AuthService, JwtModule], // <-- Export services so other modules can use them
})
export class AuthModule {}
