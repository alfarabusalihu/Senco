import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, ReportStatus } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report (Draft or direct Submit)' })
  @ApiResponse({ status: 201, description: 'Report successfully created.' })
  async create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reportsService.create(createReportDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all weekly reports (with filters)' })
  @ApiQuery({ name: 'weekNumber', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user (Manager only)',
  })
  @ApiQuery({ name: 'projectId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 6)',
  })
  @ApiResponse({ status: 200, description: 'Reports list retrieved.' })
  async findAll(
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') role: Role,
    @Query('weekNumber') weekNumber?: string,
    @Query('year') year?: string,
    @Query('userId') filterUserId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: ReportStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      weekNumber: weekNumber ? parseInt(weekNumber, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      userId: filterUserId,
      projectId,
      status,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };
    return this.reportsService.findAll(currentUserId, role, filters);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get current user report history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully.' })
  async getHistory(@CurrentUser('id') userId: string) {
    return this.reportsService.getHistory(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific report' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully.' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.reportsService.findOne(id, userId, role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report details (Draft only)' })
  @ApiResponse({ status: 200, description: 'Report successfully updated.' })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.reportsService.update(id, updateReportDto, userId, role);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit a draft report' })
  @ApiResponse({ status: 200, description: 'Report successfully submitted.' })
  async submit(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.reportsService.submit(id, userId, role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a report' })
  @ApiResponse({ status: 200, description: 'Report successfully deleted.' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    await this.reportsService.remove(id, userId, role);
    return { success: true };
  }
}
