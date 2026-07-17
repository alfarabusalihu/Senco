// ============================================================================
// Public Decorator — Mark endpoints as publicly accessible
// ============================================================================

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark an endpoint as public (no authentication required).
 * @example @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
