import * as Location from 'expo-location';

export async function requestLocationPermissions(): Promise<Location.LocationPermissionResponse | null> {
  try {
    const permissions = await Location.requestForegroundPermissionsAsync();
    console.log('Location permissions:', permissions);
    return permissions;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return null;
  }
}

export async function getCurrentUserLocation(): Promise<{latitude: number, longitude: number} | null> {
  try {
    // Check if permissions are granted
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Location permissions not granted');
      return null;
    }

    // Get current position
    const locationResult = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = locationResult.coords;
    
    console.log('Current location:', { latitude, longitude });
    return { latitude, longitude };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}
