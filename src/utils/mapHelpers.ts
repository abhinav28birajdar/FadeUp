/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

/**
 * Filter and sort shops by distance from user location
 * @param shops Array of shop objects with latitude and longitude
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param maxDistanceKm Maximum distance in kilometers (optional)
 * @returns Array of shops with distance property, filtered and sorted by distance
 */
export function filterAndSortShopsByDistance<T extends {latitude?: number, longitude?: number}>(
  shops: T[],
  userLat: number,
  userLon: number,
  maxDistanceKm?: number
): (T & {distanceKm: number})[] {
  const shopsWithDistance = shops
    .filter(shop => shop.latitude !== undefined && shop.longitude !== undefined)
    .map(shop => {
      const distanceKm = calculateDistance(
        userLat,
        userLon,
        shop.latitude!,
        shop.longitude!
      );
      
      return {
        ...shop,
        distanceKm,
      };
    })
    .filter(shop => maxDistanceKm ? shop.distanceKm <= maxDistanceKm : true)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return shopsWithDistance;
}
