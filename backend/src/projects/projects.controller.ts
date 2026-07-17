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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ProjectStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Create a new project (Manager/Admin)' })
  @ApiResponse({ status: 201, description: 'Project successfully created.' })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('id') managerId: string,
  ) {
    return this.projectsService.create(createProjectDto, managerId);
  }

  @Get()
  @ApiOperation({ summary: 'List all projects' })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus })
  @ApiResponse({ status: 200, description: 'Projects list retrieved.' })
  async findAll(@Query('status') status?: ProjectStatus) {
    return this.projectsService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific project' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully.' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Update project details (Manager/Admin)' })
  @ApiResponse({ status: 200, description: 'Project successfully updated.' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('id') managerId: string,
  ) {
    return this.projectsService.update(id, updateProjectDto, managerId);
  }

  @Delete(':id')
  @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Archive/Delete project (Manager/Admin)' })
  @ApiResponse({ status: 200, description: 'Project successfully archived.' })
  async remove(@Param('id') id: string, @CurrentUser('id') managerId: string) {
    await this.projectsService.remove(id, managerId);
    return { success: true };
  }
}
