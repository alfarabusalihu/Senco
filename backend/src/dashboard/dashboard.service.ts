import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, ReportStatus, ProjectStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(filters: {
    weekNumber?: number;
    year?: number;
    projectId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const reportWhere: any = {};
    const userWhere: any = { role: Role.TEAM_MEMBER };
    const projectWhere: any = { status: ProjectStatus.ACTIVE };

    // Apply report filters
    if (filters.weekNumber) reportWhere.weekNumber = filters.weekNumber;
    if (filters.year) reportWhere.year = filters.year;
    if (filters.projectId) reportWhere.projectId = filters.projectId;
    if (filters.userId) reportWhere.userId = filters.userId;

    if (filters.startDate || filters.endDate) {
      reportWhere.startDate = {};
      if (filters.startDate)
        reportWhere.startDate.gte = new Date(filters.startDate);
      if (filters.endDate)
        reportWhere.startDate.lte = new Date(filters.endDate);
    }

    // 1. Total reports submitted
    const submittedCount = await this.prisma.weeklyReport.count({
      where: {
        ...reportWhere,
        status: ReportStatus.SUBMITTED,
      },
    });

    // 2. Late reports count
    const lateCount = await this.prisma.weeklyReport.count({
      where: {
        ...reportWhere,
        status: ReportStatus.LATE,
      },
    });

    // 3. Draft reports count
    const draftCount = await this.prisma.weeklyReport.count({
      where: {
        ...reportWhere,
        status: ReportStatus.DRAFT,
      },
    });

    const totalSubmitted = submittedCount + lateCount;

    // 4. Open Blockers (where blockers is not null and not empty)
    const blockersCount = await this.prisma.weeklyReport.count({
      where: {
        ...reportWhere,
        status: { in: [ReportStatus.SUBMITTED, ReportStatus.LATE] },
        blockers: {
          not: null,
          notIn: ['', '• ', '•', 'none', 'None', 'n/a', 'N/A'],
        },
      },
    });

    // 5. Total hours worked
    const hoursSum = await this.prisma.weeklyReport.aggregate({
      where: reportWhere,
      _sum: {
        hoursWorked: true,
      },
    });
    const totalHours = hoursSum._sum.hoursWorked || 0;

    // 6. Active projects
    const activeProjectsCount = await this.prisma.project.count({
      where: projectWhere,
    });

    // 7. Active Team Members
    const activeTeamMembersCount = await this.prisma.user.count({
      where: userWhere,
    });

    // 8. Compliance Rate & Pending Reports
    // Compliance = (Submitted + Late Reports) / (Total expected reports for that week/range)
    // Expected reports = Active team members * number of weeks in filter (default 1 if single week)
    let expectedReports = activeTeamMembersCount;
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.max(1, Math.ceil(diffDays / 7));
      expectedReports = activeTeamMembersCount * diffWeeks;
    }

    const pendingCount = Math.max(0, expectedReports - totalSubmitted);
    const complianceRate =
      expectedReports > 0
        ? Math.min(100, Math.round((totalSubmitted / expectedReports) * 100))
        : 100;

    return {
      totalSubmitted,
      submittedCount,
      lateCount,
      draftCount,
      pendingCount,
      blockersCount,
      totalHours,
      activeProjectsCount,
      activeTeamMembersCount,
      complianceRate,
    };
  }

  async getCharts(filters: {
    weekNumber?: number;
    year?: number;
    projectId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const reportWhere: any = {};

    if (filters.weekNumber) reportWhere.weekNumber = filters.weekNumber;
    if (filters.year) reportWhere.year = filters.year;
    if (filters.projectId) reportWhere.projectId = filters.projectId;
    if (filters.userId) reportWhere.userId = filters.userId;

    if (filters.startDate || filters.endDate) {
      reportWhere.startDate = {};
      if (filters.startDate)
        reportWhere.startDate.gte = new Date(filters.startDate);
      if (filters.endDate)
        reportWhere.startDate.lte = new Date(filters.endDate);
    }

    const reports = await this.prisma.weeklyReport.findMany({
      where: reportWhere,
      include: {
        project: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // 1. Submission Status Breakdown (Pie Chart)
    const summary = await this.getSummary(filters);
    const submissionStatus = [
      { name: 'Submitted', value: summary.submittedCount },
      { name: 'Late', value: summary.lateCount },
      { name: 'Pending', value: summary.pendingCount },
      { name: 'Drafts', value: summary.draftCount },
    ];

    // 2. Workload Distribution: Hours worked per project (Bar Chart)
    const projectMap = new Map<
      string,
      { name: string; hours: number; tasks: number }
    >();
    reports.forEach((r) => {
      const pId = r.projectId;
      const pName = r.project?.name || 'Unknown Project';
      const existing = projectMap.get(pId) || {
        name: pName,
        hours: 0,
        tasks: 0,
      };

      // Calculate tasks count (count lines starting with bullets or newlines)
      const completedList = r.tasksCompleted
        .split('\n')
        .filter((line) => line.trim().length > 0).length;

      projectMap.set(pId, {
        name: pName,
        hours: existing.hours + r.hoursWorked,
        tasks: existing.tasks + completedList,
      });
    });
    const workloadDistribution = Array.from(projectMap.values());

    // 3. Team Productivity: Tasks completed by each employee (Area Chart / Bar Chart)
    const employeeMap = new Map<
      string,
      { name: string; tasks: number; hours: number }
    >();
    reports.forEach((r) => {
      const uId = r.userId;
      const uName = r.user
        ? `${r.user.firstName} ${r.user.lastName}`
        : 'Unknown';
      const existing = employeeMap.get(uId) || {
        name: uName,
        tasks: 0,
        hours: 0,
      };

      const completedList = r.tasksCompleted
        .split('\n')
        .filter((line) => line.trim().length > 0).length;

      employeeMap.set(uId, {
        name: uName,
        tasks: existing.tasks + completedList,
        hours: existing.hours + r.hoursWorked,
      });
    });
    const teamProductivity = Array.from(employeeMap.values());

    // 4. Tasks Completed Trend (Line Chart by Week)
    // Gather last 6 weeks of data or filtered range
    const trendMap = new Map<
      string,
      { week: string; completed: number; planned: number }
    >();
    reports.forEach((r) => {
      const key = `W${r.weekNumber}`;
      const existing = trendMap.get(key) || {
        week: key,
        completed: 0,
        planned: 0,
      };

      const completedList = r.tasksCompleted
        .split('\n')
        .filter((line) => line.trim().length > 0).length;
      const plannedList = r.tasksPlanned
        .split('\n')
        .filter((line) => line.trim().length > 0).length;

      trendMap.set(key, {
        week: key,
        completed: existing.completed + completedList,
        planned: existing.planned + plannedList,
      });
    });
    // Sort keys chronologically W1, W2, etc. (assuming same year or just sorting the list)
    const tasksTrend = Array.from(trendMap.values()).sort((a, b) => {
      const wA = parseInt(a.week.substring(1), 10);
      const wB = parseInt(b.week.substring(1), 10);
      return wA - wB;
    });

    return {
      submissionStatus,
      workloadDistribution,
      teamProductivity,
      tasksTrend,
    };
  }

  async getActivityFeed(limit = 15) {
    return this.prisma.activityLog.findMany({
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Aggregated overview endpoint - combines summary, charts, and activity
   * This reduces multiple API calls to a single request
   */
  async getOverview(
    filters: {
      weekNumber?: number;
      year?: number;
      projectId?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
    },
    activityLimit = 5,
  ) {
    // Fetch all data in parallel for maximum performance
    const [summary, charts, activity] = await Promise.all([
      this.getSummary(filters),
      this.getCharts(filters),
      this.getActivityFeed(activityLimit),
    ]);

    return {
      summary,
      charts,
      activity,
    };
  }
}
