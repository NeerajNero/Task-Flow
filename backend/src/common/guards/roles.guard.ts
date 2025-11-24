/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. What roles are required for this route?
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, let them pass
    if (!requiredRoles) {
      return true;
    }

    // 2. Who is the user?
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user?.roles) {
      throw new ForbiddenException('Access denied: No roles found');
    }

    // 3. Does the user have AT LEAST ONE of the required roles?
    const hasRole = requiredRoles.some((role) => user?.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Access denied: Insufficient permissions');
    }

    return true;
  }
}
