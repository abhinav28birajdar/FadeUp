/**
 * Customer Bookings Screen
 * View and manage upcoming and past bookings
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge, Button, TabBar } from '../../components/ui';
import { useTheme } from '../../theme';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  shopName: string;
  shopAddress: string;
  barberName: string;
  services: string[];
  date: string;
  time: string;
  duration: number;
  totalPrice: number;
  status: BookingStatus;
  canReschedule: boolean;
  canCancel: boolean;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    shopName: 'Premium Cuts',
    shopAddress: '123 Main St, New York',
    barberName: 'Mike Johnson',
    services: ['Fade Haircut', 'Beard Trim'],
    date: '2024-12-18',
    time: '10:30 AM',
    duration: 65,
    totalPrice: 50,
    status: 'upcoming',
    canReschedule: true,
    canCancel: true,
  },
  {
    id: '2',
    shopName: 'Urban Fade Studio',
    shopAddress: '789 Style Blvd, New York',
    barberName: 'Alex Brown',
    services: ['Classic Haircut'],
    date: '2024-12-20',
    time: '2:00 PM',
    duration: 30,
    totalPrice: 25,
    status: 'upcoming',
    canReschedule: true,
    canCancel: true,
  },
  {
    id: '3',
    shopName: 'Premium Cuts',
    shopAddress: '123 Main St, New York',
    barberName: 'James Wilson',
    services: ['Fade Haircut', 'Hot Towel Shave'],
    date: '2024-12-10',
    time: '11:00 AM',
    duration: 75,
    totalPrice: 65,
    status: 'completed',
    canReschedule: false,
    canCancel: false,
  },
  {
    id: '4',
    shopName: 'Classic Barber Shop',
    shopAddress: '456 Oak Ave, New York',
    barberName: 'Mike Johnson',
    services: ['Beard Shaping'],
    date: '2024-12-05',
    time: '3:30 PM',
    duration: 30,
    totalPrice: 25,
    status: 'completed',
    canReschedule: false,
    canCancel: false,
  },
  {
    id: '5',
    shopName: 'Urban Fade Studio',
    shopAddress: '789 Style Blvd, New York',
    barberName: 'Alex Brown',
    services: ['Hair Coloring'],
    date: '2024-12-01',
    time: '10:00 AM',
    duration: 90,
    totalPrice: 75,
    status: 'cancelled',
    canReschedule: false,
    canCancel: false,
  },
];

type TabType = 'upcoming' | 'past';

export const BookingsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const tabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
  ];

  const filteredBookings = mockBookings.filter((booking) => {
    if (activeTab === 'upcoming') {
      return booking.status === 'upcoming';
    }
    return booking.status === 'completed' || booking.status === 'cancelled';
  });

  const handleBookingPress = (bookingId: string) => {
    router.push({
      pathname: '/booking/[id]',
      params: { id: bookingId },
    });
  };

  const handleReschedule = (bookingId: string) => {
    router.push({
      pathname: '/booking/[id]/reschedule',
      params: { id: bookingId },
    });
  };

  const handleCancel = (bookingId: string) => {
    // TODO: Show confirmation modal
    console.log('Cancel booking:', bookingId);
  };

  const handleRebook = (booking: Booking) => {
    router.push({
      pathname: '/shop/[id]/book',
      params: { id: '1' }, // TODO: Use actual shop ID
    });
  };

  const handleLeaveReview = (bookingId: string) => {
    router.push({
      pathname: '/booking/[id]/review',
      params: { id: bookingId },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={[styles.bookingCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleBookingPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.colors.primary[500]}
          />
          <Text style={[styles.dateText, { color: theme.colors.text.primary }]}>
            {formatDate(item.date)}
          </Text>
          <Text style={[styles.timeText, { color: theme.colors.text.secondary }]}>
            at {item.time}
          </Text>
        </View>
        <Badge
          label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          variant={getStatusBadgeVariant(item.status)}
          size="sm"
        />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.shopInfo}>
          <View style={styles.shopIconContainer}>
            <Ionicons
              name="storefront-outline"
              size={24}
              color={theme.colors.text.muted}
            />
          </View>
          <View style={styles.shopDetails}>
            <Text
              style={[styles.shopName, { color: theme.colors.text.primary }]}
              numberOfLines={1}
            >
              {item.shopName}
            </Text>
            <Text
              style={[styles.shopAddress, { color: theme.colors.text.secondary }]}
              numberOfLines={1}
            >
              {item.shopAddress}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.barberInfo}>
          <Avatar name={item.barberName} size={36} />
          <View style={styles.barberDetails}>
            <Text
              style={[styles.barberLabel, { color: theme.colors.text.muted }]}
            >
              Barber
            </Text>
            <Text
              style={[styles.barberName, { color: theme.colors.text.primary }]}
            >
              {item.barberName}
            </Text>
          </View>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={[styles.servicesLabel, { color: theme.colors.text.muted }]}>
            Services:
          </Text>
          <View style={styles.servicesList}>
            {item.services.map((service, index) => (
              <Text
                key={service}
                style={[styles.serviceText, { color: theme.colors.text.secondary }]}
              >
                {service}
                {index < item.services.length - 1 ? ', ' : ''}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <View style={styles.footerItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={theme.colors.text.muted}
              />
              <Text
                style={[styles.footerText, { color: theme.colors.text.secondary }]}
              >
                {item.duration} min
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Ionicons
                name="pricetag-outline"
                size={14}
                color={theme.colors.text.muted}
              />
              <Text
                style={[styles.footerPrice, { color: theme.colors.text.primary }]}
              >
                ${item.totalPrice}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {item.status === 'upcoming' && (
        <View style={styles.actionButtons}>
          {item.canReschedule && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.neutral[100] },
              ]}
              onPress={() => handleReschedule(item.id)}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={theme.colors.primary[500]}
              />
              <Text
                style={[styles.actionButtonText, { color: theme.colors.primary[500] }]}
              >
                Reschedule
              </Text>
            </TouchableOpacity>
          )}
          {item.canCancel && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.error[50] },
              ]}
              onPress={() => handleCancel(item.id)}
            >
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={theme.colors.error[500]}
              />
              <Text
                style={[styles.actionButtonText, { color: theme.colors.error[500] }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {item.status === 'completed' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary[50] },
            ]}
            onPress={() => handleRebook(item)}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color={theme.colors.primary[500]}
            />
            <Text
              style={[styles.actionButtonText, { color: theme.colors.primary[500] }]}
            >
              Book Again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.warning[50] },
            ]}
            onPress={() => handleLeaveReview(item.id)}
          >
            <Ionicons
              name="star-outline"
              size={16}
              color={theme.colors.warning[600]}
            />
            <Text
              style={[styles.actionButtonText, { color: theme.colors.warning[600] }]}
            >
              Leave Review
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
        size={64}
        color={theme.colors.text.muted}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        {activeTab === 'upcoming'
          ? 'No upcoming bookings'
          : 'No past bookings yet'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
        {activeTab === 'upcoming'
          ? 'Book an appointment to get started'
          : 'Your booking history will appear here'}
      </Text>
      {activeTab === 'upcoming' && (
        <Button
          onPress={() => router.push('/(tabs)/explore')}
          style={{ marginTop: 24 }}
        >
          Find a Shop
        </Button>
      )}
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
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          My Bookings
        </Text>
      </View>

      {/* Tabs */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        style={{ marginHorizontal: 16 }}
      />

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  bookingCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
  },
  cardBody: {
    padding: 16,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  shopIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  shopAddress: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barberDetails: {
    marginLeft: 10,
  },
  barberLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barberName: {
    fontSize: 14,
    fontWeight: '500',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  servicesLabel: {
    fontSize: 13,
    marginRight: 6,
  },
  servicesList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceText: {
    fontSize: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 13,
  },
  footerPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
  },
});

export default BookingsScreen;
