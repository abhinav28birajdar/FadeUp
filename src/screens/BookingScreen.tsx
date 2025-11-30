import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingScreen } from '../components/LoadingScreen';
import { useBooking } from '../contexts/BookingContext';
import { useQueue } from '../contexts/EnhancedQueueContext';
import { enhancedServiceService, enhancedShopService } from '../services/firestoreEnhanced';
import { Service, Shop } from '../types';

interface BookingScreenProps {
  route: {
    params: {
      shopId: string;
      shop?: Shop;
    };
  };
  navigation: any;
}

const BookingScreen: React.FC<BookingScreenProps> = ({ route, navigation }) => {
  const { shopId, shop: shopProp } = route.params;
  const { createBooking, loading: bookingLoading } = useBooking();
  const { joinQueue, loading: queueLoading } = useQueue();

  const [shop, setShop] = useState<Shop | null>(shopProp || null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(!shopProp);

  useEffect(() => {
    const loadShopData = async () => {
      try {
        setLoading(true);
        
        if (!shop) {
          const shopData = await enhancedShopService.getShop(shopId);
          if (shopData) {
            setShop(shopData);
          } else {
            Alert.alert('Error', 'Shop not found');
            navigation.goBack();
            return;
          }
        }
        
        const shopServices = await enhancedServiceService.getServicesByShop(shopId);
        setServices(shopServices);
        
      } catch (error) {
        console.error('Error loading shop data:', error);
        Alert.alert('Error', 'Failed to load shop information');
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [shopId, shop, navigation]);

  const handleJoinQueue = async (service: Service) => {
    try {
      await joinQueue(shopId, service.id);
      Alert.alert(
        'Success',
        `You've joined the queue for ${service.title}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error joining queue:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to join queue');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading shop information..." />;
  }

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Shop not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.shopName}>{shop.name}</Text>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          {services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <Text style={styles.serviceName}>{service.title}</Text>
              <Text style={styles.servicePrice}>${service.price}</Text>
              <Text style={styles.serviceDuration}>{service.durationMinutes} minutes</Text>
              
              <TouchableOpacity
                style={styles.joinQueueButton}
                onPress={() => handleJoinQueue(service)}
                disabled={queueLoading}
              >
                <Text style={styles.buttonText}>
                  {queueLoading ? 'Joining...' : 'Join Queue'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        {services.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No services available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  servicesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  serviceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  joinQueueButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default BookingScreen;