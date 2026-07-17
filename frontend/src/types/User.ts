export type Role = 'TEAM_MEMBER' | 'PROJECT_MANAGER' | 'ADMINISTRATOR';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  avatar?: string;
}
