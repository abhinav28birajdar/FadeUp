/**
 * Network error handler utility
 * Provides consistent error handling for all network requests
 */
import { logger } from './logger';

/**
 * Standard network response structure
 */
export interface NetworkResponse<T> {
  data: T | null;
  error: Error | null;
  status: number | null;
  statusText?: string;
}

/**
 * Type for async API functions
 */
export type ApiFunction<T, P = any> = (params: P) => Promise<T>;

/**
 * Options for fetching data
 */
export interface FetchOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Default fetch options
 */
const DEFAULT_OPTIONS: FetchOptions = {
  retries: 2,
  retryDelay: 1000,
  timeout: 10000,
  shouldRetry: (error) => {
    // Retry network errors and 5xx server errors
    if (!error.status) return true; // Network error
    if (error.status >= 500 && error.status < 600) return true; // Server error
    return false;
  },
};

/**
 * Wrapper for API calls with consistent error handling
 * @param apiCall The API function to call
 * @param params Parameters for the API call
 * @param options Options for fetch behavior
 */
export async function fetchWithErrorHandling<T, P>(
  apiCall: ApiFunction<T, P>,
  params: P,
  options?: FetchOptions
): Promise<NetworkResponse<T>> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const { retries = 2, retryDelay = 1000, shouldRetry } = mergedOptions;

  let lastError: any = null;
  let attempts = 0;

  while (attempts <= retries) {
    try {
      // Attempt the API call
      const result = await apiCall(params);
      return { data: result, error: null, status: 200 };
    } catch (error: any) {
      lastError = error;
      attempts += 1;

      // Log the error
      logger.warn(`API call failed (attempt ${attempts}/${retries + 1})`, error);

      // Determine if we should retry
      const canRetry = 
        attempts <= retries && 
        (!shouldRetry || shouldRetry(error));

      if (canRetry) {
        logger.debug(`Retrying in ${retryDelay}ms...`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      break;
    }
  }

  // Format the error
  let status = lastError?.status || null;
  let statusText = lastError?.statusText || 'Unknown error';
  
  if (lastError?.message?.includes('timeout')) {
    statusText = 'Request timed out';
    status = 408;
  }
  
  logger.error('API call failed permanently', { 
    error: lastError, 
    status,
    statusText,
  });

  return {
    data: null,
    error: lastError || new Error('Unknown error occurred'),
    status,
    statusText,
  };
}

/**
 * Wrap an API function with error handling
 */
export function withErrorHandling<T, P>(apiFunction: ApiFunction<T, P>, defaultOptions?: FetchOptions) {
  return async (params: P, options?: FetchOptions): Promise<NetworkResponse<T>> => {
    return fetchWithErrorHandling(apiFunction, params, { ...defaultOptions, ...options });
  };
}