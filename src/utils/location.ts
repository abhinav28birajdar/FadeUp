import * as Location from 'expo-location';
import { logger } from '../utils/logger';

export async function requestLocationPermissions(): Promise<Location.LocationPermissionResponse | null> {
  try {
    const permissions = await Location.requestForegroundPermissionsAsync();
  logger.debug('Location permissions:', permissions);
    return permissions;
  } catch (error) {
  logger.error('Error requesting location permissions:', error);
    return null;
  }
}

export async function getCurrentUserLocation(): Promise<{latitude: number, longitude: number} | null> {
  try {
    // Check if permissions are granted
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
  logger.warn('Location permissions not granted');
      return null;
    }

    // Get current position
    const locationResult = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = locationResult.coords;
    
  logger.debug('Current location:', { latitude, longitude });
    return { latitude, longitude };
  } catch (error) {
  logger.error('Error getting current location:', error);
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<{latitude: number, longitude: number} | null> {
  try {
    const geocodeResult = await Location.geocodeAsync(address);
    
    if (geocodeResult && geocodeResult.length > 0) {
      const { latitude, longitude } = geocodeResult[0];
      logger.debug('Geocoded location for address:', address, { latitude, longitude });
      return { latitude, longitude };
    } else {
      logger.warn('No geocode results found for address:', address);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', address, error);
    return null;
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<Location.LocationGeocodedAddress[] | null> {
  try {
    const addressResult = await Location.reverseGeocodeAsync({ latitude, longitude });
    
    if (addressResult && addressResult.length > 0) {
      logger.debug('Reverse geocoded address for coordinates:', { latitude, longitude }, addressResult);
      return addressResult;
    } else {
      logger.warn('No address found for coordinates:', { latitude, longitude });
      return null;
    }
  } catch (error) {
  logger.error('Error reverse geocoding coordinates:', { latitude, longitude }, error);
    return null;
  }
}
