import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MotiView } from 'moti';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/src/lib/firebase';
import { Booking, Shop, Service } from '@/src/types/firebaseModels';
import ModernCard from '@/src/components/ModernCard';

export default function BookingConfirmationScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [queuePressed, setQueuePressed] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!bookingId) return;
        
        // Fetch booking details
        const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
        if (bookingDoc.exists()) {
          const bookingData = { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
          setBooking(bookingData);
          
          // Fetch shop details
          const shopDoc = await getDoc(doc(db, 'shops', bookingData.shop_id));
          if (shopDoc.exists()) {
            setShop({ id: shopDoc.id, ...shopDoc.data() } as Shop);
          }
          
          // Fetch service details
          const servicePromises = bookingData.service_ids.map(serviceId => 
            getDoc(doc(db, 'services', serviceId))
          );
          const serviceResults = await Promise.all(servicePromises);
          const servicesData = serviceResults
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() }) as Service);
          
          setServices(servicesData);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  if (loading || !booking || !shop) {
    return (
      <View style={styles.container}>
        <ModernCard>
          <Text style={{ color: '#38BDF8', textAlign: 'center' }}>Loading booking details...</Text>
        </ModernCard>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Booking Confirmed', headerBackVisible: false }} />
      
      <View style={styles.content}>
        {/* Success Animation */}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          style={styles.successIcon}
        >
          <View style={[styles.successIcon, { backgroundColor: '#22C55E', borderRadius: 999, width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }]}> {/* w-24 h-24 rounded-full bg-status-completed flex items-center justify-center */}
            <Text style={{ color: '#F3F4F6', fontSize: 32 }}>✓</Text>
          </View>
        </MotiView>
        
        {/* Confirmation Message */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
        >
          <Text style={{ color: '#22C55E', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 }}>Booking Confirmed!</Text>
        </MotiView>
        
        {/* Booking Details */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 400 }}
        >
          <ModernCard>
            <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Booking Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={{ color: '#A1A1AA' }}>Shop:</Text>
              <Text style={{ color: '#38BDF8', fontWeight: '600' }}>{shop.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={{ color: '#A1A1AA' }}>Date:</Text>
              <Text style={{ color: '#38BDF8' }}>{formatDate(booking.booking_date)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={{ color: '#A1A1AA' }}>Time:</Text>
              <Text style={{ color: '#38BDF8' }}>{booking.slot_time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={{ color: '#A1A1AA' }}>Status:</Text>
              <Text style={{ color: '#FACC15', fontWeight: '600' }}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</Text>
            </View>
            
            <View style={styles.servicesContainer}>
              <Text style={{ color: '#A1A1AA', marginBottom: 8 }}>Services:</Text>
              {services.map((service) => (
                <View key={service.id} style={styles.serviceItem}>
                  <Text style={{ color: '#38BDF8' }}>{service.name}</Text>
                  <Text style={{ color: '#22C55E' }}>${service.price.toFixed(2)}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.totalRow}>
              <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600' }}>Total:</Text>
              <Text style={{ color: '#22C55E', fontSize: 18, fontWeight: 'bold' }}>${booking.total_price.toFixed(2)}</Text>
            </View>
          </ModernCard>
        </MotiView>
        
        {/* Queue Button */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 600 }}
          style={styles.queueButtonContainer}
        >
          <Pressable
            onPressIn={() => setQueuePressed(true)}
            onPressOut={() => setQueuePressed(false)}
            onPress={() => router.push('/queue')}
            style={({ pressed }) => [
              pressed && styles.queueButtonPressed
            ]}
          >
            <ModernCard 
              style={{ backgroundColor: '#0EA5E9', paddingVertical: 20 }}
              pressed={queuePressed}
            >
              <Text style={{ color: '#F3F4F6', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>View Live Queue</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  successIcon: {
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  servicesContainer: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  queueButtonContainer: {
    marginTop: 40,
  },
  queueButtonPressed: {
    opacity: 0.9,
  },
});