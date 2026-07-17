import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get dashboard summary metrics (Manager/Admin)' })
  @ApiQuery({ name: 'weekNumber', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Summary statistics retrieved.' })
  async getSummary(
    @Query('weekNumber') weekNumber?: string,
    @Query('year') year?: string,
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      weekNumber: weekNumber ? parseInt(weekNumber, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      projectId,
      userId,
      startDate,
      endDate,
    };
    return this.dashboardService.getSummary(filters);
  }

  @Get('charts')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get dashboard charts data (Manager/Admin)' })
  @ApiQuery({ name: 'weekNumber', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Chart aggregation data retrieved.',
  })
  async getCharts(
    @Query('weekNumber') weekNumber?: string,
    @Query('year') year?: string,
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      weekNumber: weekNumber ? parseInt(weekNumber, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      projectId,
      userId,
      startDate,
      endDate,
    };
    return this.dashboardService.getCharts(filters);
  }

  @Get('activity')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Get recent activity feed (Manager/Admin)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Activity feed retrieved.' })
  async getActivityFeed(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 15;
    return this.dashboardService.getActivityFeed(lim);
  }

  @Get('overview')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({
    summary: 'Get complete dashboard overview (aggregated - Manager only)',
  })
  @ApiQuery({ name: 'weekNumber', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'activityLimit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Complete dashboard data retrieved in a single call.',
  })
  async getOverview(
    @Query('weekNumber') weekNumber?: string,
    @Query('year') year?: string,
    @Query('projectId') projectId?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityLimit') activityLimit?: string,
  ) {
    const filters = {
      weekNumber: weekNumber ? parseInt(weekNumber, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      projectId,
      userId,
      startDate,
      endDate,
    };
    const activityLim = activityLimit ? parseInt(activityLimit, 10) : 5;

    return this.dashboardService.getOverview(filters, activityLim);
  }
}
