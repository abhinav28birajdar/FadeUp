import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Format time
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'p');
};

/**
 * Format date and time
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPp');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Format date with smart relative time
 */
export const formatSmartDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'p')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'p')}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, 'p')}`;
  }
  
  const daysDiff = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 7) {
    return format(dateObj, 'EEEE \'at\' p');
  }
  
  return format(dateObj, 'PPp');
};

/**
 * Format duration in minutes to readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${mins} min`;
};

/**
 * Format wait time with tilde
 */
export const formatWaitTime = (minutes: number): string => {
  if (minutes <= 0) {
    return 'Now';
  }
  
  if (minutes < 60) {
    return `~${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `~${hours} hr`;
  }
  
  return `~${hours} hr ${remainingMinutes} min`;
};

/**
 * Add minutes to a date
 */
export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

/**
 * Get time until target date
 */
export const getTimeUntil = (targetDate: Date | string): string => {
  const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Now';
  }
  
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));
  return formatWaitTime(diffMinutes);
};

/**
 * Check if time string is valid (HH:MM format)
 */
export const isValidTimeString = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Parse time string to hours and minutes
 */
export const parseTimeString = (time: string): { hours: number; minutes: number } => {
  const [hoursStr, minutesStr] = time.split(':');
  return {
    hours: parseInt(hoursStr, 10),
    minutes: parseInt(minutesStr, 10),
  };
};

/**
 * Check if shop is currently open
 */
export const isShopOpenNow = (openingHours: any): boolean => {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()] as keyof typeof openingHours;
  const daySchedule = openingHours[currentDay];
  
  if (!daySchedule?.isOpen) {
    return false;
  }
  
  const { hours: openHours, minutes: openMinutes } = parseTimeString(daySchedule.openTime);
  const { hours: closeHours, minutes: closeMinutes } = parseTimeString(daySchedule.closeTime);
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutesTotal = openHours * 60 + openMinutes;
  const closeMinutesTotal = closeHours * 60 + closeMinutes;
  
  return currentMinutes >= openMinutesTotal && currentMinutes <= closeMinutesTotal;
};

/**
 * Check if time is within business hours
 */
export const isBusinessHours = (
  time: Date | string,
  openTime: string,
  closeTime: string
): boolean => {
  const dateObj = typeof time === 'string' ? parseISO(time) : time;
  const currentTime = format(dateObj, 'HH:mm');
  
  return currentTime >= openTime && currentTime <= closeTime;
};

/**
 * Get next available slot
 */
export const getNextAvailableSlot = (
  currentTime: Date,
  slotDuration: number,
  openTime: string,
  closeTime: string
): Date | null => {
  const nextSlot = addMinutes(currentTime, slotDuration);
  const nextSlotTime = format(nextSlot, 'HH:mm');
  
  if (nextSlotTime >= openTime && nextSlotTime <= closeTime) {
    return nextSlot;
  }
  
  return null;
};

/**
 * Parse time string to minutes
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};
