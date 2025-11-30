import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { UI_CONFIG } from '../config/constants';
import { ShopWithDistance } from '../types';
import { formatDistance } from '../utils/location';
import { isShopOpenNow } from '../utils/time';

interface ShopListProps {
  shops: ShopWithDistance[];
  loading: boolean;
  onShopPress: (shop: ShopWithDistance) => void;
}

export function ShopList({ shops, loading, onShopPress }: ShopListProps) {
  const renderShop = ({ item }: { item: ShopWithDistance }) => {
    const isOpen = item.isOpen && isShopOpenNow(item.openingHours);
    
    return (
      <TouchableOpacity 
        style={styles.shopCard} 
        onPress={() => onShopPress(item)}
      >
        <View style={styles.shopHeader}>
          <Text style={styles.shopName}>{item.name}</Text>
          <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
            <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.shopAddress}>{item.address}</Text>
        
        {item.description && (
          <Text style={styles.shopDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.shopFooter}>
          <View style={styles.shopStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                ⭐ {item.rating.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>
                ({item.totalRatings} reviews)
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                📍 {formatDistance(item.distance)}
              </Text>
              <Text style={styles.statLabel}>away</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.viewButton, !isOpen && styles.viewButtonDisabled]}
            onPress={() => onShopPress(item)}
          >
            <Text style={[styles.viewButtonText, !isOpen && styles.viewButtonTextDisabled]}>
              {isOpen ? 'View & Book' : 'View Details'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={UI_CONFIG.colors.primary} />
        <Text style={styles.loadingText}>Finding barbershops near you...</Text>
      </View>
    );
  }

  if (shops.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>✂️</Text>
        <Text style={styles.emptyTitle}>No barbershops found</Text>
        <Text style={styles.emptyText}>
          Try expanding your search area or check back later for new shops in your area.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={shops}
      renderItem={renderShop}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  shopCard: {
    backgroundColor: UI_CONFIG.colors.surface,
    borderRadius: UI_CONFIG.borderRadius.lg,
    padding: UI_CONFIG.spacing.md,
    marginBottom: UI_CONFIG.spacing.md,
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.sm,
  },
  shopName: {
    fontSize: UI_CONFIG.fontSize.lg,
    fontWeight: 'bold',
    color: UI_CONFIG.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: UI_CONFIG.spacing.sm,
    paddingVertical: UI_CONFIG.spacing.xs,
    borderRadius: UI_CONFIG.borderRadius.round,
  },
  openBadge: {
    backgroundColor: UI_CONFIG.colors.success + '20',
  },
  closedBadge: {
    backgroundColor: UI_CONFIG.colors.error + '20',
  },
  statusText: {
    fontSize: UI_CONFIG.fontSize.xs,
    fontWeight: '600',
  },
  openText: {
    color: UI_CONFIG.colors.success,
  },
  closedText: {
    color: UI_CONFIG.colors.error,
  },
  shopAddress: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
    marginBottom: UI_CONFIG.spacing.sm,
  },
  shopDescription: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
    lineHeight: 18,
    marginBottom: UI_CONFIG.spacing.sm,
  },
  shopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: UI_CONFIG.spacing.sm,
  },
  shopStats: {
    flexDirection: 'row',
    flex: 1,
  },
  stat: {
    marginRight: UI_CONFIG.spacing.lg,
  },
  statValue: {
    fontSize: UI_CONFIG.fontSize.sm,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
  },
  statLabel: {
    fontSize: UI_CONFIG.fontSize.xs,
    color: UI_CONFIG.colors.textLight,
  },
  viewButton: {
    backgroundColor: UI_CONFIG.colors.primary,
    paddingHorizontal: UI_CONFIG.spacing.md,
    paddingVertical: UI_CONFIG.spacing.sm,
    borderRadius: UI_CONFIG.borderRadius.md,
  },
  viewButtonDisabled: {
    backgroundColor: UI_CONFIG.colors.textLight,
  },
  viewButtonText: {
    color: 'white',
    fontSize: UI_CONFIG.fontSize.sm,
    fontWeight: '600',
  },
  viewButtonTextDisabled: {
    color: 'white',
  },
  loadingContainer: {
    padding: UI_CONFIG.spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: UI_CONFIG.spacing.md,
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: UI_CONFIG.spacing.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: UI_CONFIG.spacing.md,
  },
  emptyTitle: {
    fontSize: UI_CONFIG.fontSize.lg,
    fontWeight: 'bold',
    color: UI_CONFIG.colors.text,
    textAlign: 'center',
    marginBottom: UI_CONFIG.spacing.sm,
  },
  emptyText: {
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});