/**
 * Customer Home Screen
 * Main dashboard for customers showing nearby shops, current queue status, quick booking
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge, SearchBar } from '../../components/ui';
import { useTheme } from '../../theme';
import type { Shop } from '../../types';

// Mock data for development
const mockNearbyShops: (Shop & { distance: number; currentWait: number })[] = [
  {
    id: '1',
    name: 'Premium Cuts',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip_code: '10001',
    phone: '+1 555-0123',
    latitude: 40.7128,
    longitude: -74.006,
    rating: 4.8,
    review_count: 234,
    is_active: true,
    operating_hours: {},
    distance: 0.3,
    currentWait: 15,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    name: 'Classic Barber Shop',
    address: '456 Oak Ave',
    city: 'New York',
    state: 'NY',
    zip_code: '10002',
    phone: '+1 555-0124',
    latitude: 40.7138,
    longitude: -74.007,
    rating: 4.5,
    review_count: 187,
    is_active: true,
    operating_hours: {},
    distance: 0.5,
    currentWait: 25,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    name: 'Urban Fade Studio',
    address: '789 Style Blvd',
    city: 'New York',
    state: 'NY',
    zip_code: '10003',
    phone: '+1 555-0125',
    latitude: 40.7148,
    longitude: -74.008,
    rating: 4.9,
    review_count: 312,
    is_active: true,
    operating_hours: {},
    distance: 0.8,
    currentWait: 10,
    created_at: '',
    updated_at: '',
  },
];

const categories = [
  { id: 'haircut', name: 'Haircut', icon: 'cut-outline' as const },
  { id: 'beard', name: 'Beard', icon: 'man-outline' as const },
  { id: 'shave', name: 'Shave', icon: 'brush-outline' as const },
  { id: 'color', name: 'Color', icon: 'color-palette-outline' as const },
  { id: 'kids', name: 'Kids', icon: 'happy-outline' as const },
  { id: 'spa', name: 'Spa', icon: 'sparkles-outline' as const },
];

export const CustomerHomeScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQueue, setActiveQueue] = useState<{
    shopName: string;
    position: number;
    estimatedWait: number;
  } | null>({
    shopName: 'Premium Cuts',
    position: 3,
    estimatedWait: 12,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: Fetch fresh data
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleSearch = () => {
    router.push({
      pathname: '/(tabs)/explore',
      params: { query: searchQuery },
    });
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/(tabs)/explore',
      params: { category: categoryId },
    });
  };

  const handleShopPress = (shopId: string) => {
    router.push({
      pathname: '/shop/[id]',
      params: { id: shopId },
    });
  };

  const handleViewAllShops = () => {
    router.push('/(tabs)/explore');
  };

  const handleQueuePress = () => {
    router.push('/(tabs)/queue');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.greeting}>
          <Text style={[styles.greetingText, { color: theme.colors.text.secondary }]}>
            Good morning 👋
          </Text>
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            John Doe
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.neutral[100] }]}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.colors.text.primary}
            />
            <View
              style={[styles.notificationBadge, { backgroundColor: theme.colors.error[500] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Avatar
              name="John Doe"
              size={40}
              source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search shops, services..."
        onSubmit={handleSearch}
        style={{ marginTop: 16 }}
      />
    </View>
  );

  const renderActiveQueue = () => {
    if (!activeQueue) return null;

    return (
      <TouchableOpacity onPress={handleQueuePress} activeOpacity={0.9}>
        <LinearGradient
          colors={[theme.colors.primary[500], theme.colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.queueCard}
        >
          <View style={styles.queueContent}>
            <View style={styles.queueInfo}>
              <Text style={styles.queueLabel}>You're in queue at</Text>
              <Text style={styles.queueShopName}>{activeQueue.shopName}</Text>
              <View style={styles.queueDetails}>
                <View style={styles.queueDetailItem}>
                  <Ionicons name="people-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.queueDetailText}>
                    Position #{activeQueue.position}
                  </Text>
                </View>
                <View style={styles.queueDetailItem}>
                  <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.queueDetailText}>
                    ~{activeQueue.estimatedWait} min wait
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.queuePosition}>
              <Text style={styles.queuePositionNumber}>{activeQueue.position}</Text>
              <Text style={styles.queuePositionLabel}>in line</Text>
            </View>
          </View>
          <View style={styles.queueProgress}>
            <View
              style={[
                styles.queueProgressBar,
                { width: `${((5 - activeQueue.position) / 5) * 100}%` },
              ]}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Services
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              { backgroundColor: theme.colors.neutral[100] },
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: theme.colors.primary[50] },
              ]}
            >
              <Ionicons
                name={category.icon}
                size={24}
                color={theme.colors.primary[500]}
              />
            </View>
            <Text
              style={[styles.categoryName, { color: theme.colors.text.primary }]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderNearbyShops = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Nearby Shops
        </Text>
        <TouchableOpacity onPress={handleViewAllShops}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary[500] }]}>
            See all
          </Text>
        </TouchableOpacity>
      </View>

      {mockNearbyShops.map((shop) => (
        <TouchableOpacity
          key={shop.id}
          style={[styles.shopCard, { backgroundColor: theme.colors.surface }]}
          onPress={() => handleShopPress(shop.id)}
          activeOpacity={0.8}
        >
          <View style={styles.shopImagePlaceholder}>
            <Ionicons
              name="storefront-outline"
              size={32}
              color={theme.colors.text.muted}
            />
          </View>
          <View style={styles.shopInfo}>
            <View style={styles.shopHeader}>
              <Text
                style={[styles.shopName, { color: theme.colors.text.primary }]}
                numberOfLines={1}
              >
                {shop.name}
              </Text>
              <Badge
                label={`${shop.currentWait} min`}
                variant={shop.currentWait < 20 ? 'success' : 'warning'}
                size="sm"
              />
            </View>
            <View style={styles.shopMeta}>
              <View style={styles.shopRating}>
                <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
                <Text
                  style={[styles.shopRatingText, { color: theme.colors.text.secondary }]}
                >
                  {shop.rating} ({shop.review_count})
                </Text>
              </View>
              <Text style={[styles.shopDivider, { color: theme.colors.text.muted }]}>
                •
              </Text>
              <Text
                style={[styles.shopDistance, { color: theme.colors.text.secondary }]}
              >
                {shop.distance} mi away
              </Text>
            </View>
            <Text
              style={[styles.shopAddress, { color: theme.colors.text.muted }]}
              numberOfLines={1}
            >
              {shop.address}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.muted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Quick Actions
      </Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.primary[50] },
          ]}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons
            name="search-outline"
            size={28}
            color={theme.colors.primary[500]}
          />
          <Text
            style={[styles.quickActionText, { color: theme.colors.primary[700] }]}
          >
            Find a Shop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.success[50] },
          ]}
          onPress={() => router.push('/(tabs)/bookings')}
        >
          <Ionicons
            name="calendar-outline"
            size={28}
            color={theme.colors.success[500]}
          />
          <Text
            style={[styles.quickActionText, { color: theme.colors.success[700] }]}
          >
            My Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.warning[50] },
          ]}
          onPress={() => router.push('/favorites')}
        >
          <Ionicons
            name="heart-outline"
            size={28}
            color={theme.colors.warning[500]}
          />
          <Text
            style={[styles.quickActionText, { color: theme.colors.warning[700] }]}
          >
            Favorites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.info[50] },
          ]}
          onPress={() => router.push('/history')}
        >
          <Ionicons
            name="time-outline"
            size={28}
            color={theme.colors.info[500]}
          />
          <Text
            style={[styles.quickActionText, { color: theme.colors.info[700] }]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
          />
        }
      >
        {renderHeader()}
        {renderActiveQueue()}
        {renderCategories()}
        {renderNearbyShops()}
        {renderQuickActions()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  queueCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  queueContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueInfo: {
    flex: 1,
  },
  queueLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  queueShopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  queueDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  queueDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  queueDetailText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  queuePosition: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  queuePositionNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  queuePositionLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  queueProgress: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  queueProgressBar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingRight: 20,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    width: 80,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shopImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  shopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  shopRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shopRatingText: {
    fontSize: 13,
  },
  shopDivider: {
    marginHorizontal: 6,
  },
  shopDistance: {
    fontSize: 13,
  },
  shopAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomerHomeScreen;
