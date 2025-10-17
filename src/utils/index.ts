/**
 * Application Utilities Bundle
 * Export all utilities for easy import across the app
 */

// Core utilities
export * from '../utils/cacheManager';
export * from '../utils/connectivity';
export * from '../utils/logger';
export * from '../utils/networkErrorHandler';
export * from '../utils/performance';
export * from '../utils/toast';
export * from '../utils/useAppState';

// Enhanced Supabase utilities
export { executeWithLogging, supabase } from '../lib/supabase';
export {
    bookingUtils, feedbackUtils, notificationsUtils, queueUtils, serviceUtils, shopUtils, storageUtils, userUtils
} from '../lib/supabaseUtils';

/**
 * Utility to enhance any API call with our error handling
 */
import { ApiFunction, fetchWithErrorHandling } from '../utils/networkErrorHandler';

export function withErrorHandlingAndLogging<T, P>(
  operation: string, 
  apiFunction: ApiFunction<T, P>
) {
  return async (params: P) => {
    return fetchWithErrorHandling(apiFunction, params, {
      retries: 1,
      retryDelay: 1000,
      timeout: 15000,
    });
  };
}