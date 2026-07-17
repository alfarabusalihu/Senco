// ============================================================================
// Roles Decorator — Mark endpoints with required roles
// ============================================================================

import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles can access an endpoint.
 * @example @Roles(Role.PROJECT_MANAGER, Role.ADMINISTRATOR)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
