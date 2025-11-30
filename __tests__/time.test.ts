import {
    addMinutes,
    formatDate,
    formatDuration,
    formatTime,
    formatWaitTime
} from '../src/utils/time';

describe('Time Utils', () => {
  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2023-01-01T14:30:00');
      expect(formatTime(date)).toBe('2:30 PM');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-01T14:30:00');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('1');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes correctly', () => {
      expect(formatDuration(30)).toBe('30min');
      expect(formatDuration(45)).toBe('45min');
    });

    it('should format hours correctly', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
      expect(formatDuration(90)).toBe('1h 30min');
    });
  });

  describe('formatWaitTime', () => {
    it('should return "Now" for zero or negative minutes', () => {
      expect(formatWaitTime(0)).toBe('Now');
      expect(formatWaitTime(-5)).toBe('Now');
    });

    it('should format wait times correctly', () => {
      expect(formatWaitTime(15)).toBe('~15min');
      expect(formatWaitTime(75)).toBe('~1h 15min');
    });
  });

  describe('addMinutes', () => {
    it('should add minutes to a date correctly', () => {
      const date = new Date('2023-01-01T14:00:00');
      const result = addMinutes(date, 30);
      expect(result.getMinutes()).toBe(30);
    });
  });
});