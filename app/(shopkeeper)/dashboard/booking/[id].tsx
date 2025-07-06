import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MotiView } from 'moti';
import { doc, getDoc, writeBatch, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

import { db } from '@/src/lib/firebase';
import { Booking, UserProfile, Service, QueueEntry } from '@/src/types/firebaseModels';
import ModernCard from '@/src/components/ModernCard';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [completePressed, setCompletePressed] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!id) return;
        
        // Fetch booking details
        const bookingDoc = await getDoc(doc(db, 'bookings', id));
        if (bookingDoc.exists()) {
          const bookingData = { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
          setBooking(bookingData);
          
          // Fetch customer details
          const customerDoc = await getDoc(doc(db, 'users', bookingData.customer_id));
          if (customerDoc.exists()) {
            setCustomer({ id: customerDoc.id, ...customerDoc.data() } as UserProfile);
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
        } else {
          console.error('Booking not found');
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [id]);

  const handleMarkAsCompleted = async () => {
    if (!booking) return;
    
    Alert.alert(
      'Confirm Completion',
      'Are you sure you want to mark this booking as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setActionLoading(true);
            try {
              // Find the queue entry for this booking
              const queueQuery = query(
                collection(db, 'queue'),
                where('booking_id', '==', booking.id)
              );
              const queueSnapshot = await getDocs(queueQuery);
              
              if (!queueSnapshot.empty) {
                const queueEntry = {
                  id: queueSnapshot.docs[0].id,
                  ...queueSnapshot.docs[0].data()
                } as QueueEntry;
                
                // Update both booking and queue entry in a batch
                const batch = writeBatch(db);
                
                // Update booking status
                batch.update(doc(db, 'bookings', booking.id), {
                  status: 'completed'
                });
                
                // Update queue entry status
                batch.update(doc(db, 'queue', queueEntry.id), {
                  status: 'completed'
                });
                
                await batch.commit();
                
                // Update local state
                setBooking({
                  ...booking,
                  status: 'completed'
                });
              } else {
                // Just update the booking if no queue entry exists
                await updateDoc(doc(db, 'bookings', booking.id), {
                  status: 'completed'
                });
                
                // Update local state
                setBooking({
                  ...booking,
                  status: 'completed'
                });
              }
            } catch (error) {
              console.error('Error marking booking as completed:', error);
              Alert.alert('Error', 'Failed to update booking status');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F97316'; // Orange 500
      case 'confirmed': return '#3B82F6'; // Blue 500
      case 'completed': return '#10B981'; // Emerald 500
      case 'cancelled': return '#EF4444'; // Red 500
      default: return '#A1A1AA'; // Gray 400
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!booking || !customer) {
    return (
      <View style={styles.container}>
        <ModernCard>
          <Text style={{ color: '#38BDF8', textAlign: 'center' }}>Booking not found</Text>
        </ModernCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Booking Details' }} />
      
      <View style={styles.content}>
        {/* Customer Info */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
        >
          <ModernCard>
            <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
              Customer Information
            </Text>
            
            <View style={styles.detailRow}>
              <Text style={{ color: '#A1A1AA' }}>Name:</Text>
              <Text style={{ color: '#38BDF8' }}>
                {customer.first_name} {customer.last_name}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={{ color: '#A1A1AA' }}>Email:</Text>
              <Text style={{ color: '#38BDF8' }}>{customer.email}</Text>
            </View>
          </ModernCard>
        </MotiView>
        
        {/* Booking Details */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 100 }}
        >
          <ModernCard delay={100}>
            <View style={styles.bookingHeader}>
              <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600' }}>Booking Details</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '600' }}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={{ color: '#A1A1AA' }}>Date:</Text>
              <Text style={{ color: '#38BDF8' }}>{formatDate(booking.booking_date)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={{ color: '#A1A1AA' }}>Time:</Text>
              <Text style={{ color: '#38BDF8' }}>{booking.slot_time}</Text>
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
        
        {/* Additional Comments */}
        {booking.feedback_comment && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 200 }}
          >
            <ModernCard delay={200}>
              <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
                Customer Comments
              </Text>
              <Text style={{ color: '#A1A1AA' }}>{booking.feedback_comment}</Text>
            </ModernCard>
          </MotiView>
        )}
        
        {/* Action Button */}
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 300 }}
            style={styles.actionButtonContainer}
          >
            <Pressable
              onPressIn={() => setCompletePressed(true)}
              onPressOut={() => setCompletePressed(false)}
              onPress={handleMarkAsCompleted}
              disabled={actionLoading}
              style={({ pressed }) => [
                pressed && styles.actionButtonPressed
              ]}
            >
              <ModernCard 
                style={{ backgroundColor: '#22D3EE', paddingVertical: 20 }}
                pressed={completePressed}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#F3F4F6" />
                ) : (
                  <Text style={{ color: '#F3F4F6', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Mark as Completed</Text>
                )}
              </ModernCard>
            </Pressable>
          </MotiView>
        )}
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
    gap: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  actionButtonContainer: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  actionButtonPressed: {
    opacity: 0.9,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});