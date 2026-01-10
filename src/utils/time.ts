/**
 * Time utilities - re-exports from dateTime for backwards compatibility
 */
export * from './dateTime';

// Additional time-specific utilities

/**
 * Format wait time to human-readable string
 */
export const formatWaitTime = (minutes: number): string => {
  if (minutes < 1) {
    return 'Ready now';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

/**
 * Format estimated time of service
 */
export const formatEstimatedTime = (minutes: number): string => {
  const now = new Date();
  const estimatedTime = new Date(now.getTime() + minutes * 60000);
  return estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Get time slot string from date
 */
export const getTimeSlotString = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Check if time is within business hours
 */
export const isWithinBusinessHours = (
  time: Date,
  openTime: string,
  closeTime: string
): boolean => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return timeString >= openTime && timeString <= closeTime;
};

/**
 * Get minutes until a given time
 */
export const getMinutesUntil = (targetTime: Date): number => {
  const now = new Date();
  const diffMs = targetTime.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 60000));
};
