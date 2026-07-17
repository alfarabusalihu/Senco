import { Role } from '@/types/User';

/**
 * Check if user has manager-level permissions
 * (PROJECT_MANAGER or ADMINISTRATOR)
 */
export function isManagerRole(role: Role | undefined): boolean {
  return role === 'PROJECT_MANAGER' || role === 'ADMINISTRATOR';
}

/**
 * Get display name for role
 */
export function getRoleDisplayName(role: Role | undefined): string {
  switch (role) {
    case 'ADMINISTRATOR':
      return 'Administrator';
    case 'PROJECT_MANAGER':
      return 'Project Manager';
    case 'TEAM_MEMBER':
      return 'Team Member';
    default:
      return 'Unknown';
  }
}

// Additional helper functions for future features:
// Uncomment when needed for admin features or more granular permissions

/**
 * Check if user has admin-only permissions
 */
// export function isAdminRole(role: Role | undefined): boolean {
//   return role === 'ADMINISTRATOR';
// }

/**
 * Check if user has project manager permissions
 */
// export function isProjectManagerRole(role: Role | undefined): boolean {
//   return role === 'PROJECT_MANAGER';
// }

/**
 * Check if user has team member role
 */
// export function isTeamMemberRole(role: Role | undefined): boolean {
//   return role === 'TEAM_MEMBER';
// }

/**
 * Navigation roles - which roles can access which routes
 */
// export const ROUTE_ROLES: Record<string, Role[]> = {
//   '/dashboard': ['TEAM_MEMBER', 'PROJECT_MANAGER', 'ADMINISTRATOR'],
//   '/reports': ['TEAM_MEMBER', 'PROJECT_MANAGER', 'ADMINISTRATOR'],
//   '/projects': ['TEAM_MEMBER', 'PROJECT_MANAGER', 'ADMINISTRATOR'],
//   '/analytics': ['PROJECT_MANAGER', 'ADMINISTRATOR'],
//   '/team': ['PROJECT_MANAGER', 'ADMINISTRATOR'],
//   '/settings': ['TEAM_MEMBER', 'PROJECT_MANAGER', 'ADMINISTRATOR'],
//   '/admin': ['ADMINISTRATOR'],
// };
