import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { memo } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Shop } from '../services/shopDiscoveryService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface ShopCardProps {
  shop: Shop;
  onPress: (shop: Shop) => void;
  index: number;
}

const ShopCard: React.FC<ShopCardProps> = memo(({ shop, onPress, index }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={14} color="#FFD700" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={14} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={14} color="#666" />
        );
      }
    }
    return stars;
  };

  const getStatusColor = (isOpen?: boolean) => {
    return isOpen ? '#10B981' : '#EF4444';
  };

  const getStatusText = (isOpen?: boolean) => {
    return isOpen ? 'Open' : 'Closed';
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 600,
        delay: index * 100,
      }}
      style={styles.cardContainer}
    >
      <TouchableOpacity
        onPress={() => onPress(shop)}
        activeOpacity={0.9}
        style={styles.card}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.cardGradient}
        >
          {/* Cover Image */}
          <View style={styles.imageContainer}>
            {shop.cover_image_url || shop.logo_url ? (
              <Image
                source={{ uri: shop.cover_image_url || shop.logo_url }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="storefront" size={40} color="#666" />
              </View>
            )}
            
            {/* Status Badge */}
            <View style={styles.statusBadge}>
              <BlurView intensity={80} style={styles.statusBlur}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(shop.is_open) }]} />
                <Text style={styles.statusText}>{getStatusText(shop.is_open)}</Text>
              </BlurView>
            </View>

            {/* Distance Badge */}
            {shop.distance_km !== undefined && (
              <View style={styles.distanceBadge}>
                <BlurView intensity={80} style={styles.distanceBlur}>
                  <Ionicons name="location" size={12} color="#4facfe" />
                  <Text style={styles.distanceText}>
                    {shop.distance_km < 1 
                      ? `${Math.round(shop.distance_km * 1000)}m` 
                      : `${shop.distance_km.toFixed(1)}km`}
                  </Text>
                </BlurView>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Shop Name */}
            <Text style={styles.shopName} numberOfLines={1}>
              {shop.name}
            </Text>

            {/* Address */}
            <Text style={styles.address} numberOfLines={1}>
              <Ionicons name="location-outline" size={14} color="#999" />
              {' '}{shop.street_address}, {shop.city}
            </Text>

            {/* Rating and Reviews */}
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(shop.average_rating)}
              </View>
              <Text style={styles.ratingText}>
                {shop.average_rating.toFixed(1)} ({shop.total_ratings} reviews)
              </Text>
            </View>

            {/* Description */}
            {shop.description && (
              <Text style={styles.description} numberOfLines={2}>
                {shop.description}
              </Text>
            )}

            {/* Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.feature}>
                <Ionicons name="time-outline" size={14} color="#4facfe" />
                <Text style={styles.featureText}>
                  ~{shop.average_service_time}min
                </Text>
              </View>
              
              {shop.is_verified && (
                <View style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.featureText}>Verified</Text>
                </View>
              )}
              
              <View style={styles.feature}>
                <Ionicons name="cut-outline" size={14} color="#fa709a" />
                <Text style={styles.featureText}>Professional</Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onPress(shop)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.actionGradient}
              >
                <Text style={styles.actionText}>View Shop</Text>
                <Ionicons name="chevron-forward" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardGradient: {
    flex: 1,
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  distanceBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  content: {
    padding: 16,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#ccc',
  },
  description: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 4,
  },
  actionContainer: {
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
});

ShopCard.displayName = 'ShopCard';

export default ShopCard;