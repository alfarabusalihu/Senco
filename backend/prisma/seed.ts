// ============================================================================
// senco Weekly Planner — Database Seed Script
// ============================================================================
// Seeds: Manager account, Employee account, sample projects, sample reports
// ============================================================================

import { PrismaClient, Role, ReportStatus, ProjectStatus, ActivityAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Hash a password using bcrypt with 12 salt rounds.
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Get the ISO week number for a given date.
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get Monday of a given ISO week number and year.
 */
function getStartOfWeek(year: number, week: number): Date {
  const jan1 = new Date(year, 0, 1);
  const days = (week - 1) * 7;
  const dayOfWeek = jan1.getDay();
  const offset = dayOfWeek <= 4 ? 1 - dayOfWeek : 8 - dayOfWeek;
  const monday = new Date(year, 0, 1 + offset + days);
  return monday;
}

/**
 * Get Friday from a Monday date.
 */
function getEndOfWeek(monday: Date): Date {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return friday;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ---------------------------------------------------------------------------
  // Clear existing data
  // ---------------------------------------------------------------------------
  console.log('🗑️  Clearing existing data...');
  await prisma.activityLog.deleteMany();
  await prisma.weeklyReport.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  console.log('   ✅ Data cleared.\n');

  // ---------------------------------------------------------------------------
  // Create Users
  // ---------------------------------------------------------------------------
  console.log('👤 Creating users...');

  const hashedPassword = await hashPassword('Password123!');

  // Administrator
  const admin = await prisma.user.create({
    data: {
      email: 'admin@senco.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMINISTRATOR,
    },
  });
  console.log(`   ✅ Administrator: ${admin.email} (${admin.firstName} ${admin.lastName})`);

  // Project Manager
  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      role: Role.PROJECT_MANAGER,
    },
  });
  console.log(`   ✅ Project Manager: ${manager.email} (${manager.firstName} ${manager.lastName})`);

  const employee1 = await prisma.user.create({
    data: {
      email: 'employee@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Carter',
      role: Role.TEAM_MEMBER,
    },
  });
  console.log(`   ✅ Employee: ${employee1.email} (${employee1.firstName} ${employee1.lastName})`);

  const employee2 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Johnson',
      role: Role.TEAM_MEMBER,
    },
  });
  console.log(`   ✅ Employee: ${employee2.email} (${employee2.firstName} ${employee2.lastName})`);

  const employee3 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Williams',
      role: Role.TEAM_MEMBER,
    },
  });
  console.log(`   ✅ Employee: ${employee3.email} (${employee3.firstName} ${employee3.lastName})`);

  const employee4 = await prisma.user.create({
    data: {
      email: 'emma@example.com',
      password: hashedPassword,
      firstName: 'Emma',
      lastName: 'Davis',
      role: Role.TEAM_MEMBER,
    },
  });
  console.log(`   ✅ Employee: ${employee4.email} (${employee4.firstName} ${employee4.lastName})\n`);

  const employees = [employee1, employee2, employee3, employee4];

  // ---------------------------------------------------------------------------
  // Create Projects
  // ---------------------------------------------------------------------------
  console.log('📁 Creating projects...');

  const projectData = [
    { name: 'Client Portal Redesign', description: 'Complete redesign of the client-facing portal with modern UI/UX, improved performance, and new feature set.' },
    { name: 'Mobile App v2.0', description: 'Major version upgrade of the mobile application with offline support, push notifications, and biometric auth.' },
    { name: 'Data Pipeline Migration', description: 'Migrate legacy ETL pipelines to a modern streaming architecture using event-driven design.' },
    { name: 'Internal Tools Dashboard', description: 'Build an internal admin dashboard for monitoring system health, user metrics, and operational KPIs.' },
    { name: 'API Gateway Implementation', description: 'Implement a centralized API gateway for rate limiting, authentication, and request routing across microservices.' },
  ];

  const projects = [];
  for (const pd of projectData) {
    const project = await prisma.project.create({
      data: {
        name: pd.name,
        description: pd.description,
        status: ProjectStatus.ACTIVE,
        managerId: manager.id,
      },
    });
    projects.push(project);
    console.log(`   ✅ Project: ${project.name}`);
  }
  console.log('');

  // ---------------------------------------------------------------------------
  // Create Weekly Reports (past 6 weeks of data)
  // ---------------------------------------------------------------------------
  console.log('📝 Creating weekly reports...');

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentWeek = getWeekNumber(currentDate);

  const taskSamples = {
    completed: [
      'Implemented user authentication flow with JWT tokens',
      'Designed and built responsive dashboard layout',
      'Fixed critical pagination bug in reports list',
      'Optimized database queries for dashboard metrics',
      'Implemented file upload functionality',
      'Created comprehensive API documentation',
      'Refactored notification service for better performance',
      'Built real-time data synchronization feature',
      'Implemented role-based access control system',
      'Created automated deployment pipeline',
      'Resolved memory leak in WebSocket handler',
      'Built search functionality with full-text support',
    ],
    planned: [
      'Integrate third-party payment gateway',
      'Implement email notification system',
      'Build user analytics dashboard',
      'Create automated test suite for API endpoints',
      'Optimize frontend bundle size',
      'Implement caching layer for API responses',
      'Design and build settings management page',
      'Create data export functionality',
      'Build real-time collaboration features',
      'Implement advanced filtering system',
    ],
    blockers: [
      'Waiting for design team to finalize mockups for the settings page',
      'Third-party API documentation is incomplete, awaiting vendor response',
      'Performance bottleneck in database query needs DBA consultation',
      'Deployment pipeline failing intermittently due to infrastructure issue',
      null, // No blocker
      null,
      'Cross-browser compatibility issues with Safari requiring additional investigation',
      null,
    ],
  };

  let reportCount = 0;

  for (let weekOffset = 5; weekOffset >= 0; weekOffset--) {
    const weekNum = currentWeek - weekOffset;
    if (weekNum <= 0) continue;

    const startDate = getStartOfWeek(currentYear, weekNum);
    const endDate = getEndOfWeek(startDate);

    for (const employee of employees) {
      // Some employees may skip a week (realistic scenario)
      if (weekOffset === 3 && employee.id === employee4.id) continue;
      if (weekOffset === 1 && employee.id === employee2.id) continue;

      const projectIndex = Math.floor(Math.random() * projects.length);
      const completedTasks = taskSamples.completed
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + Math.floor(Math.random() * 3))
        .join('\n• ');
      const plannedTasks = taskSamples.planned
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + Math.floor(Math.random() * 2))
        .join('\n• ');
      const blockerIndex = Math.floor(Math.random() * taskSamples.blockers.length);
      const blocker = taskSamples.blockers[blockerIndex];
      const hoursWorked = 30 + Math.floor(Math.random() * 20);

      // Current week reports are drafts, older ones are submitted
      const isCurrentWeek = weekOffset === 0;
      const isLate = weekOffset === 2 && employee.id === employee3.id;
      const status: ReportStatus = isCurrentWeek
        ? ReportStatus.DRAFT
        : isLate
          ? ReportStatus.LATE
          : ReportStatus.SUBMITTED;

      const submittedAt =
        status === ReportStatus.SUBMITTED
          ? new Date(endDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours after week end
          : status === ReportStatus.LATE
            ? new Date(endDate.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days late
            : null;

      await prisma.weeklyReport.create({
        data: {
          userId: employee.id,
          projectId: projects[projectIndex].id,
          weekNumber: weekNum,
          year: currentYear,
          startDate,
          endDate,
          tasksCompleted: `• ${completedTasks}`,
          tasksPlanned: `• ${plannedTasks}`,
          blockers: blocker,
          hoursWorked,
          notes: weekOffset % 2 === 0 ? 'Productive week overall. Team collaboration went well.' : null,
          status,
          submittedAt,
        },
      });
      reportCount++;
    }
  }
  console.log(`   ✅ Created ${reportCount} weekly reports.\n`);

  // ---------------------------------------------------------------------------
  // Create Activity Logs
  // ---------------------------------------------------------------------------
  console.log('📊 Creating activity logs...');

  // Log user registrations
  for (const user of [admin, manager, ...employees]) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: ActivityAction.USER_REGISTERED,
        entityType: 'User',
        entityId: user.id,
        metadata: { email: user.email, role: user.role },
      },
    });
  }

  // Log project creations
  for (const project of projects) {
    await prisma.activityLog.create({
      data: {
        userId: manager.id,
        action: ActivityAction.PROJECT_CREATED,
        entityType: 'Project',
        entityId: project.id,
        metadata: { name: project.name },
      },
    });
  }

  // Log some report submissions
  const submittedReports = await prisma.weeklyReport.findMany({
    where: { status: { in: [ReportStatus.SUBMITTED, ReportStatus.LATE] } },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  for (const report of submittedReports) {
    await prisma.activityLog.create({
      data: {
        userId: report.userId,
        action: ActivityAction.REPORT_SUBMITTED,
        entityType: 'WeeklyReport',
        entityId: report.id,
        metadata: { weekNumber: report.weekNumber, year: report.year },
        createdAt: report.submittedAt ?? report.updatedAt,
      },
    });
  }

  const totalLogs = await prisma.activityLog.count();
  console.log(`   ✅ Created ${totalLogs} activity logs.\n`);

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('═══════════════════════════════════════════════════');
  console.log('  🎉 Database seeded successfully!');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('  Demo Accounts:');
  console.log('  ┌──────────────────────────────────────────────┐');
  console.log('  │ Administrator                                │');
  console.log('  │   Email:    admin@senco.com                  │');
  console.log('  │   Password: Password123!                     │');
  console.log('  │                                              │');
  console.log('  │ Project Manager                              │');
  console.log('  │   Email:    manager@example.com              │');
  console.log('  │   Password: Password123!                     │');
  console.log('  │                                              │');
  console.log('  │ Team Member                                  │');
  console.log('  │   Email:    employee@example.com             │');
  console.log('  │   Password: Password123!                     │');
  console.log('  └──────────────────────────────────────────────┘');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
