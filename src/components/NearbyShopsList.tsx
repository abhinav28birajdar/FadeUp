import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { Shop, shopDiscoveryService, ShopSearchOptions } from '../services/shopDiscoveryService';
import { locationService } from '../utils/locationService';
import ShopCard from './ShopCard';

const { width, height } = Dimensions.get('window');

interface NearbyShopsListProps {
  refreshTrigger?: number;
  onShopPress?: (shop: Shop) => void;
}

type SortOption = 'distance' | 'rating' | 'name';
type CategoryFilter = 'all' | 'barbershop' | 'salon' | 'spa';

const NearbyShopsList: React.FC<NearbyShopsListProps> = ({
  refreshTrigger,
  onShopPress,
}) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load nearby shops
  const loadNearbyShops = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Get user location
      const location = await locationService.getCurrentLocation();
      if (!location) {
        setError('Unable to get your location. Please enable location services.');
        return;
      }

      setUserLocation(location);

      // Search options
      const searchOptions: ShopSearchOptions = {
        searchQuery: searchQuery.trim() || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        sortBy,
        limit: 50,
      };

      // Get nearby shops
      const nearbyShops = await shopDiscoveryService.findNearbyShops(
        location.latitude,
        location.longitude,
        10, // 10km radius
        searchOptions
      );

      setShops(nearbyShops);
    } catch (error) {
      console.error('Error loading nearby shops:', error);
      setError('Failed to load nearby shops. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, sortBy, categoryFilter]);

  // Initial load and refresh trigger
  useEffect(() => {
    loadNearbyShops();
  }, [loadNearbyShops, refreshTrigger]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNearbyShops(false);
  }, [loadNearbyShops]);

  // Handle shop press
  const handleShopPress = useCallback((shop: Shop) => {
    if (onShopPress) {
      onShopPress(shop);
    } else {
      router.push(`/(customer)/shop/${shop.id}`);
    }
  }, [onShopPress]);

  // Filter and sort shops based on search
  const filteredShops = useMemo(() => {
    let filtered = shops;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(query) ||
        shop.description?.toLowerCase().includes(query) ||
        shop.street_address.toLowerCase().includes(query) ||
        shop.city.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [shops, searchQuery]);

  // Render search header
  const renderSearchHeader = () => (
    <MotiView
      from={{ opacity: 0, translateY: -30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 500 }}
      style={styles.searchContainer}
    >
      <BlurView intensity={80} style={styles.searchBlur}>
        {/* Search Input */}
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search shops, services..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => loadNearbyShops()}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          {/* Category Filter */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Category:</Text>
            <View style={styles.filterOptions}>
              {(['all', 'barbershop', 'salon', 'spa'] as CategoryFilter[]).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    categoryFilter === category && styles.filterChipActive
                  ]}
                  onPress={() => setCategoryFilter(category)}
                >
                  <Text style={[
                    styles.filterChipText,
                    categoryFilter === category && styles.filterChipTextActive
                  ]}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sort by:</Text>
            <View style={styles.filterOptions}>
              {([
                { key: 'distance', label: 'Distance' },
                { key: 'rating', label: 'Rating' },
                { key: 'name', label: 'Name' }
              ] as { key: SortOption, label: string }[]).map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterChip,
                    sortBy === option.key && styles.filterChipActive
                  ]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text style={[
                    styles.filterChipText,
                    sortBy === option.key && styles.filterChipTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </BlurView>
    </MotiView>
  );

  // Render empty state
  const renderEmptyState = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 600 }}
      style={styles.emptyContainer}
    >
      <Ionicons name="storefront-outline" size={80} color="#666" />
      <Text style={styles.emptyTitle}>No shops found</Text>
      <Text style={styles.emptyMessage}>
        {searchQuery.trim() 
          ? `No shops match "${searchQuery}"`
          : "No shops found within 10km of your location"
        }
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadNearbyShops()}
      >
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          style={styles.retryGradient}
        >
          <Ionicons name="refresh" size={16} color="white" />
          <Text style={styles.retryText}>Try Again</Text>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  // Render error state
  const renderErrorState = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 600 }}
      style={styles.emptyContainer}
    >
      <Ionicons name="warning-outline" size={80} color="#EF4444" />
      <Text style={styles.emptyTitle}>Something went wrong</Text>
      <Text style={styles.emptyMessage}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadNearbyShops()}
      >
        <LinearGradient
          colors={['#EF4444', '#DC2626']}
          style={styles.retryGradient}
        >
          <Ionicons name="refresh" size={16} color="white" />
          <Text style={styles.retryText}>Retry</Text>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  // Render loading state
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4facfe" />
      <Text style={styles.loadingText}>Finding nearby shops...</Text>
    </View>
  );

  // Render list header
  const renderListHeader = () => (
    <View>
      {renderSearchHeader()}
      {filteredShops.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateX: -50 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 500, delay: 200 }}
          style={styles.resultsHeader}
        >
          <Text style={styles.resultsText}>
            {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
            {userLocation && ' within 10km'}
          </Text>
          {userLocation && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={14} color="#4facfe" />
              <Text style={styles.locationText}>
                Searching from your current location
              </Text>
            </View>
          )}
        </MotiView>
      )}
    </View>
  );

  // Render shop item
  const renderShopItem = ({ item, index }: { item: Shop; index: number }) => (
    <ShopCard
      shop={item}
      onPress={handleShopPress}
      index={index}
    />
  );

  // Main render
  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredShops}
        renderItem={renderShopItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4facfe']}
            tintColor="#4facfe"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    margin: 20,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchBlur: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    marginTop: 16,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(79, 172, 254, 0.3)',
    borderColor: '#4facfe',
  },
  filterChipText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultsHeader: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  resultsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyMessage: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 30,
  },
});

export default NearbyShopsList;