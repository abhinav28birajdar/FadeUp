/**
 * Booking Detail Screen
 * View complete details of a booking
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

// Mock booking data
const mockBooking = {
  id: 'BK123456',
  status: 'confirmed' as const,
  shop: {
    id: '1',
    name: "Mike's Barber Shop",
    address: '123 Main Street, Downtown',
    phone: '+1 234 567 8900',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
  },
  barber: {
    name: 'Mike Anderson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  },
  services: [
    { name: 'Fade Haircut', price: 35, duration: 45 },
    { name: 'Beard Trim', price: 15, duration: 20 },
  ],
  date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  time: '2:00 PM',
  totalPrice: 50,
  totalDuration: 65,
  notes: 'Prefer a skin fade',
  paymentMethod: 'Credit Card',
  createdAt: new Date(),
};

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

const statusConfig: Record<BookingStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: '#F59E0B', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', color: '#10B981', icon: 'checkmark-circle-outline' },
  in_progress: { label: 'In Progress', color: '#3B82F6', icon: 'cut-outline' },
  completed: { label: 'Completed', color: '#6B7280', icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', color: '#EF4444', icon: 'close-circle-outline' },
};

export const BookingDetailScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();

  const [booking] = useState(mockBooking);
  const statusInfo = statusConfig[booking.status];

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canReschedule = booking.status === 'confirmed';

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            // Cancel booking logic
            Alert.alert('Booking Cancelled', 'Your booking has been cancelled.');
            router.back();
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    router.push({
      pathname: '/booking/datetime',
      params: {
        shopId: booking.shop.id,
        rescheduleId: booking.id,
      },
    });
  };

  const handleGetDirections = () => {
    // Open maps with directions
    Alert.alert('Opening Maps', 'This would open the maps app with directions.');
  };

  const handleCallShop = () => {
    // Open phone dialer
    Alert.alert('Calling', `Calling ${booking.shop.phone}`);
  };

  const handleAddToCalendar = () => {
    Alert.alert('Success', 'Booking added to your calendar.');
  };

  const formattedDate = booking.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Booking Details
        </Text>
        <TouchableOpacity onPress={handleAddToCalendar}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color={theme.colors.primary[500]}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: statusInfo.color + '15' },
          ]}
        >
          <Ionicons name={statusInfo.icon as any} size={24} color={statusInfo.color} />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
            <Text style={[styles.bookingId, { color: theme.colors.text.muted }]}>
              Booking #{booking.id}
            </Text>
          </View>
        </View>

        {/* Shop Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Image source={{ uri: booking.shop.image }} style={styles.shopImage} />
          <View style={styles.shopInfo}>
            <Text style={[styles.shopName, { color: theme.colors.text.primary }]}>
              {booking.shop.name}
            </Text>
            <View style={styles.shopAddressRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.colors.text.muted}
              />
              <Text style={[styles.shopAddress, { color: theme.colors.text.secondary }]}>
                {booking.shop.address}
              </Text>
            </View>
            <View style={styles.shopActions}>
              <TouchableOpacity
                style={[styles.shopActionBtn, { backgroundColor: theme.colors.primary[50] }]}
                onPress={handleGetDirections}
              >
                <Ionicons
                  name="navigate-outline"
                  size={16}
                  color={theme.colors.primary[500]}
                />
                <Text style={[styles.shopActionText, { color: theme.colors.primary[500] }]}>
                  Directions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shopActionBtn, { backgroundColor: theme.colors.neutral[100] }]}
                onPress={handleCallShop}
              >
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={theme.colors.text.secondary}
                />
                <Text style={[styles.shopActionText, { color: theme.colors.text.secondary }]}>
                  Call
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Appointment Details */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Appointment
          </Text>

          <View style={styles.appointmentRow}>
            <View
              style={[styles.iconBadge, { backgroundColor: theme.colors.primary[50] }]}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={theme.colors.primary[500]}
              />
            </View>
            <View>
              <Text style={[styles.appointmentLabel, { color: theme.colors.text.muted }]}>
                Date
              </Text>
              <Text style={[styles.appointmentValue, { color: theme.colors.text.primary }]}>
                {formattedDate}
              </Text>
            </View>
          </View>

          <View style={styles.appointmentRow}>
            <View
              style={[styles.iconBadge, { backgroundColor: theme.colors.primary[50] }]}
            >
              <Ionicons name="time" size={18} color={theme.colors.primary[500]} />
            </View>
            <View>
              <Text style={[styles.appointmentLabel, { color: theme.colors.text.muted }]}>
                Time
              </Text>
              <Text style={[styles.appointmentValue, { color: theme.colors.text.primary }]}>
                {booking.time} ({booking.totalDuration} min)
              </Text>
            </View>
          </View>

          <View style={styles.appointmentRow}>
            <View
              style={[styles.iconBadge, { backgroundColor: theme.colors.primary[50] }]}
            >
              <Ionicons name="person" size={18} color={theme.colors.primary[500]} />
            </View>
            <View style={styles.barberInfo}>
              <Text style={[styles.appointmentLabel, { color: theme.colors.text.muted }]}>
                Barber
              </Text>
              <View style={styles.barberRow}>
                <Image
                  source={{ uri: booking.barber.avatar }}
                  style={styles.barberAvatar}
                />
                <Text style={[styles.appointmentValue, { color: theme.colors.text.primary }]}>
                  {booking.barber.name}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Services */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Services
          </Text>
          {booking.services.map((service, index) => (
            <View key={index} style={styles.serviceRow}>
              <View>
                <Text style={[styles.serviceName, { color: theme.colors.text.primary }]}>
                  {service.name}
                </Text>
                <Text style={[styles.serviceDuration, { color: theme.colors.text.muted }]}>
                  {service.duration} min
                </Text>
              </View>
              <Text style={[styles.servicePrice, { color: theme.colors.text.primary }]}>
                ${service.price}
              </Text>
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: theme.colors.neutral[200] }]}>
            <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>
              Total
            </Text>
            <Text style={[styles.totalPrice, { color: theme.colors.primary[500] }]}>
              ${booking.totalPrice}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {booking.notes && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Notes
            </Text>
            <Text style={[styles.notesText, { color: theme.colors.text.secondary }]}>
              {booking.notes}
            </Text>
          </View>
        )}

        {/* Payment */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Payment
          </Text>
          <View style={styles.paymentRow}>
            <View style={styles.paymentLeft}>
              <View
                style={[styles.paymentIcon, { backgroundColor: theme.colors.neutral[100] }]}
              >
                <Ionicons name="card-outline" size={18} color={theme.colors.text.secondary} />
              </View>
              <Text style={[styles.paymentMethod, { color: theme.colors.text.primary }]}>
                {booking.paymentMethod}
              </Text>
            </View>
            <Text style={[styles.paymentAmount, { color: theme.colors.text.primary }]}>
              ${booking.totalPrice}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {(canCancel || canReschedule) && (
          <View style={styles.actionsContainer}>
            {canReschedule && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.primary[500],
                    flex: canCancel ? 1 : undefined,
                  },
                ]}
                onPress={handleReschedule}
              >
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Reschedule</Text>
              </TouchableOpacity>
            )}
            {canCancel && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: theme.colors.error[50],
                    flex: canReschedule ? 1 : undefined,
                  },
                ]}
                onPress={handleCancel}
              >
                <Ionicons name="close-circle-outline" size={20} color={theme.colors.error[500]} />
                <Text style={[styles.actionButtonText, { color: theme.colors.error[500] }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  statusInfo: {},
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shopImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 14,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  shopAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  shopAddress: {
    fontSize: 13,
    flex: 1,
  },
  shopActions: {
    flexDirection: 'row',
    gap: 8,
  },
  shopActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  shopActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  appointmentValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  barberInfo: {
    flex: 1,
  },
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  serviceName: {
    fontSize: 15,
  },
  serviceDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    marginTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethod: {
    fontSize: 15,
    fontWeight: '500',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default BookingDetailScreen;
