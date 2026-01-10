/**
 * Reviews Screen
 * View and manage reviews for a shop
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar } from '../../components/ui';
import { useTheme } from '../../theme';

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  date: string;
  services: string[];
  barberName?: string;
  photos?: string[];
  reply?: {
    text: string;
    date: string;
  };
  helpful: number;
  isVerified: boolean;
}

const mockReviews: Review[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Smith',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    rating: 5,
    comment: "Best haircut I've ever had! Mike really knows his craft. The attention to detail was incredible and the atmosphere was super relaxed.",
    date: '2 days ago',
    services: ['Fade Haircut', 'Beard Trim'],
    barberName: 'Mike Anderson',
    photos: [
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300',
    ],
    helpful: 12,
    isVerified: true,
  },
  {
    id: '2',
    customerId: '2',
    customerName: 'Robert Wilson',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    rating: 4,
    comment: 'Great experience overall. Had to wait a bit longer than expected but the service was worth it.',
    date: '1 week ago',
    services: ['Classic Haircut'],
    barberName: 'James Wilson',
    reply: {
      text: "Thanks for your feedback, Robert! We're working on reducing wait times. Looking forward to seeing you again!",
      date: '6 days ago',
    },
    helpful: 5,
    isVerified: true,
  },
  {
    id: '3',
    customerId: '3',
    customerName: 'David Brown',
    customerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    rating: 5,
    comment: 'Excellent service! Very professional and friendly staff. Will definitely come back.',
    date: '2 weeks ago',
    services: ['Hot Towel Shave'],
    helpful: 8,
    isVerified: true,
  },
  {
    id: '4',
    customerId: '4',
    customerName: 'Michael Taylor',
    customerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    rating: 3,
    comment: 'Decent haircut but nothing special. Price was fair for what you get.',
    date: '3 weeks ago',
    services: ['Kids Haircut'],
    helpful: 2,
    isVerified: false,
  },
  {
    id: '5',
    customerId: '5',
    customerName: 'Chris Johnson',
    customerAvatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200',
    rating: 5,
    comment: 'Top notch! The fade was perfect and they really took their time to get it right.',
    date: '1 month ago',
    services: ['Fade Haircut', 'Line Up'],
    barberName: 'Mike Anderson',
    photos: [
      'https://images.unsplash.com/photo-1593702288056-7927b442d0fa?w=300',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=300',
    ],
    helpful: 15,
    isVerified: true,
  },
];

const ratingStats = {
  average: 4.8,
  total: 256,
  breakdown: [
    { stars: 5, count: 180, percentage: 70 },
    { stars: 4, count: 52, percentage: 20 },
    { stars: 3, count: 15, percentage: 6 },
    { stars: 2, count: 6, percentage: 2 },
    { stars: 1, count: 3, percentage: 1 },
  ],
};

type FilterType = 'all' | '5' | '4' | '3' | '2' | '1' | 'photos';

export const ReviewsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  const filters = [
    { key: 'all', label: 'All' },
    { key: '5', label: '5 ★' },
    { key: '4', label: '4 ★' },
    { key: '3', label: '3 ★' },
    { key: '2', label: '2 ★' },
    { key: '1', label: '1 ★' },
    { key: 'photos', label: 'With Photos' },
  ];

  const filteredReviews = mockReviews.filter((review) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'photos') return review.photos && review.photos.length > 0;
    return review.rating === parseInt(activeFilter);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    return 0; // 'recent' - already sorted by date in mock data
  });

  const renderRatingOverview = () => (
    <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.overviewLeft}>
        <Text style={[styles.averageRating, { color: theme.colors.text.primary }]}>
          {ratingStats.average}
        </Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.floor(ratingStats.average) ? 'star' : 'star-outline'}
              size={18}
              color={theme.colors.warning[400]}
            />
          ))}
        </View>
        <Text style={[styles.totalReviews, { color: theme.colors.text.secondary }]}>
          {ratingStats.total} reviews
        </Text>
      </View>
      <View style={styles.overviewRight}>
        {ratingStats.breakdown.map((item) => (
          <View key={item.stars} style={styles.breakdownRow}>
            <Text style={[styles.breakdownStars, { color: theme.colors.text.secondary }]}>
              {item.stars}
            </Text>
            <Ionicons name="star" size={12} color={theme.colors.warning[400]} />
            <View style={[styles.breakdownBar, { backgroundColor: theme.colors.neutral[100] }]}>
              <View
                style={[
                  styles.breakdownFill,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: theme.colors.warning[400],
                  },
                ]}
              />
            </View>
            <Text style={[styles.breakdownCount, { color: theme.colors.text.muted }]}>
              {item.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.customerAvatar }} style={styles.reviewerAvatar} />
        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerNameRow}>
            <Text style={[styles.reviewerName, { color: theme.colors.text.primary }]}>
              {item.customerName}
            </Text>
            {item.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: theme.colors.success[50] }]}>
                <Ionicons name="checkmark" size={10} color={theme.colors.success[500]} />
                <Text style={[styles.verifiedText, { color: theme.colors.success[600] }]}>
                  Verified
                </Text>
              </View>
            )}
          </View>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= item.rating ? 'star' : 'star-outline'}
                size={14}
                color={theme.colors.warning[400]}
              />
            ))}
            <Text style={[styles.reviewDate, { color: theme.colors.text.muted }]}>
              · {item.date}
            </Text>
          </View>
        </View>
      </View>

      {item.services.length > 0 && (
        <View style={styles.servicesRow}>
          {item.services.map((service, index) => (
            <View
              key={index}
              style={[styles.serviceBadge, { backgroundColor: theme.colors.neutral[100] }]}
            >
              <Text style={[styles.serviceText, { color: theme.colors.text.secondary }]}>
                {service}
              </Text>
            </View>
          ))}
          {item.barberName && (
            <Text style={[styles.barberText, { color: theme.colors.text.muted }]}>
              with {item.barberName}
            </Text>
          )}
        </View>
      )}

      <Text style={[styles.reviewComment, { color: theme.colors.text.primary }]}>
        {item.comment}
      </Text>

      {item.photos && item.photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photosScroll}
        >
          {item.photos.map((photo, index) => (
            <TouchableOpacity key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.reviewPhoto} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {item.reply && (
        <View style={[styles.replyContainer, { backgroundColor: theme.colors.neutral[50] }]}>
          <View style={styles.replyHeader}>
            <Text style={[styles.replyLabel, { color: theme.colors.text.secondary }]}>
              Owner Response
            </Text>
            <Text style={[styles.replyDate, { color: theme.colors.text.muted }]}>
              {item.reply.date}
            </Text>
          </View>
          <Text style={[styles.replyText, { color: theme.colors.text.primary }]}>
            {item.reply.text}
          </Text>
        </View>
      )}

      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Ionicons
            name="thumbs-up-outline"
            size={16}
            color={theme.colors.text.secondary}
          />
          <Text style={[styles.helpfulText, { color: theme.colors.text.secondary }]}>
            Helpful ({item.helpful})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons
            name="flag-outline"
            size={16}
            color={theme.colors.text.muted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Reviews
        </Text>
        <TouchableOpacity onPress={() => router.push('/reviews/write')}>
          <Ionicons
            name="create-outline"
            size={24}
            color={theme.colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedReviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Rating Overview */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              {renderRatingOverview()}
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScroll}
              contentContainerStyle={styles.filtersContent}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        activeFilter === filter.key
                          ? theme.colors.primary[500]
                          : theme.colors.surface,
                      borderColor:
                        activeFilter === filter.key
                          ? theme.colors.primary[500]
                          : theme.colors.neutral[200],
                    },
                  ]}
                  onPress={() => setActiveFilter(filter.key as FilterType)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      {
                        color:
                          activeFilter === filter.key
                            ? '#FFFFFF'
                            : theme.colors.text.secondary,
                      },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sort Options */}
            <View style={styles.sortContainer}>
              <Text style={[styles.resultsText, { color: theme.colors.text.secondary }]}>
                {sortedReviews.length} reviews
              </Text>
              <View style={styles.sortOptions}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortBy === 'recent' && {
                      backgroundColor: theme.colors.neutral[100],
                    },
                  ]}
                  onPress={() => setSortBy('recent')}
                >
                  <Text
                    style={[
                      styles.sortText,
                      {
                        color:
                          sortBy === 'recent'
                            ? theme.colors.primary[500]
                            : theme.colors.text.secondary,
                      },
                    ]}
                  >
                    Recent
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortBy === 'helpful' && {
                      backgroundColor: theme.colors.neutral[100],
                    },
                  ]}
                  onPress={() => setSortBy('helpful')}
                >
                  <Text
                    style={[
                      styles.sortText,
                      {
                        color:
                          sortBy === 'helpful'
                            ? theme.colors.primary[500]
                            : theme.colors.text.secondary,
                      },
                    ]}
                  >
                    Most Helpful
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  overviewCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  totalReviews: {
    fontSize: 13,
  },
  overviewRight: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  breakdownStars: {
    width: 12,
    fontSize: 12,
    marginRight: 4,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownCount: {
    width: 30,
    fontSize: 11,
    textAlign: 'right',
  },
  filtersScroll: {
    marginBottom: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 14,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
  },
  reviewCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    marginLeft: 6,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  serviceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceText: {
    fontSize: 11,
  },
  barberText: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 22,
  },
  photosScroll: {
    marginTop: 12,
  },
  photoContainer: {
    marginRight: 8,
  },
  reviewPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  replyContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyDate: {
    fontSize: 11,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {
    fontSize: 13,
  },
});

export default ReviewsScreen;
