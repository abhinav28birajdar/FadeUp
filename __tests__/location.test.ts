import { calculateDistance, formatDistance } from '../src/utils/location';

describe('Location Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      const point1 = { latitude: 37.7749, longitude: -122.4194 }; // San Francisco
      const point2 = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles
      
      const distance = calculateDistance(point1, point2);
      
      // Distance between SF and LA is approximately 559 km
      expect(distance).toBeCloseTo(559, 0);
    });

    it('should return 0 for identical points', () => {
      const point = { latitude: 37.7749, longitude: -122.4194 };
      
      const distance = calculateDistance(point, point);
      
      expect(distance).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('should format distances less than 1km in meters', () => {
      expect(formatDistance(0.5)).toBe('500m');
      expect(formatDistance(0.1)).toBe('100m');
    });

    it('should format distances 1km or more in kilometers', () => {
      expect(formatDistance(1.0)).toBe('1km');
      expect(formatDistance(1.5)).toBe('1.5km');
      expect(formatDistance(10)).toBe('10km');
    });
  });
});