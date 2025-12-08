import { ThemedText } from '@/components/themed-text';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Shop {
  id: string;
  name: string;
  address: string;
  averageRating: number;
  totalReviews: number;
  isOpen: boolean;
  distance?: number;
}

interface ShopCardProps {
  shop: Shop;
  onPress: (shop: Shop) => void;
  onBookNow?: (shop: Shop) => void;
}

export const ShopCard: React.FC<ShopCardProps> = React.memo(({ 
  shop, 
  onPress, 
  onBookNow 
}) => {
  const theme = useTheme();

  const formatDistance = (distance?: number) => {
    if (!distance) return null;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(shop)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${shop.name}, ${shop.averageRating} stars, ${shop.isOpen ? 'Open' : 'Closed'}`}
    >
      <Card variant="elevated" style={{ marginBottom: theme.spacing[4] }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Shop Image Placeholder */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.colors.secondary[200],
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing[3]
          }}>
            <Ionicons 
              name="storefront" 
              size={32} 
              color={theme.colors.secondary[500]} 
            />
          </View>

          {/* Shop Info */}
          <View style={{ flex: 1 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: theme.spacing[1] 
            }}>
              <ThemedText variant="subheading" style={{ flex: 1 }}>
                {shop.name}
              </ThemedText>
              
              <View style={{
                paddingHorizontal: theme.spacing[2],
                paddingVertical: theme.spacing[1],
                borderRadius: theme.borderRadius.sm,
                backgroundColor: shop.isOpen ? theme.colors.success[50] : theme.colors.error[50]
              }}>
                <ThemedText 
                  variant="caption" 
                  color={shop.isOpen ? 'success' : 'error'}
                  weight="medium"
                >
                  {shop.isOpen ? 'Open' : 'Closed'}
                </ThemedText>
              </View>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: theme.spacing[2]
            }}>
              <Ionicons 
                name="star" 
                size={16} 
                color={theme.colors.warning[500]} 
              />
              <ThemedText variant="caption" style={{ marginLeft: theme.spacing[1] }}>
                {shop.averageRating.toFixed(1)} ({shop.totalReviews} reviews)
              </ThemedText>
              
              {shop.distance && (
                <>
                  <Text style={{ color: theme.colors.text.muted, marginHorizontal: theme.spacing[2] }}>•</Text>
                  <Ionicons 
                    name="location" 
                    size={14} 
                    color={theme.colors.text.muted} 
                  />
                  <ThemedText variant="caption" color="muted" style={{ marginLeft: theme.spacing[1] }}>
                    {formatDistance(shop.distance)}
                  </ThemedText>
                </>
              )}
            </View>

            <ThemedText variant="caption" color="muted" numberOfLines={2}>
              {shop.address}
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        {onBookNow && shop.isOpen && (
          <View style={{ marginTop: theme.spacing[4] }}>
            <Button 
              variant="primary" 
              size="sm"
              onPress={() => onBookNow(shop)}
              fullWidth
            >
              Book Now
            </Button>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
});

export default ShopCard;