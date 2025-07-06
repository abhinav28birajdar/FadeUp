import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MotiView } from 'moti';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { collection, query, where, getDocs, addDoc, Timestamp, runTransaction, doc } from 'firebase/firestore';

import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/authStore';
import { Shop, Service } from '@/src/types/firebaseModels';
import ModernCard from '@/src/components/ModernCard';

// Available time slots (hardcoded for simplicity)
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export default function BookingScreen() {
  const { shopId } = useLocalSearchParams<{ shopId: string }>();
  const { user } = useAuthStore();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [commentFocused, setCommentFocused] = useState(false);
  const [confirmPressed, setConfirmPressed] = useState(false);

  useEffect(() => {
    const fetchShopAndServices = async () => {
      try {
        // Fetch shop details
        const shopDoc = await doc(db, 'shops', shopId);
        const shopSnapshot = await runTransaction(db, async (transaction) => {
          const shopData = await transaction.get(shopDoc);
          return shopData;
        });
        
        if (shopSnapshot.exists()) {
          setShop({ id: shopSnapshot.id, ...shopSnapshot.data() } as Shop);
          
          // Fetch services for this shop
          const servicesQuery = query(
            collection(db, 'services'),
            where('shop_id', '==', shopId)
          );
          const servicesSnapshot = await getDocs(servicesQuery);
          const servicesData = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Service[];
          
          setServices(servicesData);
        } else {
          console.error('Shop not found');
        }
      } catch (error) {
        console.error('Error fetching shop details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopAndServices();
    }
  }, [shopId]);

  // Calculate total price when selected services change
  useEffect(() => {
    const calculateTotal = () => {
      return services
        .filter(service => selectedServices.includes(service.id))
        .reduce((sum, service) => sum + service.price, 0);
    };

    setTotalPrice(calculateTotal());
  }, [selectedServices, services]);

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleConfirmBooking = async () => {
    // Validate inputs
    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service');
      return;
    }

    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    setBookingLoading(true);
    try {
      // Format date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];

      // Create booking document
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        customer_id: user?.id,
        shop_id: shopId,
        service_ids: selectedServices,
        booking_date: formattedDate,
        slot_time: selectedTimeSlot,
        total_price: totalPrice,
        status: 'pending',
        feedback_comment: comment || null,
        created_at: Timestamp.now(),
      });

      // Determine queue position and create queue entry
      const queueQuery = query(
        collection(db, 'queue'),
        where('shop_id', '==', shopId),
        where('status', '==', 'waiting')
      );
      const queueSnapshot = await getDocs(queueQuery);
      const queuePosition = queueSnapshot.size + 1;

      await addDoc(collection(db, 'queue'), {
        booking_id: bookingRef.id,
        customer_id: user?.id,
        shop_id: shopId,
        position: queuePosition,
        status: 'waiting',
        created_at: Timestamp.now(),
      });

      // Navigate to confirmation screen
      router.replace({
        pathname: '/booking/confirmation',
        params: { bookingId: bookingRef.id }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Booking Failed', 'There was an error creating your booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.container}>
        <ModernCard>
          <Text style={{ color: '#38BDF8', textAlign: 'center' }}>Shop not found</Text>
        </ModernCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Book at ${shop.name}` }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Services Selection */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
        >
          <ModernCard>
            <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Select Services</Text>
            
            {services.map((service, index) => (
              <Pressable
                key={service.id}
                onPress={() => toggleServiceSelection(service.id)}
                style={({ pressed }) => [
                  styles.serviceItem,
                  selectedServices.includes(service.id) && styles.serviceItemSelected,
                  pressed && styles.serviceItemPressed
                ]}
              >
                <MotiView
                  animate={{ 
                    backgroundColor: selectedServices.includes(service.id) 
                      ? 'rgba(139, 92, 246, 0.2)' 
                      : 'transparent',
                    scale: selectedServices.includes(service.id) ? 1.02 : 1
                  }}
                  transition={{ type: 'timing', duration: 200 }}
                  style={styles.serviceItemInner}
                >
                  <View style={[styles.serviceCheckbox, selectedServices.includes(service.id) ? { borderColor: '#0EA5E9', backgroundColor: '#0EA5E9' } : { borderColor: '#27272A' }]}> {/* border-accent-primary bg-accent-primary or border-dark-border */}
                    {selectedServices.includes(service.id) && (
                      <Text style={{ color: '#F3F4F6', fontSize: 12 }}>✓</Text>
                    )}
                  </View>
                  
                  <View style={styles.serviceInfo}>
                    <Text style={{ color: '#38BDF8', fontSize: 18 }}>{service.name}</Text>
                    <Text style={{ color: '#A1A1AA' }}>{service.duration} min</Text>
                  </View>
                  
                  <Text style={{ color: '#22C55E', fontWeight: 'bold' }}>${service.price.toFixed(2)}</Text>
                </MotiView>
              </Pressable>
            ))}
          </ModernCard>
        </MotiView>

        {/* Date Selection */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 100 }}
        >
          <ModernCard delay={100}>
            <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Select Date</Text>
            
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={styles.dateSelector}
            >
              <Text style={{ color: '#38BDF8', fontSize: 18 }}>{formatDate(date)}</Text>
            </Pressable>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
                themeVariant="dark"
              />
            )}
          </ModernCard>
        </MotiView>

        {/* Time Slot Selection */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
        >
          <ModernCard delay={200}>
            <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Select Time</Text>
            
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map((slot) => (
                <Pressable
                  key={slot}
                  onPress={() => setSelectedTimeSlot(slot)}
                  style={({ pressed }) => [
                    styles.timeSlot,
                    selectedTimeSlot === slot && styles.timeSlotSelected,
                    pressed && styles.timeSlotPressed
                  ]}
                >
                  <MotiView
                    animate={{ 
                      backgroundColor: selectedTimeSlot === slot 
                        ? '#8B5CF6' 
                        : 'transparent',
                    }}
                    transition={{ type: 'timing', duration: 200 }}
                    style={styles.timeSlotInner}
                  >
                    <Text style={{ color: selectedTimeSlot === slot ? '#38BDF8' : '#A1A1AA' }}>
                      {slot}
                    </Text>
                  </MotiView>
                </Pressable>
              ))}
            </View>
          </ModernCard>
        </MotiView>

        {/* Optional Comment */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
        >
          <ModernCard delay={300}>
            <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Additional Comments (Optional)</Text>
            
            <MotiView
              animate={{ 
                borderColor: commentFocused ? '#38BDF8' : '#52525B',
                translateY: commentFocused ? -2 : 0
              }}
              transition={{ type: 'timing', duration: 200 }}
              style={styles.commentContainer}
            >
              <TextInput
                style={[styles.commentInput, { backgroundColor: 'rgba(24,24,27,0.5)', padding: 16, borderRadius: 12, color: '#38BDF8' }]}
                placeholder="Any special requests or notes for your appointment..."
                placeholderTextColor="#A1A1AA"
                value={comment}
                onChangeText={setComment}
                onFocus={() => setCommentFocused(true)}
                onBlur={() => setCommentFocused(false)}
                multiline
                numberOfLines={4}
              />
            </MotiView>
          </ModernCard>
        </MotiView>
      </ScrollView>

      {/* Footer with Total and Confirm Button */}
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 400 }}
        style={styles.footer}
      >
        <View style={styles.totalContainer}>
          <Text style={{ color: '#38BDF8', fontSize: 16 }}>Total:</Text>
          <Text style={{ color: '#22C55E', fontSize: 20, fontWeight: 'bold' }}>${totalPrice.toFixed(2)}</Text>
        </View>
        
        <Pressable
          onPressIn={() => setConfirmPressed(true)}
          onPressOut={() => setConfirmPressed(false)}
          onPress={handleConfirmBooking}
          disabled={bookingLoading || selectedServices.length === 0 || !selectedTimeSlot}
          style={({ pressed }) => [
            pressed && styles.confirmButtonPressed,
            (selectedServices.length === 0 || !selectedTimeSlot) && styles.confirmButtonDisabled
          ]}
        >
          <ModernCard 
            style={{ backgroundColor: '#22C55E', paddingVertical: 20 }}
            pressed={confirmPressed}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#F3F4F6" />
            ) : (
              <Text style={{ color: '#38BDF8', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Confirm Booking</Text>
            )}
          </ModernCard>
        </Pressable>
      </MotiView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  serviceItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  serviceItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  serviceItemPressed: {
    opacity: 0.9,
  },
  serviceCheckbox: {
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  dateSelector: {
    backgroundColor: 'rgba(18, 18, 18, 0.5)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#52525B',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    width: '31%',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#52525B',
  },
  timeSlotInner: {
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeSlotSelected: {
    borderColor: '#8B5CF6',
  },
  timeSlotPressed: {
    opacity: 0.9,
  },
  commentContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  commentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmButtonPressed: {
    opacity: 0.9,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
});