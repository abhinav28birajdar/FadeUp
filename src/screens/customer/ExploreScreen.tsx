/**
 * Explore/Search Screen
 * Shop discovery with search, filters, map view, and categories
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, FilterChips, SearchBar } from '../../components/ui';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const mockShops = [
  {
    id: '1',
    name: 'Premium Cuts',
    address: '123 Main St',
    city: 'New York',
    rating: 4.8,
    reviewCount: 234,
    distance: 0.3,
    currentWait: 15,
    services: ['haircut', 'beard', 'shave'],
    priceRange: '$$',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Classic Barber Shop',
    address: '456 Oak Ave',
    city: 'New York',
    rating: 4.5,
    reviewCount: 187,
    distance: 0.5,
    currentWait: 25,
    services: ['haircut', 'beard'],
    priceRange: '$',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Urban Fade Studio',
    address: '789 Style Blvd',
    city: 'New York',
    rating: 4.9,
    reviewCount: 312,
    distance: 0.8,
    currentWait: 10,
    services: ['haircut', 'color', 'beard'],
    priceRange: '$$$',
    isOpen: true,
  },
  {
    id: '4',
    name: 'The Gentleman\'s Cut',
    address: '321 Elite Lane',
    city: 'New York',
    rating: 4.7,
    reviewCount: 156,
    distance: 1.2,
    currentWait: 30,
    services: ['haircut', 'shave', 'spa'],
    priceRange: '$$$$',
    isOpen: false,
  },
  {
    id: '5',
    name: 'Quick Clips',
    address: '567 Fast Way',
    city: 'New York',
    rating: 4.2,
    reviewCount: 89,
    distance: 0.4,
    currentWait: 5,
    services: ['haircut', 'kids'],
    priceRange: '$',
    isOpen: true,
  },
];

const serviceFilters = [
  { id: 'all', label: 'All' },
  { id: 'haircut', label: 'Haircut' },
  { id: 'beard', label: 'Beard' },
  { id: 'shave', label: 'Shave' },
  { id: 'color', label: 'Color' },
  { id: 'kids', label: 'Kids' },
  { id: 'spa', label: 'Spa' },
];

const sortOptions = [
  { id: 'distance', label: 'Nearest' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'wait', label: 'Shortest Wait' },
  { id: 'price_low', label: 'Price: Low to High' },
  { id: 'price_high', label: 'Price: High to Low' },
];

type ViewMode = 'list' | 'map';

export const ExploreScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ query?: string; category?: string }>();

  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(
    params.category ? [params.category] : ['all']
  );
  const [sortBy, setSortBy] = useState('distance');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const filteredShops = useMemo(() => {
    let result = [...mockShops];

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.address.toLowerCase().includes(query)
      );
    }

    // Apply service filters
    if (!activeFilters.includes('all')) {
      result = result.filter((shop) =>
        activeFilters.some((filter) => shop.services.includes(filter))
      );
    }

    // Apply open now filter
    if (openNowOnly) {
      result = result.filter((shop) => shop.isOpen);
    }

    // Apply price filter
    if (priceFilter.length > 0) {
      result = result.filter((shop) => priceFilter.includes(shop.priceRange));
    }

    // Apply sorting
    switch (sortBy) {
      case 'distance':
        result.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'wait':
        result.sort((a, b) => a.currentWait - b.currentWait);
        break;
      case 'price_low':
        result.sort((a, b) => a.priceRange.length - b.priceRange.length);
        break;
      case 'price_high':
        result.sort((a, b) => b.priceRange.length - a.priceRange.length);
        break;
    }

    return result;
  }, [searchQuery, activeFilters, sortBy, openNowOnly, priceFilter]);

  const handleShopPress = (shopId: string) => {
    router.push({
      pathname: '/shop/[id]',
      params: { id: shopId },
    });
  };

  const handleFilterPress = (filterId: string) => {
    if (filterId === 'all') {
      setActiveFilters(['all']);
    } else {
      setActiveFilters((prev) => {
        const withoutAll = prev.filter((f) => f !== 'all');
        if (withoutAll.includes(filterId)) {
          const result = withoutAll.filter((f) => f !== filterId);
          return result.length === 0 ? ['all'] : result;
        }
        return [...withoutAll, filterId];
      });
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search shops, services, barbers..."
        showFilterButton
        onFilterPress={() => setShowFiltersModal(true)}
      />

      <FilterChips
        options={serviceFilters}
        selected={activeFilters}
        onSelect={handleFilterPress}
        style={{ marginTop: 12 }}
      />

      <View style={styles.subHeader}>
        <Text style={[styles.resultCount, { color: theme.colors.text.secondary }]}>
          {filteredShops.length} shops found
        </Text>

        <View style={styles.viewControls}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { borderColor: theme.colors.border },
            ]}
            onPress={() => {
              // TODO: Show sort modal
            }}
          >
            <Ionicons
              name="swap-vertical-outline"
              size={16}
              color={theme.colors.text.secondary}
            />
            <Text
              style={[styles.sortText, { color: theme.colors.text.secondary }]}
            >
              {sortOptions.find((o) => o.id === sortBy)?.label}
            </Text>
          </TouchableOpacity>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.viewButton,
                viewMode === 'list' && {
                  backgroundColor: theme.colors.primary[500],
                },
              ]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list-outline"
                size={18}
                color={viewMode === 'list' ? '#FFFFFF' : theme.colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewButton,
                viewMode === 'map' && {
                  backgroundColor: theme.colors.primary[500],
                },
              ]}
              onPress={() => setViewMode('map')}
            >
              <Ionicons
                name="map-outline"
                size={18}
                color={viewMode === 'map' ? '#FFFFFF' : theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderShopCard = ({ item }: { item: typeof mockShops[0] }) => (
    <TouchableOpacity
      style={[styles.shopCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleShopPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.shopImagePlaceholder}>
        <Ionicons
          name="storefront-outline"
          size={32}
          color={theme.colors.text.muted}
        />
      </View>

      <View style={styles.shopContent}>
        <View style={styles.shopHeader}>
          <View style={styles.shopTitleRow}>
            <Text
              style={[styles.shopName, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Badge
              label={item.isOpen ? 'Open' : 'Closed'}
              variant={item.isOpen ? 'success' : 'default'}
              size="sm"
            />
          </View>
          <Text
            style={[styles.shopAddress, { color: theme.colors.text.secondary }]}
            numberOfLines={1}
          >
            {item.address}, {item.city}
          </Text>
        </View>

        <View style={styles.shopMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
            <Text
              style={[styles.metaText, { color: theme.colors.text.secondary }]}
            >
              {item.rating} ({item.reviewCount})
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.text.muted}
            />
            <Text
              style={[styles.metaText, { color: theme.colors.text.secondary }]}
            >
              {item.distance} mi
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={14}
              color={
                item.currentWait < 20
                  ? theme.colors.success[500]
                  : theme.colors.warning[500]
              }
            />
            <Text
              style={[
                styles.metaText,
                {
                  color:
                    item.currentWait < 20
                      ? theme.colors.success[500]
                      : theme.colors.warning[500],
                },
              ]}
            >
              {item.currentWait} min wait
            </Text>
          </View>
          <Text
            style={[styles.priceRange, { color: theme.colors.text.muted }]}
          >
            {item.priceRange}
          </Text>
        </View>

        <View style={styles.serviceTags}>
          {item.services.slice(0, 3).map((service) => (
            <View
              key={service}
              style={[
                styles.serviceTag,
                { backgroundColor: theme.colors.neutral[100] },
              ]}
            >
              <Text
                style={[
                  styles.serviceTagText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {service.charAt(0).toUpperCase() + service.slice(1)}
              </Text>
            </View>
          ))}
          {item.services.length > 3 && (
            <Text
              style={[styles.moreServices, { color: theme.colors.text.muted }]}
            >
              +{item.services.length - 3} more
            </Text>
          )}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.text.muted}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );

  const renderMapView = () => (
    <View
      style={[styles.mapContainer, { backgroundColor: theme.colors.neutral[100] }]}
    >
      <View style={styles.mapPlaceholder}>
        <Ionicons
          name="map-outline"
          size={48}
          color={theme.colors.text.muted}
        />
        <Text style={[styles.mapPlaceholderText, { color: theme.colors.text.secondary }]}>
          Map View
        </Text>
        <Text style={[styles.mapPlaceholderSubtext, { color: theme.colors.text.muted }]}>
          Coming soon with react-native-maps
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="search-outline"
        size={64}
        color={theme.colors.text.muted}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        No shops found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
        Try adjusting your search or filters
      </Text>
      <TouchableOpacity
        style={[styles.clearButton, { borderColor: theme.colors.primary[500] }]}
        onPress={() => {
          setSearchQuery('');
          setActiveFilters(['all']);
          setPriceFilter([]);
          setOpenNowOnly(false);
        }}
      >
        <Text style={[styles.clearButtonText, { color: theme.colors.primary[500] }]}>
          Clear Filters
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {renderHeader()}

      {viewMode === 'list' ? (
        <FlatList
          data={filteredShops}
          renderItem={renderShopCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary[500]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      ) : (
        renderMapView()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  resultCount: {
    fontSize: 14,
  },
  viewControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  viewButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  shopCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shopImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopContent: {
    flex: 1,
    marginLeft: 12,
  },
  shopHeader: {
    marginBottom: 8,
  },
  shopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  shopAddress: {
    fontSize: 13,
  },
  shopMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  priceRange: {
    fontSize: 12,
    fontWeight: '500',
  },
  serviceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  serviceTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreServices: {
    fontSize: 11,
    fontWeight: '500',
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 250,
  },
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExploreScreen;
