// backend/src/api/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// This interface matches the payload we created in AuthService.login()
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  roles: string[];
  tenantId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || '',
    });
  }

  // If the token signature is valid, Passport calls this method.
  // Whatever we return here gets attached to `request.user`.
  validate(payload: JwtPayload) {
    console.log('payload', payload);
    if (!payload.tenantId) {
      throw new UnauthorizedException('Token is missing Tenant ID');
    }

    // This object becomes 'request.user' in our Controllers
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      tenantId: payload.tenantId, // <--- CRITICAL: We need this for every query
    };
  }
}
