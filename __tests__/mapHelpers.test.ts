import { calculateDistance, filterAndSortShopsByDistance } from '../src/utils/mapHelpers';

describe('MapHelpers', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Distance between New York and Los Angeles (approximately 3944 km)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeCloseTo(3944, 0); // Within 1 km tolerance
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });
  });

  describe('filterAndSortShopsByDistance', () => {
    const mockShops = [
      { id: '1', name: 'Shop 1', latitude: 40.7128, longitude: -74.0060 },
      { id: '2', name: 'Shop 2', latitude: 40.7589, longitude: -73.9851 },
      { id: '3', name: 'Shop 3', latitude: 34.0522, longitude: -118.2437 },
    ];

    it('should filter shops by distance and sort by proximity', () => {
      const result = filterAndSortShopsByDistance(
        mockShops,
        40.7128, -74.0060, // NYC coordinates
        50 // 50km radius
      );

      expect(result).toHaveLength(2); // Only first two shops within 50km
      expect(result[0].id).toBe('1'); // Closest shop first
      expect(result[0].distanceKm).toBe(0);
      expect(result[1].distanceKm).toBeGreaterThan(0);
    });

    it('should return all shops when no distance limit provided', () => {
      const result = filterAndSortShopsByDistance(mockShops, 40.7128, -74.0060);
      expect(result).toHaveLength(3);
    });
  });
});
