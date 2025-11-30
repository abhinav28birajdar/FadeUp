export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

export function formatWaitTime(minutes: number): string {
  if (minutes <= 0) {
    return 'Now';
  }
  
  if (minutes < 60) {
    return `~${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `~${hours}h`;
  }
  
  return `~${hours}h ${remainingMinutes}min`;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function getTimeUntil(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Now';
  }
  
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));
  return formatWaitTime(diffMinutes);
}

export function isValidTimeString(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

export function parseTimeString(time: string): { hours: number; minutes: number } {
  const [hoursStr, minutesStr] = time.split(':');
  return {
    hours: parseInt(hoursStr, 10),
    minutes: parseInt(minutesStr, 10),
  };
}

export function isShopOpenNow(openingHours: any): boolean {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()] as keyof typeof openingHours;
  const daySchedule = openingHours[currentDay];
  
  if (!daySchedule?.isOpen) {
    return false;
  }
  
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const { hours: openHours, minutes: openMinutes } = parseTimeString(daySchedule.openTime);
  const { hours: closeHours, minutes: closeMinutes } = parseTimeString(daySchedule.closeTime);
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutesTotal = openHours * 60 + openMinutes;
  const closeMinutesTotal = closeHours * 60 + closeMinutes;
  
  return currentMinutes >= openMinutesTotal && currentMinutes < closeMinutesTotal;
}