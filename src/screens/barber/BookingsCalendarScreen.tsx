/**
 * Barber Bookings Calendar Screen
 * Manage appointments with calendar view
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, TabBar } from '../../components/ui';
import { useTheme } from '../../theme';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  services: string[];
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show';
  totalAmount: number;
  notes?: string;
}

interface DayData {
  date: number;
  day: string;
  isToday: boolean;
  hasBookings: boolean;
  bookingCount: number;
}

const mockWeekDays: DayData[] = [
  { date: 9, day: 'Mon', isToday: false, hasBookings: true, bookingCount: 3 },
  { date: 10, day: 'Tue', isToday: false, hasBookings: true, bookingCount: 5 },
  { date: 11, day: 'Wed', isToday: false, hasBookings: false, bookingCount: 0 },
  { date: 12, day: 'Thu', isToday: false, hasBookings: true, bookingCount: 4 },
  { date: 13, day: 'Fri', isToday: false, hasBookings: true, bookingCount: 6 },
  { date: 14, day: 'Sat', isToday: false, hasBookings: true, bookingCount: 8 },
  { date: 15, day: 'Sun', isToday: true, hasBookings: true, bookingCount: 5 },
];

const mockBookings: Booking[] = [
  {
    id: '1',
    customerName: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    services: ['Fade Haircut', 'Beard Trim'],
    time: '9:00 AM',
    duration: 45,
    status: 'completed',
    totalAmount: 50,
  },
  {
    id: '2',
    customerName: 'Mike Johnson',
    customerPhone: '+1 (555) 234-5678',
    services: ['Classic Haircut'],
    time: '10:00 AM',
    duration: 30,
    status: 'completed',
    totalAmount: 25,
  },
  {
    id: '3',
    customerName: 'Robert Wilson',
    customerPhone: '+1 (555) 345-6789',
    services: ['Hot Towel Shave'],
    time: '11:00 AM',
    duration: 30,
    status: 'confirmed',
    totalAmount: 30,
    notes: 'First time customer',
  },
  {
    id: '4',
    customerName: 'David Brown',
    customerPhone: '+1 (555) 456-7890',
    services: ['Fade Haircut', 'Hair Coloring'],
    time: '12:00 PM',
    duration: 90,
    status: 'pending',
    totalAmount: 100,
    notes: 'Requested specific color - Auburn',
  },
  {
    id: '5',
    customerName: 'James Miller',
    customerPhone: '+1 (555) 567-8901',
    services: ['Kids Haircut'],
    time: '2:00 PM',
    duration: 30,
    status: 'confirmed',
    totalAmount: 18,
  },
];

type ViewMode = 'day' | 'week' | 'month';

export const BookingsCalendarScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(15);
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const viewModes = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
  ];

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success[500];
      case 'pending':
        return theme.colors.warning[500];
      case 'completed':
        return theme.colors.neutral[400];
      case 'cancelled':
        return theme.colors.error[500];
      case 'no-show':
        return theme.colors.error[400];
      default:
        return theme.colors.neutral[400];
    }
  };

  const getStatusBadgeVariant = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'no-show':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={[styles.monthText, { color: theme.colors.text.primary }]}>
          December 2024
        </Text>
        <Text style={[styles.todayText, { color: theme.colors.text.secondary }]}>
          Sunday, Dec 15
        </Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.neutral[100] }]}
          onPress={() => router.push('/bookings/add')}
        >
          <Ionicons
            name="add-outline"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.neutral[100] }]}
          onPress={() => router.push('/bookings/settings')}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWeekStrip = () => (
    <View style={styles.weekStrip}>
      <View style={styles.weekNavigation}>
        <TouchableOpacity style={styles.weekNavButton}>
          <Ionicons
            name="chevron-back"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
        <Text style={[styles.weekLabel, { color: theme.colors.text.secondary }]}>
          Dec 9 - Dec 15
        </Text>
        <TouchableOpacity style={styles.weekNavButton}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {mockWeekDays.map((day) => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dayCard,
              {
                backgroundColor:
                  selectedDate === day.date
                    ? theme.colors.primary[500]
                    : theme.colors.surface,
                borderColor:
                  day.isToday && selectedDate !== day.date
                    ? theme.colors.primary[500]
                    : 'transparent',
                borderWidth: day.isToday && selectedDate !== day.date ? 2 : 0,
              },
            ]}
            onPress={() => setSelectedDate(day.date)}
          >
            <Text
              style={[
                styles.dayName,
                {
                  color:
                    selectedDate === day.date
                      ? '#FFFFFF'
                      : theme.colors.text.muted,
                },
              ]}
            >
              {day.day}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                {
                  color:
                    selectedDate === day.date
                      ? '#FFFFFF'
                      : theme.colors.text.primary,
                },
              ]}
            >
              {day.date}
            </Text>
            {day.hasBookings && (
              <View
                style={[
                  styles.dayDot,
                  {
                    backgroundColor:
                      selectedDate === day.date
                        ? '#FFFFFF'
                        : theme.colors.primary[500],
                  },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderDaySummary = () => {
    const confirmed = mockBookings.filter((b) => b.status === 'confirmed').length;
    const pending = mockBookings.filter((b) => b.status === 'pending').length;
    const completed = mockBookings.filter((b) => b.status === 'completed').length;

    return (
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.text.primary }]}>
            {mockBookings.length}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.text.muted }]}>
            Total
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.success[500] }]}>
            {confirmed}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.text.muted }]}>
            Confirmed
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.warning[500] }]}>
            {pending}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.text.muted }]}>
            Pending
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: theme.colors.neutral[400] }]}>
            {completed}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.text.muted }]}>
            Done
          </Text>
        </View>
      </View>
    );
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={[styles.bookingCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push(`/bookings/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.bookingTime}>
        <View
          style={[
            styles.timeIndicator,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
        <View>
          <Text style={[styles.timeText, { color: theme.colors.text.primary }]}>
            {item.time}
          </Text>
          <Text style={[styles.durationText, { color: theme.colors.text.muted }]}>
            {item.duration} min
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.bookingHeader}>
          <Text
            style={[styles.customerName, { color: theme.colors.text.primary }]}
          >
            {item.customerName}
          </Text>
          <Badge
            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            variant={getStatusBadgeVariant(item.status) as any}
            size="small"
          />
        </View>

        <Text
          style={[styles.servicesText, { color: theme.colors.text.secondary }]}
        >
          {item.services.join(' • ')}
        </Text>

        {item.notes && (
          <View
            style={[
              styles.noteBadge,
              { backgroundColor: theme.colors.warning[50] },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={theme.colors.warning[600]}
            />
            <Text
              style={[styles.noteText, { color: theme.colors.warning[700] }]}
            >
              {item.notes}
            </Text>
          </View>
        )}

        <View style={styles.bookingFooter}>
          <Text
            style={[styles.amountText, { color: theme.colors.text.primary }]}
          >
            ${item.totalAmount}
          </Text>
          <View style={styles.bookingActions}>
            {item.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.success[50] },
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={theme.colors.success[500]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.error[50] },
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={18}
                    color={theme.colors.error[500]}
                  />
                </TouchableOpacity>
              </>
            )}
            {item.status === 'confirmed' && (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.primary[50] },
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color={theme.colors.primary[500]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.neutral[100] },
                  ]}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
      {renderHeader()}

      {/* View Mode Selector */}
      <TabBar
        tabs={viewModes}
        activeTab={viewMode}
        onTabChange={(tab) => setViewMode(tab as ViewMode)}
        style={{ marginHorizontal: 16, marginBottom: 16 }}
      />

      {/* Week Strip */}
      {renderWeekStrip()}

      {/* Day Summary */}
      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        {renderDaySummary()}
      </View>

      {/* Bookings List */}
      <View style={styles.bookingsSection}>
        <Text
          style={[styles.bookingsTitle, { color: theme.colors.text.primary }]}
        >
          Appointments
        </Text>
        <FlatList
          data={mockBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bookingsList}
        />
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  monthText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  todayText: {
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekStrip: {
    paddingVertical: 8,
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 16,
  },
  weekNavButton: {
    padding: 4,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  daysContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayCard: {
    width: 50,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  bookingsSection: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  bookingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  bookingsList: {
    paddingBottom: 100,
  },
  bookingCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  bookingTime: {
    flexDirection: 'row',
    padding: 16,
    paddingRight: 12,
    alignItems: 'flex-start',
  },
  timeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 12,
    marginTop: 2,
  },
  bookingDetails: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  servicesText: {
    fontSize: 13,
    marginBottom: 8,
  },
  noteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 11,
    fontWeight: '500',
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BookingsCalendarScreen;
