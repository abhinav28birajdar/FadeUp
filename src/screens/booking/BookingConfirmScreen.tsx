/**
 * Booking Confirmation Screen
 * Step 4 of booking flow - review and confirm booking
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
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

// Mock data for display
const mockShop = {
  name: "Mike's Barber Shop",
  address: '123 Main Street, Downtown',
  image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200',
};

const mockBarber = {
  name: 'Mike Anderson',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
};

const mockServices = [
  { name: 'Fade Haircut', price: 35, duration: 45 },
  { name: 'Beard Trim', price: 15, duration: 20 },
];

export const BookingConfirmScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    shopId: string;
    services: string;
    barberId: string;
    date: string;
    time: string;
  }>();

  const [notes, setNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'cash' | 'app'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = mockServices.reduce((acc, s) => acc + s.price, 0);
  const totalDuration = mockServices.reduce((acc, s) => acc + s.duration, 0);

  const formattedDate = params.date
    ? new Date(params.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : 'Today';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    
    // Navigate to success screen
    router.replace({
      pathname: '/booking/success',
      params: {
        bookingId: 'BK' + Date.now(),
        shopName: mockShop.name,
        date: formattedDate,
        time: params.time,
      },
    });
  };

  const paymentMethods = [
    { key: 'card', label: 'Credit Card', icon: 'card-outline' },
    { key: 'cash', label: 'Pay at Shop', icon: 'cash-outline' },
    { key: 'app', label: 'Apple Pay', icon: 'logo-apple' },
  ];

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
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Confirm Booking
          </Text>
          <Text style={[styles.stepText, { color: theme.colors.text.muted }]}>
            Step 4 of 4
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[styles.progressBar, { backgroundColor: theme.colors.neutral[200] }]}
        >
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.colors.primary[500], width: '100%' },
            ]}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Shop Info */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Image source={{ uri: mockShop.image }} style={styles.shopImage} />
          <View style={styles.shopInfo}>
            <Text style={[styles.shopName, { color: theme.colors.text.primary }]}>
              {mockShop.name}
            </Text>
            <View style={styles.shopAddressRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={theme.colors.text.muted}
              />
              <Text style={[styles.shopAddress, { color: theme.colors.text.secondary }]}>
                {mockShop.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              Date & Time
            </Text>
          </View>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Text style={[styles.dateTimeLabel, { color: theme.colors.text.muted }]}>
                Date
              </Text>
              <Text style={[styles.dateTimeValue, { color: theme.colors.text.primary }]}>
                {formattedDate}
              </Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={[styles.dateTimeLabel, { color: theme.colors.text.muted }]}>
                Time
              </Text>
              <Text style={[styles.dateTimeValue, { color: theme.colors.text.primary }]}>
                {params.time || '2:00 PM'}
              </Text>
            </View>
          </View>
        </View>

        {/* Barber */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              Barber
            </Text>
          </View>
          <View style={styles.barberRow}>
            <Image source={{ uri: mockBarber.avatar }} style={styles.barberAvatar} />
            <Text style={[styles.barberName, { color: theme.colors.text.primary }]}>
              {params.barberId === 'any' ? 'First Available' : mockBarber.name}
            </Text>
          </View>
        </View>

        {/* Services */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="cut" size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              Services
            </Text>
          </View>
          {mockServices.map((service, index) => (
            <View key={index} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
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
            <View style={styles.totalInfo}>
              <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>
                Total
              </Text>
              <Text style={[styles.totalDuration, { color: theme.colors.text.muted }]}>
                {totalDuration} min
              </Text>
            </View>
            <Text style={[styles.totalPrice, { color: theme.colors.primary[500] }]}>
              ${totalPrice}
            </Text>
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              Notes (Optional)
            </Text>
          </View>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text.primary,
                borderColor: theme.colors.neutral[200],
              },
            ]}
            placeholder="Any special requests or notes..."
            placeholderTextColor={theme.colors.text.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Payment Method */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              Payment Method
            </Text>
          </View>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={styles.paymentOption}
              onPress={() => setSelectedPayment(method.key as any)}
            >
              <View style={styles.paymentLeft}>
                <View
                  style={[
                    styles.paymentIcon,
                    { backgroundColor: theme.colors.neutral[100] },
                  ]}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={20}
                    color={theme.colors.text.secondary}
                  />
                </View>
                <Text
                  style={[styles.paymentLabel, { color: theme.colors.text.primary }]}
                >
                  {method.label}
                </Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  {
                    borderColor:
                      selectedPayment === method.key
                        ? theme.colors.primary[500]
                        : theme.colors.neutral[300],
                  },
                ]}
              >
                {selectedPayment === method.key && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: theme.colors.primary[500] },
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={styles.bottomSummary}>
          <Text style={[styles.bottomTotal, { color: theme.colors.text.primary }]}>
            Total: ${totalPrice}
          </Text>
          <Text style={[styles.bottomServices, { color: theme.colors.text.muted }]}>
            {mockServices.length} services • {totalDuration} min
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            {
              backgroundColor: isSubmitting
                ? theme.colors.neutral[300]
                : theme.colors.primary[500],
            },
          ]}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.confirmText}>Booking...</Text>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.confirmText}>Confirm Booking</Text>
            </>
          )}
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
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
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
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
  },
  shopAddress: {
    fontSize: 13,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 24,
  },
  dateTimeItem: {},
  dateTimeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  barberName: {
    fontSize: 15,
    fontWeight: '500',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serviceInfo: {},
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
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
  },
  totalInfo: {},
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
  paymentLabel: {
    fontSize: 15,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSummary: {},
  bottomTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomServices: {
    fontSize: 12,
    marginTop: 2,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingConfirmScreen;
