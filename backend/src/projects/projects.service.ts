import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectStatus, ActivityAction } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProjectDto: CreateProjectDto,
    managerId: string,
  ): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name.trim(),
        description: createProjectDto.description?.trim(),
        managerId,
      },
    });

    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        userId: managerId,
        action: ActivityAction.PROJECT_CREATED,
        entityType: 'Project',
        entityId: project.id,
        metadata: { name: project.name },
      },
    });

    return project;
  }

  async findAll(status?: ProjectStatus): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: status ? { status } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found.`);
    }
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    managerId: string,
  ): Promise<Project> {
    await this.findOne(id); // Ensure project exists

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        name: updateProjectDto.name?.trim(),
        description: updateProjectDto.description?.trim(),
        status: updateProjectDto.status,
      },
    });

    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        userId: managerId,
        action: ActivityAction.PROJECT_UPDATED,
        entityType: 'Project',
        entityId: project.id,
        metadata: { name: project.name, status: project.status },
      },
    });

    return project;
  }

  async remove(id: string, managerId: string): Promise<void> {
    const project = await this.findOne(id);

    // Permanently delete the project (reports will be cascade deleted per schema)
    await this.prisma.project.delete({
      where: { id },
    });

    // Create activity log
    await this.prisma.activityLog.create({
      data: {
        userId: managerId,
        action: ActivityAction.PROJECT_ARCHIVED,
        entityType: 'Project',
        entityId: project.id,
        metadata: { name: project.name, action: 'deleted' },
      },
    });
  }
}
