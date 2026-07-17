# Senco Weekly Planner

A modern, full-stack weekly report management system built with **NestJS**, **Next.js 15**, **PostgreSQL**, and **Prisma ORM**. Features role-based access control, real-time analytics, and AI-powered insights.

## 🎯 Features

### Core Features
- **🔐 Advanced Role-Based Access Control (RBAC)**: 
  - 3-tier permission system (Team Member, Project Manager, Administrator)
  - Granular data isolation - Project Managers can only access Team Member data
  - Administrators have full system access with user management capabilities
  - Secure JWT authentication with HTTP-only refresh tokens

- **📝 Weekly Reports Management**: 
  - Submit, track, and manage weekly progress reports
  - Track tasks completed, tasks planned, blockers, and hours worked
  - Draft, submitted, and late status tracking
  - Project assignment and filtering

- **📊 Analytics Dashboard**: 
  - Real-time insights and performance metrics
  - Submission tracking and compliance rates
  - Interactive charts (submissions over time, hours worked, project distribution)
  - Advanced filtering by week, year, project, user, and date range
  - Activity feed for recent team actions

- **🤖 AI-Powered Assistant (Gemini Integration)**: 
  - Intelligent chatbot for report analysis and insights
  - Natural language queries about team performance
  - Identify blockers and trends automatically
  - Manager/Admin exclusive feature

- **🎨 Modern UI/UX**: 
  - Responsive design optimized for desktop and tablet
  - Clean, intuitive interface with shadcn/ui components
  - Loading skeletons for smooth user experience
  - Toast notifications and real-time feedback

- **🚀 Performance Optimized**: 
  - Aggregated API endpoints for faster loading
  - Smart caching with React Query (10-minute staleTime)
  - Dynamic imports for reduced bundle size
  - Non-blocking authentication

- **🔒 Security & Type Safety**: 
  - Full TypeScript implementation across frontend and backend
  - Input validation with Zod schemas
  - Secure password hashing with bcrypt
  - CORS protection and rate limiting

## 📋 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: Zustand + React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens (HTTP-only cookies)
- **AI Integration**: Google Gemini API
- **API Documentation**: Swagger/OpenAPI

### DevOps
- **Database**: Docker Compose (PostgreSQL)
- **Package Manager**: npm workspaces

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v20+ ([Download](https://nodejs.org/))
- **npm**: v11+ (comes with Node.js)
- **Docker**: For PostgreSQL database ([Download](https://www.docker.com/))
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd senco-weekly-planner
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (root, backend, and frontend)
   npm run install:all
   ```

3. **Set up environment variables**
   
   **Backend** (`backend/.env`):
   ```bash
   # Copy example and configure
   cp backend/.env.example backend/.env
   
   # Edit backend/.env with your settings:
   DATABASE_URL=postgresql://user:password@localhost:5433/senco_weekly_planner
   JWT_SECRET=your-jwt-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret-key
   GEMINI_API_KEY=your-gemini-api-key  # Optional for AI features
   ```

   **Frontend** (`frontend/.env.local`):
   ```bash
   # Create frontend environment file
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > frontend/.env.local
   ```

---

## 💻 Running the Application

You can run each service independently or all together:

### Option 1: Run All Services Separately (Recommended)

**Terminal 1 - Database:**
```bash
npm run db:up
```

**Terminal 2 - Backend:**
```bash
npm run dev:backend
# Or: cd backend && npm run dev
```

**Terminal 3 - Frontend:**
```bash
npm run dev:frontend
# Or: cd frontend && npm run dev
```

### Option 2: Run Services Individually

**Database Only:**
```bash
# Start database
docker compose up -d db

# View logs
npm run db:logs

# Stop database
npm run db:down
```

**Backend Only:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:3001
```

**Frontend Only:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### Service URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Documentation**: http://localhost:3001/api/docs (Swagger)
- **Database**: localhost:5433

---

## 🗄️ Database Setup

### Initial Setup

1. **Start PostgreSQL**
   ```bash
   npm run db:up
   ```

2. **Run Prisma migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

3. **Seed the database** (optional - adds sample data)
   ```bash
   cd backend
   npm run db:seed
   ```

### Create Administrator User

The administrator account is created automatically when you run the seed:

```bash
cd backend
npm run db:seed
```

**Default Administrator Account:**
- Email: admin@senco.com
- Password: Password123!

⚠️ **Important**: Change the password after first login!

### Database Commands

```bash
# Start database
npm run db:up

# Stop database
npm run db:down

# View database logs
npm run db:logs

# Reset database (⚠️ deletes all data)
npm run db:reset

# Open Prisma Studio (Database GUI)
cd backend
npx prisma studio
```

---

## 👥 User Roles & Permissions

### 1. TEAM_MEMBER
- Submit weekly reports
- View own reports and assigned projects
- Update personal profile

### 2. PROJECT_MANAGER
- All TEAM_MEMBER permissions
- Create and manage projects
- View team analytics and dashboards
- Access all team reports

### 3. ADMINISTRATOR
- All PROJECT_MANAGER permissions
- Full system access
- User management (activate/deactivate)
- Role assignment

### Default Users (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Project Manager | manager@example.com | Password123! |
| Team Member | employee@example.com | Password123! |
| Administrator | admin@senco.com | Admin@123 |

---

## 🏗️ Project Structure

```
senco-weekly-planner/
├── backend/                 # NestJS Backend
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Seed data
│   ├── src/
│   │   ├── auth/           # Authentication & JWT
│   │   ├── users/          # User management
│   │   ├── projects/       # Project CRUD
│   │   ├── reports/        # Weekly reports
│   │   ├── dashboard/      # Analytics
│   │   └── ai/             # AI chat integration
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities & helpers
│   │   ├── stores/        # Zustand stores
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
│
├── docker-compose.yml     # PostgreSQL database
└── package.json           # Root workspace config
```

---

## 🧪 Testing

### Run Tests

**Backend:**
```bash
cd backend
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage report
```

**Frontend:**
```bash
cd frontend
npm run lint          # ESLint check
npm run build         # Production build test
```

---

## 🔧 Development

### Backend Development

```bash
cd backend

# Start development server (with watch mode)
npm run dev

# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name

# Format code
npm run format

# Lint code
npm run lint
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

---

## 📦 Building for Production

### Backend

```bash
cd backend
npm run build

# Start production server
npm run start:prod
```

### Frontend

```bash
cd frontend
npm run build

# Start production server
npm run start
```

---

## 🔐 Environment Variables

### Backend Required Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5433/senco_weekly_planner
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Backend Optional Variables

```env
GEMINI_API_KEY=your-gemini-api-key  # For AI chat features
THROTTLE_TTL=60                      # Rate limiting
THROTTLE_LIMIT=100
```

### Frontend Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker compose ps

# View database logs
npm run db:logs

# Restart database
docker compose restart db

# Reset database completely
npm run db:reset
cd backend && npx prisma migrate dev
```

### Port Already in Use

**Windows:**
```bash
# Backend (port 3001)
netstat -ano | findstr :3001
# Find PID and kill: taskkill /PID <PID> /F

# Frontend (port 3000)
netstat -ano | findstr :3000
# Find PID and kill: taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Backend (port 3001)
lsof -ti:3001 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Prisma Client Issues

```bash
cd backend

# Regenerate Prisma client
npx prisma generate

# Reset database and migrations
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

### Module Not Found Errors

```bash
# Reinstall all dependencies
npm run install:all

# Or individually
cd backend && npm install
cd ../frontend && npm install
```

---

## 📚 API Documentation

When the backend is running, access interactive API documentation:
- **Swagger UI**: http://localhost:3001/api/docs

---

## 📖 Additional Documentation

- **Role System**: `ROLE_SYSTEM_SUMMARY.md` - Complete role permissions guide
- **Testing Guide**: `TESTING_GUIDE.md` - Testing instructions and best practices
- **Cleanup Summary**: `CLEANUP_SUMMARY.md` - Recent cleanup and optimization work

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (configured)
- **Linting**: ESLint (configured)
- **Commits**: Conventional commits preferred

---

## 📄 License

This project is private and proprietary.

---

## 🆘 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review documentation files
3. Check API documentation at `/api/docs`
4. Contact the development team

---

## 🚀 Future Enhancements

### Planned Features

#### Phase 1 - Enhanced Reporting & Analytics
- **📥 PDF Export**: Download individual or bulk performance reports as PDF
- **📈 Performance Metrics Dashboard**: 
  - Individual user performance tracking
  - Downloadable metrics reports (PDF/CSV)
  - Historical performance trends
- **🏆 Team Leaderboard**: 
  - Manager view of top performers
  - Gamification with badges and achievements
  - Weekly/monthly performance rankings
- **📊 Advanced Analytics**: 
  - Comparative team analysis
  - Predictive insights using AI
  - Custom report builder

#### Phase 2 - Deployment & DevOps
- **☁️ Cloud Deployment**: 
  - Deploy to production (AWS/Azure/GCP)
  - CDN integration for faster global access
  - Automated CI/CD pipeline
  - Docker containerization for easy scaling
- **🔄 Real-time Updates**: 
  - WebSocket integration for live notifications
  - Real-time collaboration features
  - Instant report status updates

#### Phase 3 - Mobile Experience
- **📱 React Native Mobile App**: 
  - Native iOS and Android applications
  - Offline-first architecture
  - Push notifications for report reminders
  - Mobile-optimized report submission
  - Biometric authentication

#### Phase 4 - UI/UX Enhancements
- **🎨 Design Improvements**: 
  - Professional logo design and branding
  - Dark mode theme
  - Customizable dashboards
  - Enhanced data visualizations
  - Accessibility improvements (WCAG 2.1 AA compliance)
- **🖼️ Rich Media Support**: 
  - Upload images and documents to reports
  - Screenshot annotations
  - File management system

#### Phase 5 - Collaboration & Communication
- **📧 Email Notifications**: 
  - Automated reminders for report submissions
  - Weekly digest emails for managers
  - Blocker alerts and escalations
- **💬 Team Communication**: 
  - In-app messaging
  - Comment threads on reports
  - @mentions and notifications
- **🔔 Smart Notifications**: 
  - Customizable notification preferences
  - Digest mode for less frequent updates

#### Phase 6 - Integration & Enterprise
- **🔐 SSO Integration**: 
  - Google Workspace authentication
  - Microsoft Entra ID (Azure AD)
  - SAML 2.0 support
- **🔌 Third-party Integrations**: 
  - Jira/Linear task sync
  - Slack/Teams notifications
  - Calendar integrations (Google Calendar, Outlook)
  - Time tracking tools (Toggl, Harvest)
- **👥 Enhanced User Management**: 
  - Bulk user import/export
  - Department/team hierarchy
  - Custom roles and permissions
  - User onboarding workflows

#### Phase 7 - Advanced Features
- **🎯 Task Management System**: 
  - Create and assign tasks
  - Task dependencies and milestones
  - Kanban board view
  - Gantt chart for project timelines
- **📅 Calendar Integration**: 
  - Visual weekly planner
  - Deadline tracking
  - Meeting sync and notes
- **🤖 Enhanced AI Features**: 
  - Automated report generation suggestions
  - Sentiment analysis on blockers
  - Workload balancing recommendations
  - Predictive project completion dates

### Long-term Vision
- Multi-language support (i18n)
- White-label capability for different organizations
- API marketplace for custom integrations
- Mobile web app (PWA) for lightweight mobile access
- Audit logs and compliance reporting
- Advanced security features (2FA, IP whitelisting)

---

**Built with ❤️ using modern web technologies**
