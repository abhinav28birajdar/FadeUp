import * as ExpoLocation from 'expo-location';
import { useEffect, useState } from 'react';
import { Location, UseLocationResult } from '../types';

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      setError('Failed to request location permission');
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<Location | null> => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Location permission denied');
        return null;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const result = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setLocation(result);
      return result;
    } catch (error) {
      setError('Failed to get current location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Auto-request location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    loading,
    error,
    requestPermission,
    getCurrentLocation,
  };
}