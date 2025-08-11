import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { ModernCard } from '../../../src/components/ModernCard';
import { supabase } from '../../../src/lib/supabase';
import { Booking, Service, UserProfile } from '../../../src/types/supabase';

interface FeedbackDetail {
  id: string;
  booking_id: string;
  customer_id: string;
  shop_id: string;
  service_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

interface DetailedBooking extends Booking {
  services?: Service[];
}

export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [booking, setBooking] = useState<DetailedBooking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchFeedbackDetails();
    } else {
      setError('No feedback ID provided');
      setLoading(false);
    }
  }, [id]);

  const fetchFeedbackDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch feedback details
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .eq('id', id)
        .single();

      if (feedbackError) {
        throw feedbackError;
      }
      
      if (feedbackData) {
        setFeedback(feedbackData);
        
        // Fetch customer details
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', feedbackData.customer_id)
          .single();

        if (customerError) {
          console.error('Error fetching customer:', customerError);
        } else if (customerData) {
          setCustomer(customerData);
        }
        
        // Fetch booking details if exists
        if (feedbackData.booking_id) {
          const { data: bookingData, error: bookingError } = await supabase
            .from('bookings')
            .select(`
              *,
              services:services (*)
            `)
            .eq('id', feedbackData.booking_id)
            .single();

          if (bookingError) {
            console.error('Error fetching booking:', bookingError);
          } else if (bookingData) {
            setBooking(bookingData);
          }
        }
        
        // Fetch service details if exists
        if (feedbackData.service_id) {
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('*')
            .eq('id', feedbackData.service_id)
            .single();

          if (serviceError) {
            console.error('Error fetching service:', serviceError);
          } else if (serviceData) {
            setService(serviceData);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching feedback details:', error);
      setError(error.message || 'Failed to load feedback details');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={22}
            color={star <= rating ? "#CB9C5E" : "#71717A"}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark-background justify-center items-center">
        <ActivityIndicator size="large" color="#CB9C5E" />
        <Text className="text-secondary-light mt-4">Loading feedback details...</Text>
      </View>
    );
  }

  if (error || !feedback) {
    return (
      <View className="flex-1 bg-dark-background p-6 justify-center items-center">
        <Ionicons name="alert-circle-outline" size={60} color="#A1A1AA" />
        <Text className="text-primary-light text-xl font-bold mt-4">Error</Text>
        <Text className="text-secondary-light text-center mt-2">
          {error || 'Feedback not found'}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 bg-brand-primary/20 px-6 py-3 rounded-lg"
        >
          <Text className="text-brand-primary font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const customerName = customer
    ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
    : 'Anonymous Customer';

  return (
    <ScrollView className="flex-1 bg-dark-background">
      {/* Header with back button */}
      <View className="pt-16 px-6 flex-row items-center mb-6">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-dark-card items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
        <Text className="text-primary-light text-xl font-bold ml-4">
          Feedback Details
        </Text>
      </View>

      {/* Content */}
      <View className="px-6 pb-20">
        {/* Rating Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="mb-6"
        >
          <ModernCard>
            <View className="p-4 border-b border-dark-secondary">
              <View className="flex-row justify-between items-center">
                <Text className="text-primary-light font-semibold">Rating</Text>
                <View className="flex-row items-center">
                  {renderStars(feedback.rating)}
                  <Text className="text-brand-primary font-bold ml-2">
                    {feedback.rating}/5
                  </Text>
                </View>
              </View>
            </View>

            <View className="p-4">
              <Text className="text-secondary-light mb-2">
                Submitted on {formatDate(feedback.created_at)}
              </Text>
              
              {feedback.comment ? (
                <View className="bg-dark-secondary/20 p-4 rounded-lg mt-2">
                  <Text className="text-primary-light italic">"{feedback.comment}"</Text>
                </View>
              ) : (
                <Text className="text-secondary-light italic">No comment provided</Text>
              )}
            </View>
          </ModernCard>
        </MotiView>

        {/* Customer Information */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          className="mb-6"
        >
          <Text className="text-primary-light text-lg font-semibold mb-3">
            Customer Information
          </Text>
          <ModernCard>
            <View className="p-4">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-full overflow-hidden bg-dark-secondary mr-3">
                  {customer?.avatar_url ? (
                    <Image
                      source={{ uri: customer.avatar_url }}
                      style={{ width: 48, height: 48 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Text className="text-primary-light text-xl font-semibold">
                        {customerName.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View>
                  <Text className="text-primary-light font-semibold text-lg">
                    {customerName}
                  </Text>
                  {customer?.email && (
                    <Text className="text-secondary-light">
                      {customer.email}
                    </Text>
                  )}
                </View>
              </View>
              
              {customer?.phone_number && (
                <View className="flex-row items-center mb-2">
                  <Ionicons name="call-outline" size={16} color="#A1A1AA" style={{ marginRight: 8 }} />
                  <Text className="text-secondary-light">{customer.phone_number}</Text>
                </View>
              )}
            </View>
          </ModernCard>
        </MotiView>

        {/* Service Details */}
        {service && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            className="mb-6"
          >
            <Text className="text-primary-light text-lg font-semibold mb-3">
              Service Details
            </Text>
            <ModernCard>
              <View className="p-4">
                <Text className="text-primary-light font-semibold mb-1">
                  {service.name}
                </Text>
                <View className="flex-row justify-between mt-2">
                  <View className="flex-row items-center">
                    <Ionicons name="cash-outline" size={16} color="#A1A1AA" style={{ marginRight: 8 }} />
                    <Text className="text-secondary-light">
                      ${service.price?.toFixed(2) || 'N/A'}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#A1A1AA" style={{ marginRight: 8 }} />
                    <Text className="text-secondary-light">
                      {service.duration} min
                    </Text>
                  </View>
                </View>
              </View>
            </ModernCard>
          </MotiView>
        )}

        {/* Booking Information */}
        {booking && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            className="mb-6"
          >
            <Text className="text-primary-light text-lg font-semibold mb-3">
              Booking Information
            </Text>
            <ModernCard>
              <View className="p-4">
                <View className="flex-row justify-between mb-3">
                  <Text className="text-secondary-light">Booking ID</Text>
                  <Text className="text-primary-light font-medium">#{booking.id.substring(0, 8)}</Text>
                </View>
                
                <View className="flex-row justify-between mb-3">
                  <Text className="text-secondary-light">Date</Text>
                  <Text className="text-primary-light">
                    {formatDate(booking.booking_date)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between mb-3">
                  <Text className="text-secondary-light">Status</Text>
                  <Text 
                    className={`font-medium ${
                      booking.status === 'completed' 
                        ? 'text-green-500' 
                        : booking.status === 'cancelled' 
                        ? 'text-red-500' 
                        : 'text-brand-primary'
                    }`}
                  >
                    {booking.status?.toUpperCase()}
                  </Text>
                </View>
                
                {booking.total_price && (
                  <View className="flex-row justify-between">
                    <Text className="text-secondary-light">Total Amount</Text>
                    <Text className="text-primary-light font-medium">
                      ${booking.total_price.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* View Booking Button */}
              <Pressable 
                onPress={() => router.push(`/(shopkeeper)/dashboard/booking/${booking.id}`)}
                className="bg-brand-primary/10 border-t border-dark-secondary p-4"
              >
                <Text className="text-brand-primary text-center font-semibold">
                  View Booking Details
                </Text>
              </Pressable>
            </ModernCard>
          </MotiView>
        )}
      </View>
    </ScrollView>
  );
}