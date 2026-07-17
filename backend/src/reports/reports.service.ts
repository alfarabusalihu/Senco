import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import {
  WeeklyReport,
  ReportStatus,
  Role,
  ActivityAction,
} from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to check if a report submission is late.
   * A report is late if submitted after the end date of that week.
   */
  private checkIsLate(endDateStr: string): boolean {
    const end = new Date(endDateStr);
    const now = new Date();
    // Allow a grace period of 2 days (e.g., until Sunday midnight if week ends Friday)
    const graceTime = end.getTime() + 2 * 24 * 60 * 60 * 1000;
    return now.getTime() > graceTime;
  }

  async create(
    createReportDto: CreateReportDto,
    userId: string,
  ): Promise<WeeklyReport> {
    // Check if project exists and is active
    const project = await this.prisma.project.findUnique({
      where: { id: createReportDto.projectId },
    });
    if (!project) {
      throw new NotFoundException('Selected project does not exist.');
    }

    // Check if report already exists for user-week-year
    const existing = await this.prisma.weeklyReport.findUnique({
      where: {
        userId_weekNumber_year: {
          userId,
          weekNumber: createReportDto.weekNumber,
          year: createReportDto.year,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        `A weekly report already exists for Week ${createReportDto.weekNumber}, ${createReportDto.year}.`,
      );
    }

    const isSubmission = !!createReportDto.submit;
    let status: ReportStatus = ReportStatus.DRAFT;
    let submittedAt: Date | null = null;

    if (isSubmission) {
      const isLate = this.checkIsLate(createReportDto.endDate);
      status = isLate ? ReportStatus.LATE : ReportStatus.SUBMITTED;
      submittedAt = new Date();
    }

    const report = await this.prisma.weeklyReport.create({
      data: {
        userId,
        projectId: createReportDto.projectId,
        weekNumber: createReportDto.weekNumber,
        year: createReportDto.year,
        startDate: new Date(createReportDto.startDate),
        endDate: new Date(createReportDto.endDate),
        tasksCompleted: createReportDto.tasksCompleted.trim(),
        tasksPlanned: createReportDto.tasksPlanned.trim(),
        blockers: createReportDto.blockers?.trim(),
        hoursWorked: createReportDto.hoursWorked,
        notes: createReportDto.notes?.trim(),
        status,
        submittedAt,
      },
      include: {
        project: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: isSubmission
          ? ActivityAction.REPORT_SUBMITTED
          : ActivityAction.REPORT_CREATED,
        entityType: 'WeeklyReport',
        entityId: report.id,
        metadata: { weekNumber: report.weekNumber, year: report.year },
      },
    });

    return report;
  }

  async findOne(id: string, userId: string, role: Role): Promise<WeeklyReport> {
    const report = await this.prisma.weeklyReport.findUnique({
      where: { id },
      include: {
        project: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID "${id}" not found.`);
    }

    // Role-based access check: Team members can only view their own reports
    if (role === Role.TEAM_MEMBER && report.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this report.',
      );
    }

    return report;
  }

  async update(
    id: string,
    updateReportDto: UpdateReportDto,
    userId: string,
    role: Role,
  ): Promise<WeeklyReport> {
    const report = await this.findOne(id, userId, role);

    // Only drafts can be modified
    if (report.status !== ReportStatus.DRAFT) {
      throw new BadRequestException('Only draft reports can be modified.');
    }

    // Project check if updated
    if (updateReportDto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: updateReportDto.projectId },
      });
      if (!project) {
        throw new NotFoundException('Selected project does not exist.');
      }
    }

    const isSubmission = !!updateReportDto.submit;
    let status: ReportStatus = report.status;
    let submittedAt = report.submittedAt;

    if (isSubmission) {
      const endDate = updateReportDto.endDate
        ? updateReportDto.endDate
        : report.endDate.toISOString();
      const isLate = this.checkIsLate(endDate);
      status = isLate ? ReportStatus.LATE : ReportStatus.SUBMITTED;
      submittedAt = new Date();
    }

    const updated = await this.prisma.weeklyReport.update({
      where: { id },
      data: {
        projectId: updateReportDto.projectId,
        weekNumber: updateReportDto.weekNumber,
        year: updateReportDto.year,
        startDate: updateReportDto.startDate
          ? new Date(updateReportDto.startDate)
          : undefined,
        endDate: updateReportDto.endDate
          ? new Date(updateReportDto.endDate)
          : undefined,
        tasksCompleted: updateReportDto.tasksCompleted?.trim(),
        tasksPlanned: updateReportDto.tasksPlanned?.trim(),
        blockers:
          updateReportDto.blockers !== undefined
            ? updateReportDto.blockers?.trim()
            : undefined,
        hoursWorked: updateReportDto.hoursWorked,
        notes:
          updateReportDto.notes !== undefined
            ? updateReportDto.notes?.trim()
            : undefined,
        status,
        submittedAt,
      },
      include: {
        project: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: isSubmission
          ? ActivityAction.REPORT_SUBMITTED
          : ActivityAction.REPORT_UPDATED,
        entityType: 'WeeklyReport',
        entityId: updated.id,
        metadata: {
          weekNumber: updated.weekNumber,
          year: updated.year,
          isSubmission,
        },
      },
    });

    return updated;
  }

  async submit(id: string, userId: string, role: Role): Promise<WeeklyReport> {
    const report = await this.findOne(id, userId, role);

    if (report.status !== ReportStatus.DRAFT) {
      throw new BadRequestException('This report has already been submitted.');
    }

    const isLate = this.checkIsLate(report.endDate.toISOString());
    const status = isLate ? ReportStatus.LATE : ReportStatus.SUBMITTED;

    const submitted = await this.prisma.weeklyReport.update({
      where: { id },
      data: {
        status,
        submittedAt: new Date(),
      },
      include: {
        project: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: ActivityAction.REPORT_SUBMITTED,
        entityType: 'WeeklyReport',
        entityId: submitted.id,
        metadata: { weekNumber: submitted.weekNumber, year: submitted.year },
      },
    });

    return submitted;
  }

  async findAll(
    userId: string,
    role: Role,
    filters: {
      weekNumber?: number;
      year?: number;
      userId?: string;
      projectId?: string;
      status?: ReportStatus;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    reports: WeeklyReport[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const whereClause: any = {};

    // Standard security filter: team members can only view their own
    if (role === Role.TEAM_MEMBER) {
      whereClause.userId = userId;
    } else if (role === Role.PROJECT_MANAGER) {
      // Project Managers can only see TEAM_MEMBER reports, not ADMINISTRATOR reports
      whereClause.user = {
        role: Role.TEAM_MEMBER,
      };
      // Allow filtering by specific user (must be TEAM_MEMBER)
      if (filters.userId) {
        whereClause.userId = filters.userId;
      }
    } else if (role === Role.ADMINISTRATOR) {
      // Administrators can see all reports (TEAM_MEMBER and PROJECT_MANAGER)
      if (filters.userId) {
        whereClause.userId = filters.userId;
      }
    }

    if (filters.weekNumber) whereClause.weekNumber = filters.weekNumber;
    if (filters.year) whereClause.year = filters.year;
    if (filters.projectId) whereClause.projectId = filters.projectId;
    if (filters.status) whereClause.status = filters.status;

    if (filters.startDate || filters.endDate) {
      whereClause.startDate = {};
      if (filters.startDate)
        whereClause.startDate.gte = new Date(filters.startDate);
      if (filters.endDate)
        whereClause.startDate.lte = new Date(filters.endDate);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 6;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.prisma.weeklyReport.findMany({
        where: whereClause,
        include: {
          project: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: [
          { year: 'desc' },
          { weekNumber: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      this.prisma.weeklyReport.count({ where: whereClause }),
    ]);

    return {
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHistory(userId: string): Promise<WeeklyReport[]> {
    return this.prisma.weeklyReport.findMany({
      where: { userId },
      include: { project: true },
      orderBy: [{ year: 'desc' }, { weekNumber: 'desc' }],
    });
  }

  async remove(id: string, userId: string, role: Role): Promise<void> {
    const report = await this.findOne(id, userId, role);

    // Team members can only delete their own draft reports
    if (role === Role.TEAM_MEMBER && report.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this report.',
      );
    }

    if (role === Role.TEAM_MEMBER && report.status !== ReportStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft reports can be deleted by team members.',
      );
    }

    // Permanently delete the report
    await this.prisma.weeklyReport.delete({
      where: { id },
    });

    // Log Activity
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: ActivityAction.REPORT_UPDATED,
        entityType: 'WeeklyReport',
        entityId: report.id,
        metadata: {
          weekNumber: report.weekNumber,
          year: report.year,
          action: 'deleted',
        },
      },
    });
  }
}
