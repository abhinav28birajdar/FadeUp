/**
 * Global type definitions for FadeUp
 */

declare global {
  var __FADE_UP_ANALYTICS__: {
    trackEvent?: (eventName: string, properties?: Record<string, any>) => void;
    trackError?: (
      source: string,
      error: Error,
      metadata?: Record<string, any>
    ) => void;
    identify?: (userId: string, traits?: Record<string, any>) => void;
  };
}

export { };
