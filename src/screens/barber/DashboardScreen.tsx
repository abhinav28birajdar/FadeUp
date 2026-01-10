/**
 * Barber Dashboard Screen
 * Main dashboard for barbers showing today's overview, queue, earnings
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge, Button } from '../../components/ui';
import { useTheme } from '../../theme';

interface TodayStats {
  completed: number;
  upcoming: number;
  inQueue: number;
  earnings: number;
}

interface QueueCustomer {
  id: string;
  name: string;
  services: string[];
  waitTime: number;
  position: number;
  avatar?: string;
}

interface UpcomingAppointment {
  id: string;
  customerName: string;
  services: string[];
  time: string;
  duration: number;
}

const mockStats: TodayStats = {
  completed: 8,
  upcoming: 4,
  inQueue: 3,
  earnings: 285,
};

const mockQueueCustomers: QueueCustomer[] = [
  {
    id: '1',
    name: 'John Smith',
    services: ['Fade Haircut', 'Beard Trim'],
    waitTime: 5,
    position: 1,
  },
  {
    id: '2',
    name: 'Mike Johnson',
    services: ['Classic Haircut'],
    waitTime: 25,
    position: 2,
  },
  {
    id: '3',
    name: 'Robert Wilson',
    services: ['Hot Towel Shave'],
    waitTime: 40,
    position: 3,
  },
];

const mockUpcomingAppointments: UpcomingAppointment[] = [
  {
    id: '1',
    customerName: 'Sarah Davis',
    services: ['Hair Coloring'],
    time: '2:00 PM',
    duration: 90,
  },
  {
    id: '2',
    customerName: 'James Brown',
    services: ['Fade Haircut', 'Beard Shaping'],
    time: '4:30 PM',
    duration: 60,
  },
];

export const BarberDashboardScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // TODO: Update availability in backend
  };

  const handleViewQueue = () => {
    router.push('/(tabs)/queue');
  };

  const handleViewEarnings = () => {
    router.push('/(tabs)/earnings');
  };

  const handleStartService = (customerId: string) => {
    // TODO: Implement start service
    console.log('Start service for:', customerId);
  };

  const handleCallNext = () => {
    // TODO: Call next in queue
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.greeting}>
          <Text style={[styles.greetingText, { color: theme.colors.text.secondary }]}>
            {getGreeting()} 👋
          </Text>
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            Mike Johnson
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.colors.neutral[100] }]}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.colors.text.primary}
            />
            <View
              style={[styles.notificationBadge, { backgroundColor: theme.colors.error[500] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Avatar
              name="Mike Johnson"
              size={40}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Availability Toggle */}
      <TouchableOpacity
        style={[
          styles.availabilityToggle,
          {
            backgroundColor: isAvailable
              ? theme.colors.success[50]
              : theme.colors.neutral[100],
            borderColor: isAvailable
              ? theme.colors.success[200]
              : theme.colors.border,
          },
        ]}
        onPress={toggleAvailability}
      >
        <View
          style={[
            styles.availabilityDot,
            {
              backgroundColor: isAvailable
                ? theme.colors.success[500]
                : theme.colors.text.muted,
            },
          ]}
        />
        <Text
          style={[
            styles.availabilityText,
            {
              color: isAvailable
                ? theme.colors.success[700]
                : theme.colors.text.secondary,
            },
          ]}
        >
          {isAvailable ? 'Available for customers' : 'Currently unavailable'}
        </Text>
        <Ionicons
          name={isAvailable ? 'toggle' : 'toggle-outline'}
          size={32}
          color={isAvailable ? theme.colors.success[500] : theme.colors.text.muted}
        />
      </TouchableOpacity>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <LinearGradient
        colors={[theme.colors.primary[500], theme.colors.primary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mainStatCard}
      >
        <View style={styles.mainStatContent}>
          <View>
            <Text style={styles.mainStatLabel}>Today's Earnings</Text>
            <Text style={styles.mainStatValue}>${mockStats.earnings}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={handleViewEarnings}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: theme.colors.success[50] },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={theme.colors.success[500]}
            />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {mockStats.completed}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
            Completed
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View
            style={[styles.statIcon, { backgroundColor: theme.colors.info[50] }]}
          >
            <Ionicons
              name="calendar-outline"
              size={24}
              color={theme.colors.info[500]}
            />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {mockStats.upcoming}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
            Upcoming
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <View
            style={[
              styles.statIcon,
              { backgroundColor: theme.colors.warning[50] },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={24}
              color={theme.colors.warning[500]}
            />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {mockStats.inQueue}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
            In Queue
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentQueue = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Current Queue
        </Text>
        <TouchableOpacity onPress={handleViewQueue}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary[500] }]}>
            Manage
          </Text>
        </TouchableOpacity>
      </View>

      {mockQueueCustomers.length > 0 && (
        <TouchableOpacity
          style={[styles.callNextButton, { backgroundColor: theme.colors.primary[500] }]}
          onPress={handleCallNext}
        >
          <Ionicons name="hand-right-outline" size={20} color="#FFFFFF" />
          <Text style={styles.callNextText}>Call Next Customer</Text>
        </TouchableOpacity>
      )}

      {mockQueueCustomers.map((customer, index) => (
        <View
          key={customer.id}
          style={[
            styles.queueCard,
            {
              backgroundColor: theme.colors.surface,
              borderLeftColor:
                index === 0
                  ? theme.colors.success[500]
                  : theme.colors.border,
            },
          ]}
        >
          <View style={styles.queueCardContent}>
            <View style={styles.queuePosition}>
              <Text
                style={[
                  styles.positionNumber,
                  { color: index === 0 ? theme.colors.success[500] : theme.colors.text.muted },
                ]}
              >
                #{customer.position}
              </Text>
            </View>
            <Avatar name={customer.name} size={44} />
            <View style={styles.queueInfo}>
              <Text
                style={[styles.customerName, { color: theme.colors.text.primary }]}
              >
                {customer.name}
              </Text>
              <Text
                style={[styles.servicesText, { color: theme.colors.text.secondary }]}
              >
                {customer.services.join(', ')}
              </Text>
              <View style={styles.waitInfo}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={theme.colors.text.muted}
                />
                <Text
                  style={[styles.waitText, { color: theme.colors.text.muted }]}
                >
                  Waiting {customer.waitTime} min
                </Text>
              </View>
            </View>
            {index === 0 && (
              <Button
                size="sm"
                onPress={() => handleStartService(customer.id)}
              >
                Start
              </Button>
            )}
          </View>
        </View>
      ))}

      {mockQueueCustomers.length === 0 && (
        <View
          style={[styles.emptyQueue, { backgroundColor: theme.colors.surface }]}
        >
          <Ionicons
            name="people-outline"
            size={48}
            color={theme.colors.text.muted}
          />
          <Text
            style={[styles.emptyQueueText, { color: theme.colors.text.secondary }]}
          >
            No customers in queue
          </Text>
        </View>
      )}
    </View>
  );

  const renderUpcomingAppointments = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Upcoming Appointments
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')}>
          <Text style={[styles.seeAllText, { color: theme.colors.primary[500] }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {mockUpcomingAppointments.map((appointment) => (
        <TouchableOpacity
          key={appointment.id}
          style={[styles.appointmentCard, { backgroundColor: theme.colors.surface }]}
          activeOpacity={0.8}
        >
          <View style={styles.appointmentTime}>
            <Text
              style={[styles.timeText, { color: theme.colors.primary[500] }]}
            >
              {appointment.time}
            </Text>
            <Text
              style={[styles.durationText, { color: theme.colors.text.muted }]}
            >
              {appointment.duration} min
            </Text>
          </View>
          <View style={styles.appointmentInfo}>
            <Text
              style={[
                styles.appointmentCustomer,
                { color: theme.colors.text.primary },
              ]}
            >
              {appointment.customerName}
            </Text>
            <Text
              style={[
                styles.appointmentServices,
                { color: theme.colors.text.secondary },
              ]}
            >
              {appointment.services.join(', ')}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.muted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Quick Actions
      </Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.primary[50] },
          ]}
          onPress={() => router.push('/add-to-queue')}
        >
          <Ionicons
            name="person-add-outline"
            size={28}
            color={theme.colors.primary[500]}
          />
          <Text
            style={[styles.quickActionText, { color: theme.colors.primary[700] }]}
          >
            Add to Queue
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.success[50] },
          ]}
          onPress={() => router.push('/create-booking')}
        >
          <Ionicons
            name="calendar-outline"
            size={28}
            color={theme.colors.success[500]}
          />
          <Text
            style={[styles.quickActionText, { color: theme.colors.success[700] }]}
          >
            New Booking
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.info[50] },
          ]}
          onPress={() => router.push('/shop/services')}
        >
          <Ionicons
            name="pricetag-outline"
            size={28}
            color={theme.colors.info[500]}
          />
          <Text
            style={[styles.quickActionText, { color: theme.colors.info[700] }]}
          >
            Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickActionCard,
            { backgroundColor: theme.colors.warning[50] },
          ]}
          onPress={() => router.push('/shop/settings')}
        >
          <Ionicons
            name="settings-outline"
            size={28}
            color={theme.colors.warning[500]}
          />
          <Text
            style={[styles.quickActionText, { color: theme.colors.warning[700] }]}
          >
            Shop Settings
          </Text>
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
          />
        }
      >
        {renderHeader()}
        {renderStatsCards()}
        {renderCurrentQueue()}
        {renderUpcomingAppointments()}
        {renderQuickActions()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  availabilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  availabilityText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  mainStatCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  mainStatContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainStatLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  mainStatValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  callNextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  callNextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  queueCard: {
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  queueCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  queuePosition: {
    width: 32,
    alignItems: 'center',
  },
  positionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  queueInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  servicesText: {
    fontSize: 13,
    marginBottom: 4,
  },
  waitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waitText: {
    fontSize: 12,
  },
  emptyQueue: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    gap: 8,
  },
  emptyQueueText: {
    fontSize: 14,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentTime: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  durationText: {
    fontSize: 12,
    marginTop: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentCustomer: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  appointmentServices: {
    fontSize: 13,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  quickActionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BarberDashboardScreen;
