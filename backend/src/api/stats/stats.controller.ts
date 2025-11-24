import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Dashboard Stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Stats returned successfully.' })
  getStats(@User('tenantId') tenantId: string) {
    return this.statsService.getDashboardStats(tenantId);
  }
}
