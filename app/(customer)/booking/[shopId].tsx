import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ModernCard } from '../../../src/components/ModernCard';
import { supabase } from '../../../src/lib/supabase';
import supabaseUtils from '../../../src/lib/supabaseUtils';
import { useAuthStore } from '../../../src/store/authStore';
import { Service, Shop } from '../../../src/types/supabase';

// Available time slots
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function BookingScreen() {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesFocused, setNotesFocused] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Calculate total price
  const totalPrice = services
    .find(service => service.id === selectedServiceId)?.price || 0;

  useEffect(() => {
    const fetchShopAndServices = async () => {
      try {
        // Fetch shop details
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId as string)
          .single();
        
        if (shopError) throw shopError;
        
        if (shopData) {
          setShop(shopData);
          
          // Fetch services for this shop
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .eq('shop_id', shopData.id)
            .eq('is_active', true);
          
          if (servicesError) throw servicesError;
          
          setServices(servicesData || []);
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopAndServices();
    }
  }, [shopId]);

  const handleServiceSelection = (serviceId: string) => {
    setSelectedServiceId(serviceId === selectedServiceId ? null : serviceId);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBookingDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleConfirmBooking = async () => {
    // Validate inputs
    if (!selectedServiceId) {
      Alert.alert("Error", "Please select a service");
      return;
    }

    if (!selectedSlot) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "Please log in to book");
      return;
    }

    setBookingLoading(true);

    try {
      // Format date as YYYY-MM-DD
      const formattedDate = bookingDate.toISOString().split("T")[0];

      // Create booking using utility function
      const bookingResult = await supabaseUtils.bookingUtils.createLegacyBooking({
        customer_id: user.id,
        shop_id: shopId as string,
        service_id: selectedServiceId,
        booking_date: formattedDate,
        booking_time: selectedSlot,
        total_price: totalPrice,
        notes: notes || undefined,
      });

      if (bookingResult.error) {
        throw bookingResult.error;
      }

      const booking = bookingResult.data;
      if (!booking) {
        throw new Error('Booking creation failed');
      }

      // Join the queue using utility function
      const queueResult = await supabaseUtils.queueUtils.joinQueue({
        booking_id: booking.id,
        customer_id: user.id,
        shop_id: shopId as string,
      });

      if (queueResult.error) {
        console.warn('Failed to join queue:', queueResult.error);
        // Don't fail the entire booking if queue join fails
      }
      
      Alert.alert(
        "Success", 
        "Booking confirmed successfully! You've been added to the queue.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(customer)/booking/confirmation")
          }
        ]
      );
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert("Error", "Failed to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-dark-background">
        <ActivityIndicator size="large" color="#CB9C5E" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View className="flex-1 p-4 justify-center items-center bg-dark-background">
        <ModernCard>
          <Text className="text-lg text-primary-light text-center">
            Shop not found
          </Text>
        </ModernCard>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-background" contentContainerStyle={{ padding: 16 }}>
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <Text className="text-4xl font-bold text-primary-light mb-6">
          Book Your Slot
        </Text>
      </MotiView>

      {/* Choose Service */}
      <ModernCard delay={100} className="mb-4">
        <Text className="text-xl font-bold text-primary-light mb-4">
          Choose Service
        </Text>

        {services.map((service, index) => (
          <Pressable
            key={service.id}
            onPress={() => handleServiceSelection(service.id)}
            className={`mb-3 ${index === services.length - 1 ? 'mb-0' : ''}`}
          >
            <MotiView
              animate={{ 
                backgroundColor: selectedServiceId === service.id
                  ? "rgba(203, 156, 94, 0.2)"
                  : "transparent",
                borderColor: selectedServiceId === service.id
                  ? "#CB9C5E"
                  : "#52525B",
              }}
              className="flex-row justify-between items-center p-3 rounded-lg border"
            >
              <View className="flex-1">
                <Text className="text-base font-bold text-primary-light">
                  {service.name}
                </Text>
                <Text className="text-sm text-secondary-light">
                  {service.duration} minutes
                </Text>
                {service.description && (
                  <Text className="text-xs text-secondary-light mt-1">
                    {service.description}
                  </Text>
                )}
              </View>
              <Text className="text-base font-bold text-green-400">
                ${service.price.toFixed(2)}
              </Text>
            </MotiView>
          </Pressable>
        ))}

        {selectedServiceId && (
          <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-600">
            <Text className="text-lg font-bold text-primary-light">
              Total
            </Text>
            <Text className="text-lg font-bold text-green-400">
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
        )}
      </ModernCard>

      {/* Select Date & Time */}
      <ModernCard delay={200} className="mb-4">
        <Text className="text-xl font-bold text-primary-light mb-4">
          Select Date & Time
        </Text>

        <Pressable
          onPress={() => setShowDatePicker(true)}
          className="flex-row justify-between items-center p-3 rounded-lg border border-gray-600 mb-4"
        >
          <Text className="text-base text-primary-light">
            {formatDate(bookingDate)}
          </Text>
          <Text className="text-base text-accent-secondary">
            Change
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={bookingDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
            themeVariant="dark"
          />
        )}

        <Text className="text-base font-bold text-primary-light mb-3">
          Available Slots
        </Text>

        <View className="flex-row flex-wrap -mx-1">
          {TIME_SLOTS.map((slot) => (
            <Pressable
              key={slot}
              onPress={() => setSelectedSlot(slot)}
              className="w-1/3 p-1"
            >
              <MotiView
                animate={{ 
                  backgroundColor: selectedSlot === slot 
                    ? "#CB9C5E"
                    : "transparent",
                  borderColor: selectedSlot === slot
                    ? "#CB9C5E"
                    : "#52525B",
                }}
                className="p-2 rounded-lg border items-center"
              >
                <Text className={`text-sm font-bold ${
                  selectedSlot === slot
                    ? "text-dark-background"
                    : "text-secondary-light"
                }`}>
                  {slot}
                </Text>
              </MotiView>
            </Pressable>
          ))}
        </View>
      </ModernCard>

      {/* Notes (Optional) */}
      <ModernCard delay={300} className="mb-6">
        <Text className="text-xl font-bold text-primary-light mb-4">
          Notes (Optional)
        </Text>

        <MotiView
          animate={{ 
            borderColor: notesFocused ? "#38BDF8" : "#52525B"
          }}
          className="border rounded-xl bg-dark-background/50 p-4"
        >
          <TextInput
            placeholder="Any special requests or notes for your booking..."
            placeholderTextColor="#A1A1AA"
            value={notes}
            onChangeText={setNotes}
            onFocus={() => setNotesFocused(true)}
            onBlur={() => setNotesFocused(false)}
            multiline
            numberOfLines={4}
            className="color-primary-light text-base h-24"
            style={{ textAlignVertical: "top" }}
          />
        </MotiView>
      </ModernCard>

      {/* Confirm Booking Button */}
      <View className="mb-10">
        <Pressable
          onPress={handleConfirmBooking}
          disabled={bookingLoading}
        >
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.98 : 1 }}
              className="bg-brand-primary py-5 rounded-2xl items-center justify-center h-15"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {bookingLoading ? (
                <ActivityIndicator color="#1A1A1A" />
              ) : (
                <Text className="text-lg font-bold text-dark-background">
                  Confirm Booking
                </Text>
              )}
            </MotiView>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}