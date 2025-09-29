import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface UserLocation extends LocationCoords {
  address?: string;
  city?: string;
  region?: string;
  country?: string;
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: UserLocation | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  /**
   * Request location permissions from the user
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'FadeUp needs location access to find nearby barber shops. Please enable location services in your device settings.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get the user's current location
   */
  async getCurrentLocation(useCache: boolean = true): Promise<UserLocation | null> {
    try {
      // Return cached location if available and useCache is true
      if (useCache && this.currentLocation) {
        return this.currentLocation;
      }

      // Check permissions first
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Get address information
      let userLocation: UserLocation = coords;
      
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync(coords);
        if (reverseGeocode.length > 0) {
          const addressInfo = reverseGeocode[0];
          userLocation = {
            ...coords,
            address: `${addressInfo.street || ''} ${addressInfo.streetNumber || ''}`.trim(),
            city: addressInfo.city || addressInfo.subregion || '',
            region: addressInfo.region || addressInfo.district || '',
            country: addressInfo.country || '',
          };
        }
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
        // Continue with coordinates only
      }

      // Cache the location
      this.currentLocation = userLocation;
      return userLocation;

    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your GPS settings and try again.'
      );
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates in kilometers
   */
  calculateDistance(
    point1: LocationCoords,
    point2: LocationCoords
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) *
        Math.cos(this.toRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if location services are enabled
   */
  async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Get formatted address string
   */
  getFormattedAddress(location: UserLocation): string {
    const parts = [];
    
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    
    return parts.join(', ') || 'Unknown location';
  }

  /**
   * Watch location changes (for real-time tracking)
   */
  async watchLocation(
    callback: (location: UserLocation) => void,
    options?: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    }
  ): Promise<Location.LocationSubscription | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        return null;
      }

      return await Location.watchPositionAsync(
        {
          accuracy: options?.accuracy || Location.Accuracy.Balanced,
          timeInterval: options?.timeInterval || 10000, // 10 seconds
          distanceInterval: options?.distanceInterval || 100, // 100 meters
        },
        async (location) => {
          const coords: LocationCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          // Get address information
          let userLocation: UserLocation = coords;
          
          try {
            const reverseGeocode = await Location.reverseGeocodeAsync(coords);
            if (reverseGeocode.length > 0) {
              const addressInfo = reverseGeocode[0];
              userLocation = {
                ...coords,
                address: `${addressInfo.street || ''} ${addressInfo.streetNumber || ''}`.trim(),
                city: addressInfo.city || addressInfo.subregion || '',
                region: addressInfo.region || addressInfo.district || '',
                country: addressInfo.country || '',
              };
            }
          } catch (geocodeError) {
            console.warn('Reverse geocoding failed during watch:', geocodeError);
          }

          // Update cache and call callback
          this.currentLocation = userLocation;
          callback(userLocation);
        }
      );
    } catch (error) {
      console.error('Error watching location:', error);
      return null;
    }
  }

  /**
   * Clear cached location
   */
  clearLocationCache(): void {
    this.currentLocation = null;
  }

  /**
   * Get cached location without fetching new one
   */
  getCachedLocation(): UserLocation | null {
    return this.currentLocation;
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance();