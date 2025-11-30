import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { MyQueueStatus } from '../components/MyQueueStatus';
import { ShopList } from '../components/ShopList';
import { UI_CONFIG } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { queueService, shopService } from '../services/firestore';
import { QueueItem, ShopWithDistance } from '../types';
import { calculateDistance } from '../utils/location';

export function CustomerDashboard() {
  const [shops, setShops] = useState<ShopWithDistance[]>([]);
  const [myQueue, setMyQueue] = useState<QueueItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, signOut } = useAuth();
  const { location, getCurrentLocation, loading: locationLoading } = useLocation();

  useEffect(() => {
    loadDashboardData();
  }, [location]);

  useEffect(() => {
    if (myQueue) {
      // Subscribe to queue updates for current user
      const unsubscribe = queueService.onQueueUpdate(myQueue.shopId, (queueData) => {
        const updatedMyQueue = queueData.find(item => item.userId === user?.id);
        setMyQueue(updatedMyQueue || null);
      });

      return unsubscribe;
    }
  }, [myQueue, user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load nearby shops
      const currentLocation = location || { latitude: 37.7749, longitude: -122.4194 };
      const shopsData = await shopService.getNearby(
        currentLocation.latitude,
        currentLocation.longitude,
        25 // 25km radius
      );

      // Calculate distances and sort by distance
      const shopsWithDistance = shopsData.map(shop => ({
        ...shop,
        distance: calculateDistance(currentLocation, {
          latitude: shop.latitude,
          longitude: shop.longitude,
        }),
      })).sort((a, b) => a.distance - b.distance);

      setShops(shopsWithDistance);

      // Check if user is in any queue
      // This is simplified - in production, you'd have a separate query
      const userInQueue = await checkUserInQueue(user.id);
      setMyQueue(userInQueue);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const checkUserInQueue = async (userId: string): Promise<QueueItem | null> => {
    // This is a simplified implementation
    // In production, you'd have a proper query for this
    return null;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLocationRefresh = async () => {
    try {
      await getCurrentLocation();
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut },
      ]
    );
  };

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.subtitle}>Find your perfect barbershop</Text>
        </View>
        
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {myQueue && (
          <MyQueueStatus 
            queueItem={myQueue} 
            onLeaveQueue={() => setMyQueue(null)}
          />
        )}

        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>Your Location</Text>
            <TouchableOpacity 
              onPress={handleLocationRefresh}
              disabled={locationLoading}
              style={styles.refreshLocationButton}
            >
              <Text style={styles.refreshLocationText}>
                {locationLoading ? 'Getting...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.locationText}>
            {location 
              ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
              : 'Location not available'
            }
          </Text>
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Find Barbershops</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.shopsSection}>
          <Text style={styles.sectionTitle}>
            Nearby Shops ({filteredShops.length})
          </Text>
          <ShopList 
            shops={filteredShops}
            loading={loading}
            onShopPress={(shop) => {
              // Navigate to shop detail - will implement this next
              Alert.alert('Shop Selected', `Selected ${shop.name}`);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: UI_CONFIG.spacing.lg,
    paddingTop: UI_CONFIG.spacing.xl,
    paddingBottom: UI_CONFIG.spacing.md,
    backgroundColor: UI_CONFIG.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: UI_CONFIG.colors.border,
  },
  greeting: {
    fontSize: UI_CONFIG.fontSize.lg,
    fontWeight: 'bold',
    color: UI_CONFIG.colors.text,
  },
  subtitle: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
    marginTop: UI_CONFIG.spacing.xs,
  },
  signOutButton: {
    paddingHorizontal: UI_CONFIG.spacing.md,
    paddingVertical: UI_CONFIG.spacing.sm,
    borderRadius: UI_CONFIG.borderRadius.md,
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
  },
  signOutButtonText: {
    color: UI_CONFIG.colors.textSecondary,
    fontSize: UI_CONFIG.fontSize.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: UI_CONFIG.spacing.lg,
  },
  locationSection: {
    marginVertical: UI_CONFIG.spacing.lg,
    padding: UI_CONFIG.spacing.md,
    backgroundColor: UI_CONFIG.colors.surface,
    borderRadius: UI_CONFIG.borderRadius.lg,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.sm,
  },
  refreshLocationButton: {
    paddingHorizontal: UI_CONFIG.spacing.sm,
    paddingVertical: UI_CONFIG.spacing.xs,
    borderRadius: UI_CONFIG.borderRadius.sm,
    backgroundColor: UI_CONFIG.colors.primary,
  },
  refreshLocationText: {
    color: 'white',
    fontSize: UI_CONFIG.fontSize.xs,
    fontWeight: '500',
  },
  locationText: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
  },
  searchSection: {
    marginBottom: UI_CONFIG.spacing.lg,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
    borderRadius: UI_CONFIG.borderRadius.lg,
    paddingHorizontal: UI_CONFIG.spacing.md,
    paddingVertical: UI_CONFIG.spacing.md,
    fontSize: UI_CONFIG.fontSize.md,
    backgroundColor: UI_CONFIG.colors.surface,
    marginTop: UI_CONFIG.spacing.sm,
  },
  shopsSection: {
    marginBottom: UI_CONFIG.spacing.xl,
  },
  sectionTitle: {
    fontSize: UI_CONFIG.fontSize.lg,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
    marginBottom: UI_CONFIG.spacing.sm,
  },
});