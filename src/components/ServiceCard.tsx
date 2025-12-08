import { ThemedText } from '@/components/themed-text';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  isAvailable: boolean;
}

interface ServiceCardProps {
  service: Service;
  onPress: (service: Service) => void;
  onBookNow?: (service: Service) => void;
  showPrice?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = React.memo(({ 
  service, 
  onPress, 
  onBookNow,
  showPrice = true 
}) => {
  const theme = useTheme();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(service)}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${service.name}, ${formatPrice(service.price)}, ${formatDuration(service.duration)}`}
    >
      <Card variant="default" style={{ 
        marginBottom: theme.spacing[3],
        opacity: service.isAvailable ? 1 : 0.6 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {/* Service Icon */}
          <View style={{
            width: 48,
            height: 48,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.primary[50],
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: theme.spacing[3]
          }}>
            <Ionicons 
              name="cut" 
              size={24} 
              color={theme.colors.primary[600]} 
            />
          </View>

          {/* Service Info */}
          <View style={{ flex: 1 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between',
              marginBottom: theme.spacing[1] 
            }}>
              <View style={{ flex: 1, marginRight: theme.spacing[2] }}>
                <ThemedText variant="subheading" numberOfLines={1}>
                  {service.name}
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  {service.category}
                </ThemedText>
              </View>
              
              {showPrice && (
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText variant="subheading" color="primary" weight="semibold">
                    {formatPrice(service.price)}
                  </ThemedText>
                  <ThemedText variant="caption" color="muted">
                    {formatDuration(service.duration)}
                  </ThemedText>
                </View>
              )}
            </View>

            <ThemedText variant="caption" color="muted" numberOfLines={2} style={{ marginBottom: theme.spacing[3] }}>
              {service.description}
            </ThemedText>

            {/* Status and Action */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{
                paddingHorizontal: theme.spacing[2],
                paddingVertical: theme.spacing[1],
                borderRadius: theme.borderRadius.sm,
                backgroundColor: service.isAvailable ? theme.colors.success[50] : theme.colors.error[50]
              }}>
                <ThemedText 
                  variant="caption" 
                  color={service.isAvailable ? 'success' : 'error'}
                  weight="medium"
                >
                  {service.isAvailable ? 'Available' : 'Unavailable'}
                </ThemedText>
              </View>

              {onBookNow && service.isAvailable && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onPress={() => onBookNow(service)}
                  style={{ minWidth: 80 }}
                >
                  Book Now
                </Button>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
});

export default ServiceCard;