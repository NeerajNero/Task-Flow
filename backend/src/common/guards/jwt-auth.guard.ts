// backend/src/common/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This simplifies the usage. Instead of @UseGuards(AuthGuard('jwt')),
// we can just use @UseGuards(JwtAuthGuard)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
