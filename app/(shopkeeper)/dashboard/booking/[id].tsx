import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { ModernCard } from '../../../../src/components/ModernCard';
import { supabase } from '../../../../src/lib/supabase';
import { useAuthStore } from '../../../../src/store/authStore';
import { Booking, Service, UserProfile } from '../../../../src/types/supabase';

interface BookingDetail extends Booking {
  customer?: UserProfile;
  services?: Service[];
  feedback?: {
    rating: number;
    comment?: string;
  };
}

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [id]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);

      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (bookingError) throw bookingError;

      if (bookingData) {
        // Fetch customer details
        const { data: customerData } = await supabase
          .from('users')
          .select('*')
          .eq('id', bookingData.customer_id)
          .single();

        // Fetch services details
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .in('id', bookingData.service_ids);

        // Fetch feedback if exists
        const { data: feedbackData } = await supabase
          .from('feedback')
          .select('rating, comment')
          .eq('booking_id', bookingData.id)
          .single();

        setBooking({
          ...bookingData,
          customer: customerData || undefined,
          services: servicesData || [],
          feedback: feedbackData || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: Booking['status']) => {
    if (!booking) return;

    setActionLoading(true);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', booking.id);

      if (error) throw error;

      setBooking(prev => prev ? { ...prev, status: newStatus } : null);
      Alert.alert('Success', `Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      Alert.alert('Error', 'Failed to update booking status');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'in_progress': return '#8B5CF6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark-background justify-center items-center">
        <ActivityIndicator size="large" color="#CB9C5E" />
        <Text className="text-secondary-light mt-4">Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 bg-dark-background justify-center items-center px-6">
        <ModernCard className="p-6 items-center">
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text className="text-primary-light text-xl mt-4 text-center">
            Booking not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 px-6 py-3 bg-brand-primary rounded-xl"
          >
            <Text className="text-dark-background font-semibold">Go Back</Text>
          </Pressable>
        </ModernCard>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="flex-row items-center"
        >
          <Pressable onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#F3F4F6" />
          </Pressable>
          <Text className="text-primary-light text-3xl font-bold">
            Booking Details
          </Text>
        </MotiView>
      </View>

      <View className="px-6 space-y-6">
        {/* Customer Information */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
        >
          <ModernCard>
            <Text className="text-primary-light text-xl font-bold mb-4">
              Customer Information
            </Text>
            <View className="space-y-2">
              <Text className="text-secondary-light">
                Name: {booking.customer?.first_name} {booking.customer?.last_name}
              </Text>
              <Text className="text-secondary-light">
                Email: {booking.customer?.email}
              </Text>
              {booking.customer?.phone_number && (
                <Text className="text-secondary-light">
                  Phone: {booking.customer.phone_number}
                </Text>
              )}
            </View>
          </ModernCard>
        </MotiView>

        {/* Booking Information */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
        >
          <ModernCard>
            <Text className="text-primary-light text-xl font-bold mb-4">
              Booking Information
            </Text>
            <View className="space-y-2">
              <Text className="text-secondary-light">
                Date: {new Date(booking.booking_date).toLocaleDateString()}
              </Text>
              <Text className="text-secondary-light">
                Time: {booking.slot_time}
              </Text>
              <Text className="text-secondary-light">
                Total Price: ${booking.total_price.toFixed(2)}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-secondary-light mr-2">Status:</Text>
                <View 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: getStatusColor(booking.status) + '20' }}
                >
                  <Text 
                    className="text-sm font-semibold capitalize"
                    style={{ color: getStatusColor(booking.status) }}
                  >
                    {booking.status}
                  </Text>
                </View>
              </View>
              {booking.notes && (
                <View className="mt-2">
                  <Text className="text-secondary-light font-semibold">Notes:</Text>
                  <Text className="text-secondary-light mt-1">{booking.notes}</Text>
                </View>
              )}
            </View>
          </ModernCard>
        </MotiView>

        {/* Services */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
        >
          <ModernCard>
            <Text className="text-primary-light text-xl font-bold mb-4">
              Services
            </Text>
            {booking.services?.map((service, index) => (
              <View key={service.id} className={`flex-row justify-between items-center ${index < booking.services!.length - 1 ? 'mb-3' : ''}`}>
                <View className="flex-1">
                  <Text className="text-primary-light font-semibold">{service.name}</Text>
                  <Text className="text-secondary-light text-sm">{service.duration} minutes</Text>
                  {service.description && (
                    <Text className="text-secondary-light text-xs mt-1">{service.description}</Text>
                  )}
                </View>
                <Text className="text-brand-primary font-bold">${service.price}</Text>
              </View>
            ))}
          </ModernCard>
        </MotiView>

        {/* Feedback */}
        {booking.feedback && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
          >
            <ModernCard>
              <Text className="text-primary-light text-xl font-bold mb-4">
                Customer Feedback
              </Text>
              <View className="flex-row items-center mb-2">
                <Text className="text-secondary-light mr-2">Rating:</Text>
                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} className="text-lg">
                      {star <= booking.feedback!.rating ? '⭐' : '☆'}
                    </Text>
                  ))}
                </View>
                <Text className="text-brand-primary ml-2 font-semibold">
                  {booking.feedback.rating}/5
                </Text>
              </View>
              {booking.feedback.comment && (
                <View className="mt-2">
                  <Text className="text-secondary-light font-semibold">Comment:</Text>
                  <Text className="text-secondary-light mt-1">{booking.feedback.comment}</Text>
                </View>
              )}
            </ModernCard>
          </MotiView>
        )}

        {/* Action Buttons */}
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            className="space-y-3 pb-8"
          >
            {booking.status === 'pending' && (
              <Pressable
                onPress={() => handleUpdateStatus('confirmed')}
                disabled={actionLoading}
              >
                {({ pressed }) => (
                  <MotiView
                    animate={{ scale: pressed ? 0.96 : 1 }}
                    className="bg-status-confirmed py-4 rounded-xl items-center"
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#F3F4F6" />
                    ) : (
                      <Text className="text-primary-light text-lg font-bold">
                        Confirm Booking
                      </Text>
                    )}
                  </MotiView>
                )}
              </Pressable>
            )}

            {booking.status === 'confirmed' && (
              <Pressable
                onPress={() => handleUpdateStatus('in_progress')}
                disabled={actionLoading}
              >
                {({ pressed }) => (
                  <MotiView
                    animate={{ scale: pressed ? 0.96 : 1 }}
                    className="bg-status-pending py-4 rounded-xl items-center"
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#F3F4F6" />
                    ) : (
                      <Text className="text-primary-light text-lg font-bold">
                        Start Service
                      </Text>
                    )}
                  </MotiView>
                )}
              </Pressable>
            )}

            {booking.status === 'in_progress' && (
              <Pressable
                onPress={() => handleUpdateStatus('completed')}
                disabled={actionLoading}
              >
                {({ pressed }) => (
                  <MotiView
                    animate={{ scale: pressed ? 0.96 : 1 }}
                    className="bg-status-completed py-4 rounded-xl items-center"
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#F3F4F6" />
                    ) : (
                      <Text className="text-primary-light text-lg font-bold">
                        Complete Service
                      </Text>
                    )}
                  </MotiView>
                )}
              </Pressable>
            )}

            <Pressable
              onPress={() => handleUpdateStatus('cancelled')}
              disabled={actionLoading}
            >
              {({ pressed }) => (
                <MotiView
                  animate={{ scale: pressed ? 0.96 : 1 }}
                  className="bg-status-error py-4 rounded-xl items-center border border-red-500/30"
                >
                  <Text className="text-primary-light text-lg font-bold">
                    Cancel Booking
                  </Text>
                </MotiView>
              )}
            </Pressable>
          </MotiView>
        )}
      </View>
    </ScrollView>
  );
}