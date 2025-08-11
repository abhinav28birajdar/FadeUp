import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    TextInput,
    View
} from 'react-native';

import { ModernCard } from '../../src/components/ModernCard';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { Booking, Feedback, Service } from '../../src/types/supabase';

interface ExtendedFeedbackWithDetails extends Feedback {
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
    phone_number?: string;
  };
  booking?: Booking;
  service?: Service;
}

export default function FeedbackScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<ExtendedFeedbackWithDetails[]>([]);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStars: 0,
  });

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const loadFeedbackData = async () => {
    try {
      setLoading(true);

      if (!user?.shop_id) {
        Alert.alert('Error', 'No shop associated with your account');
        return;
      }

      // Fetch feedback with customer details
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          customer:customer_id (id, first_name, last_name, avatar_url, email, phone_number),
          booking:booking_id (id, booking_date, status, total_price, service_ids),
          services:service_id (id, name, price, duration)
        `)
        .eq('shop_id', user.shop_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        return;
      }

      // Set feedback data
      setFeedback(data || []);

      // Calculate stats
      if (data && data.length > 0) {
        const totalRatings = data.length;
        const sumRatings = data.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = sumRatings / totalRatings;

        // Count ratings by star
        const fiveStars = data.filter(item => item.rating === 5).length;
        const fourStars = data.filter(item => item.rating === 4).length;
        const threeStars = data.filter(item => item.rating === 3).length;
        const twoStars = data.filter(item => item.rating === 2).length;
        const oneStars = data.filter(item => item.rating === 1).length;

        setStats({
          averageRating,
          totalRatings,
          fiveStars,
          fourStars,
          threeStars,
          twoStars,
          oneStars,
        });
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
      Alert.alert('Error', 'Failed to load feedback data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeedbackData();
  }, []);

  const renderRatingBar = (filled: number, total: number, label: string, count: number, percentage: number) => {
    return (
      <View className="flex-row items-center mb-2">
        <Text className="text-secondary-light w-12">{label}</Text>
        <View className="flex-1 h-3 bg-dark-card rounded-full overflow-hidden ml-2 mr-2">
          <View 
            className="h-full bg-brand-primary rounded-full" 
            style={{ width: `${percentage}%` }}
          />
        </View>
        <Text className="text-secondary-light text-xs w-8">{count}</Text>
      </View>
    );
  };

  const getFilteredFeedback = () => {
    let filtered = feedback;

    // Apply rating filter
    if (filter === 'positive') {
      filtered = filtered.filter(item => item.rating >= 4);
    } else if (filter === 'negative') {
      filtered = filtered.filter(item => item.rating <= 2);
    } else if (filter === 'neutral') {
      filtered = filtered.filter(item => item.rating === 3);
    }

    // Apply search query filter if exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.comment?.toLowerCase().includes(query) ||
        `${item.customer?.first_name} ${item.customer?.last_name}`.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const renderFilterButton = (filterValue: typeof filter, label: string) => (
    <Pressable onPress={() => setFilter(filterValue)}>
      {({ pressed }) => (
        <MotiView
          animate={{ 
            scale: pressed ? 0.95 : 1,
            backgroundColor: filter === filterValue ? '#CB9C5E20' : 'transparent',
          }}
          className={`px-4 py-2 rounded-lg ${filter === filterValue ? 'border border-brand-primary/30' : ''}`}
        >
          <Text className={`font-medium ${filter === filterValue ? 'text-brand-primary' : 'text-secondary-light'}`}>
            {label}
          </Text>
        </MotiView>
      )}
    </Pressable>
  );

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons 
          key={i}
          name={i <= rating ? 'star' : 'star-outline'} 
          size={16} 
          color={i <= rating ? '#CB9C5E' : '#71717A'} 
        />
      );
    }
    return <View className="flex-row">{stars}</View>;
  };

  const renderFeedbackItem = ({ item, index }: { item: ExtendedFeedbackWithDetails; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ delay: index * 50 }}
      className="mb-4"
    >
      <ModernCard
        onPress={() => router.push(`/(shopkeeper)/feedback/${item.id}`)}
      >
        <View className="p-4">
          {/* Header with customer info and rating */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-brand-primary/20 rounded-full items-center justify-center mr-3">
                {item.customer?.avatar_url ? (
                  <Image
                    source={{ uri: item.customer.avatar_url }}
                    style={{ width: 40, height: 40 }}
                    contentFit="cover"
                    className="rounded-full"
                  />
                ) : (
                  <Text className="text-brand-primary font-semibold">
                    {item.customer?.first_name?.[0]}{item.customer?.last_name?.[0]}
                  </Text>
                )}
              </View>
              <View>
                <Text className="text-primary-light font-semibold">
                  {item.customer?.first_name} {item.customer?.last_name}
                </Text>
                <Text className="text-secondary-light text-xs">
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            {renderStars(item.rating)}
          </View>
          
          {/* Service info */}
          <View className="bg-dark-background/60 px-3 py-2 rounded-lg mb-3">
            <Text className="text-secondary-light text-xs">
              {item.booking?.service_ids ? 
                `Service: ${item.booking.service_ids.length > 1 ? 'Multiple services' : 'Single service'}` : 
                'Service information unavailable'}
            </Text>
          </View>

          {/* Comment */}
          {item.comment ? (
            <View className="bg-dark-background/30 p-3 rounded-lg">
              <Text className="text-secondary-light">"{item.comment}"</Text>
            </View>
          ) : (
            <Text className="text-secondary-light italic">No comment provided</Text>
          )}

          {/* View Details */}
          <View className="flex-row justify-end mt-3">
            <Ionicons name="chevron-forward" size={16} color="#A1A1AA" />
          </View>
        </View>
      </ModernCard>
    </MotiView>
  );

  const filteredFeedback = getFilteredFeedback();

  if (loading) {
    return (
      <View className="flex-1 bg-dark-background justify-center items-center">
        <ActivityIndicator size="large" color="#CB9C5E" />
        <Text className="text-secondary-light mt-4">Loading feedback...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text className="text-primary-light text-4xl font-extrabold">
            Customer Feedback
          </Text>
          <Text className="text-secondary-light text-lg mt-1">
            Review what your customers are saying
          </Text>
        </MotiView>
      </View>

      <FlatList
        data={filteredFeedback}
        renderItem={renderFeedbackItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        ListHeaderComponent={(
          <>
            {/* Stats Summary Card */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 100 }}
              className="mb-6"
            >
              <ModernCard>
                <LinearGradient
                  colors={['#1f1f1f', '#121212']}
                  className="p-5 rounded-t-xl"
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-secondary-light">
                        Average Rating
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-primary-light text-4xl font-bold mr-2">
                          {stats.averageRating.toFixed(1)}
                        </Text>
                        <View>
                          {renderStars(Math.round(stats.averageRating))}
                          <Text className="text-secondary-light text-xs mt-1">
                            {stats.totalRatings} ratings
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="items-center">
                      <Text className="text-secondary-light">
                        Total Feedback
                      </Text>
                      <Text className="text-primary-light text-3xl font-bold">
                        {stats.totalRatings}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                <View className="p-4">
                  {/* Rating distribution */}
                  {renderRatingBar(5, 5, '5 stars', stats.fiveStars, (stats.fiveStars / stats.totalRatings) * 100 || 0)}
                  {renderRatingBar(4, 5, '4 stars', stats.fourStars, (stats.fourStars / stats.totalRatings) * 100 || 0)}
                  {renderRatingBar(3, 5, '3 stars', stats.threeStars, (stats.threeStars / stats.totalRatings) * 100 || 0)}
                  {renderRatingBar(2, 5, '2 stars', stats.twoStars, (stats.twoStars / stats.totalRatings) * 100 || 0)}
                  {renderRatingBar(1, 5, '1 star', stats.oneStars, (stats.oneStars / stats.totalRatings) * 100 || 0)}
                </View>
              </ModernCard>
            </MotiView>

            {/* Search Bar */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 150 }}
              className="mb-6"
            >
              <View className="flex-row items-center bg-dark-card rounded-xl pl-4">
                <Ionicons name="search" size={20} color="#71717A" />
                <TextInput
                  className="flex-1 py-3 px-2 text-primary-light"
                  placeholder="Search feedback..."
                  placeholderTextColor="#71717A"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                  <Pressable onPress={() => setSearchQuery('')} className="p-3">
                    <Ionicons name="close-circle" size={20} color="#71717A" />
                  </Pressable>
                ) : null}
              </View>
            </MotiView>

            {/* Filters */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 }}
              className="mb-6"
            >
              <Text className="text-primary-light text-xl font-semibold mb-3">Filter Reviews</Text>
              <View className="flex-row space-x-2">
                {renderFilterButton('all', 'All')}
                {renderFilterButton('positive', 'Positive')}
                {renderFilterButton('neutral', 'Neutral')}
                {renderFilterButton('negative', 'Negative')}
              </View>
            </MotiView>

            {filteredFeedback.length === 0 && (
              <ModernCard className="py-8 items-center justify-center">
                <Ionicons name="chatbubbles-outline" size={48} color="#71717A" />
                <Text className="text-secondary-light mt-4 text-center">
                  No feedback found matching your filters
                </Text>
              </ModernCard>
            )}

            {filteredFeedback.length > 0 && (
              <Text className="text-primary-light text-xl font-semibold mb-3">
                {filteredFeedback.length} {filteredFeedback.length === 1 ? 'Review' : 'Reviews'}
              </Text>
            )}
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#CB9C5E']}
            tintColor="#CB9C5E"
          />
        }
      />
    </View>
  );
}
