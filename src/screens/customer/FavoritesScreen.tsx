/**
 * Favorites Screen
 * Display user's saved/favorite barber shops
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

// Mock favorites
const mockFavorites = [
  {
    id: '1',
    name: "Mike's Barber Shop",
    address: '123 Main Street, Downtown',
    rating: 4.8,
    reviewCount: 256,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    isOpen: true,
    distance: '0.5 mi',
  },
  {
    id: '2',
    name: 'Classic Cuts',
    address: '456 Oak Avenue, Westside',
    rating: 4.6,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400',
    isOpen: true,
    distance: '1.2 mi',
  },
  {
    id: '3',
    name: 'The Gentleman',
    address: '789 Pine Road, Eastside',
    rating: 4.9,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400',
    isOpen: false,
    distance: '2.1 mi',
  },
];

export const FavoritesScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [favorites, setFavorites] = useState(mockFavorites);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleRemoveFavorite = (id: string) => {
    const shop = favorites.find((f) => f.id === id);
    
    Alert.alert(
      'Remove from Favorites',
      `Remove ${shop?.name} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFavorites(favorites.filter((f) => f.id !== id));
          },
        },
      ]
    );
  };

  const handleShopPress = (shopId: string) => {
    router.push(`/shop/${shopId}`);
  };

  const handleBookNow = (shopId: string) => {
    router.push({
      pathname: '/booking/services',
      params: { shopId },
    });
  };

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Favorites
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconWrapper,
                { backgroundColor: theme.colors.neutral[100] },
              ]}
            >
              <Ionicons
                name="heart-outline"
                size={48}
                color={theme.colors.neutral[400]}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
              No Favorites Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.text.muted }]}>
              Save your favorite barber shops for quick access
            </Text>
            <TouchableOpacity
              style={[
                styles.exploreBtn,
                { backgroundColor: theme.colors.primary[500] },
              ]}
              onPress={() => router.push('/explore')}
            >
              <Text style={styles.exploreBtnText}>Explore Shops</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.resultCount, { color: theme.colors.text.muted }]}>
              {favorites.length} saved shop{favorites.length !== 1 ? 's' : ''}
            </Text>
            {favorites.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={[styles.shopCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => handleShopPress(shop.id)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: shop.image }} style={styles.shopImage} />
                
                <TouchableOpacity
                  style={[
                    styles.favoriteBtn,
                    { backgroundColor: 'rgba(255,255,255,0.9)' },
                  ]}
                  onPress={() => handleRemoveFavorite(shop.id)}
                >
                  <Ionicons name="heart" size={20} color={theme.colors.error[500]} />
                </TouchableOpacity>

                <View style={styles.shopInfo}>
                  <View style={styles.shopHeader}>
                    <Text
                      style={[styles.shopName, { color: theme.colors.text.primary }]}
                      numberOfLines={1}
                    >
                      {shop.name}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: shop.isOpen
                            ? theme.colors.success[100]
                            : theme.colors.neutral[200],
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: shop.isOpen
                              ? theme.colors.success[600]
                              : theme.colors.text.muted,
                          },
                        ]}
                      >
                        {shop.isOpen ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.shopMeta}>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text
                        style={[styles.rating, { color: theme.colors.text.primary }]}
                      >
                        {shop.rating}
                      </Text>
                      <Text
                        style={[styles.reviewCount, { color: theme.colors.text.muted }]}
                      >
                        ({shop.reviewCount})
                      </Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={theme.colors.text.muted}
                      />
                      <Text
                        style={[styles.distance, { color: theme.colors.text.muted }]}
                      >
                        {shop.distance}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.address, { color: theme.colors.text.secondary }]}
                    numberOfLines={1}
                  >
                    {shop.address}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.bookBtn,
                      {
                        backgroundColor: shop.isOpen
                          ? theme.colors.primary[500]
                          : theme.colors.neutral[200],
                      },
                    ]}
                    onPress={() => shop.isOpen && handleBookNow(shop.id)}
                    disabled={!shop.isOpen}
                  >
                    <Text
                      style={[
                        styles.bookBtnText,
                        { color: shop.isOpen ? '#FFFFFF' : theme.colors.text.muted },
                      ]}
                    >
                      {shop.isOpen ? 'Book Now' : 'Currently Closed'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  resultCount: {
    fontSize: 13,
    marginBottom: 16,
  },
  shopCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shopImage: {
    width: '100%',
    height: 140,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shopInfo: {
    padding: 16,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  shopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 13,
  },
  address: {
    fontSize: 13,
    marginBottom: 12,
  },
  bookBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 260,
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default FavoritesScreen;
