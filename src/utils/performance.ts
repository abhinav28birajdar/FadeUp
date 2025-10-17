/**
 * Performance optimization utilities
 * Provides hooks and utilities for React component optimization
 */
import { useCallback, useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { logger } from './logger';

/**
 * Debounce a function call
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

/**
 * Throttle a function call
 * @param callback Function to throttle
 * @param limit Limit in milliseconds
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef<number>(0);
  const lastArgs = useRef<Parameters<T> | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      lastArgs.current = args;
      
      if (now - lastRun.current >= limit) {
        callback(...args);
        lastRun.current = now;
      } else {
        // Schedule running on the trailing edge
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          if (lastArgs.current) {
            callback(...lastArgs.current);
            lastRun.current = Date.now();
          }
        }, limit - (now - lastRun.current));
      }
    },
    [callback, limit]
  );
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback;
}

/**
 * Run a function after all animations and interactions are complete
 * @param callback Function to run after interactions
 * @param deps Dependencies for the effect
 */
export function useAfterInteractions<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[] = []
): void {
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      try {
        callback();
      } catch (error) {
        logger.error('Error in useAfterInteractions callback', error);
      }
    });
    
    return () => task.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Track and measure component render performance
 * Only used in development mode
 * @param componentName Name of the component to track
 */
export function useRenderTracker(componentName: string): void {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());
  
  // Only track renders in development mode
  if (__DEV__) {
    renderCount.current++;
    const elapsed = Date.now() - startTime.current;
    
    // Log renders at 10, 25, 50, 100 and then every 100 renders
    if (
      renderCount.current === 10 ||
      renderCount.current === 25 ||
      renderCount.current === 50 ||
      renderCount.current === 100 ||
      renderCount.current % 100 === 0
    ) {
      logger.debug(`${componentName} rendered ${renderCount.current} times in ${elapsed}ms`);
    }
  }
}

/**
 * Track component mount and unmount timing
 * Only used in development mode
 * @param componentName Name of the component to track
 */
export function useLifecycleTracker(componentName: string): void {
  const mountTime = useRef(Date.now());
  
  // Only track lifecycle in development mode
  if (__DEV__) {
    logger.debug(`${componentName} mounted`);
    
    useEffect(() => {
      return () => {
        const unmountTime = Date.now();
        const lifespan = unmountTime - mountTime.current;
        logger.debug(`${componentName} unmounted after ${lifespan}ms`);
      };
    }, []);
  }
}

/**
 * Measure function execution time
 * @param fn Function to measure
 * @param functionName Name of the function for logging
 */
export function measureExecutionTime<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    if (!__DEV__) {
      return fn(...args);
    }
    
    const start = Date.now();
    const result = fn(...args);
    const end = Date.now();
    
    logger.debug(`${functionName} executed in ${end - start}ms`);
    
    return result;
  };
}