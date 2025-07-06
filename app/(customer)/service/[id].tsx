import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MotiView } from 'moti';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/src/lib/firebase';
import { Service, Shop } from '@/src/types/firebaseModels';
import ModernCard from '@/src/components/ModernCard';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookPressed, setBookPressed] = useState(false);

  useEffect(() => {
    const fetchServiceAndShop = async () => {
      try {
        // Fetch service details
        const serviceDoc = await getDoc(doc(db, 'services', id));
        if (serviceDoc.exists()) {
          const serviceData = { id: serviceDoc.id, ...serviceDoc.data() } as Service;
          setService(serviceData);
          
          // Fetch shop details
          const shopDoc = await getDoc(doc(db, 'shops', serviceData.shop_id));
          if (shopDoc.exists()) {
            setShop({ id: shopDoc.id, ...shopDoc.data() } as Shop);
          }
        } else {
          console.error('Service not found');
        }
      } catch (error) {
        console.error('Error fetching service details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceAndShop();
    }
  }, [id]);

  // Update the header title dynamically
  useEffect(() => {
    if (service) {
      router.setParams({ title: service.name });
    }
  }, [service]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!service || !shop) {
    return (
      <View style={styles.container}>
        <ModernCard>
          <Text style={{ color: '#38BDF8', textAlign: 'center' }}>Service not found</Text>
        </ModernCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: service.name }} />
      
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
        >
          <ModernCard>
            <View style={styles.serviceHeader}>
              <Text style={{ color: '#38BDF8', fontSize: 24, fontWeight: 'bold' }}>{service.name}</Text>
              <Text style={{ color: '#22C55E', fontSize: 20, fontWeight: 'bold' }}>${service.price.toFixed(2)}</Text>
            </View>
            
            <View style={styles.serviceDetails}>
              <Text style={{ color: '#A1A1AA', fontSize: 18 }}>Duration: {service.duration} minutes</Text>
              
              <View style={styles.shopInfo}>
                <Text style={{ color: '#38BDF8', fontWeight: '600', marginTop: 16 }}>Provided by:</Text>
                <Text style={{ color: '#0EA5E9', fontSize: 18 }}>{shop.name}</Text>
              </View>
              
              {service.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={{ color: '#38BDF8', fontWeight: '600', marginTop: 16 }}>Description:</Text>
                  <Text style={{ color: '#A1A1AA', marginTop: 8 }}>{service.description}</Text>
                </View>
              )}
            </View>
          </ModernCard>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
          style={styles.bookButtonContainer}
        >
          <Pressable
            onPressIn={() => setBookPressed(true)}
            onPressOut={() => setBookPressed(false)}
            onPress={() => router.push(`/booking/${shop.id}`)}
            style={({ pressed }) => [
              pressed && styles.bookButtonPressed
            ]}
          >
            <ModernCard 
              style={{ backgroundColor: '#0EA5E9', paddingVertical: 20 }}
              pressed={bookPressed}
            >
              <Text style={{ color: '#F3F4F6', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Book Now</Text>
            </ModernCard>
          </Pressable>
        </MotiView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceDetails: {
    marginTop: 16,
  },
  shopInfo: {
    marginTop: 8,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  bookButtonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  bookButtonPressed: {
    opacity: 0.9,
  },
});