/**
 * Booking Success Screen
 * Displayed after successful booking confirmation
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BookingSuccessScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId: string;
    shopName: string;
    date: string;
    time: string;
  }>();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate success icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just booked an appointment at ${params.shopName}!\n\nDate: ${params.date}\nTime: ${params.time}\nBooking ID: ${params.bookingId}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleViewBooking = () => {
    router.replace({
      pathname: '/bookings',
    });
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Success Animation */}
      <View style={styles.successContainer}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.success[400], theme.colors.success[600]]}
            style={styles.iconGradient}
          >
            <Animated.View
              style={{
                opacity: checkmarkAnim,
                transform: [
                  {
                    scale: checkmarkAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              }}
            >
              <Ionicons name="checkmark" size={60} color="#FFFFFF" />
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Booking Confirmed!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Your appointment has been successfully booked
          </Text>
        </Animated.View>
      </View>

      {/* Booking Details Card */}
      <Animated.View
        style={[
          styles.detailsCard,
          {
            backgroundColor: theme.colors.surface,
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.detailsHeader}>
          <Text style={[styles.detailsTitle, { color: theme.colors.text.primary }]}>
            Booking Details
          </Text>
          <TouchableOpacity onPress={handleShare}>
            <Ionicons
              name="share-outline"
              size={22}
              color={theme.colors.primary[500]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.detailRow}>
          <View
            style={[styles.iconBadge, { backgroundColor: theme.colors.primary[50] }]}
          >
            <Ionicons
              name="receipt-outline"
              size={18}
              color={theme.colors.primary[500]}
            />
          </View>
          <View style={styles.detailInfo}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.muted }]}>
              Booking ID
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {params.bookingId || 'BK12345'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View
            style={[styles.iconBadge, { backgroundColor: theme.colors.primary[50] }]}
          >
            <Ionicons name="business-outline" size={18} color={theme.colors.primary[500]} />
          </View>
          <View style={styles.detailInfo}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.muted }]}>
              Shop
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {params.shopName || "Mike's Barber Shop"}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View
            style={[styles.iconBadge, { backgroundColor: theme.colors.primary[50] }]}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={theme.colors.primary[500]}
            />
          </View>
          <View style={styles.detailInfo}>
            <Text style={[styles.detailLabel, { color: theme.colors.text.muted }]}>
              Date & Time
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
              {params.date || 'Tomorrow'} at {params.time || '2:00 PM'}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBanner, { backgroundColor: theme.colors.success[50] }]}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.success[500]}
          />
          <Text style={[styles.statusText, { color: theme.colors.success[600] }]}>
            Confirmation sent to your email
          </Text>
        </View>
      </Animated.View>

      {/* Reminder Card */}
      <Animated.View
        style={[
          styles.reminderCard,
          {
            backgroundColor: theme.colors.primary[50],
            borderColor: theme.colors.primary[100],
            opacity: fadeAnim,
          },
        ]}
      >
        <Ionicons name="alarm-outline" size={24} color={theme.colors.primary[500]} />
        <View style={styles.reminderContent}>
          <Text style={[styles.reminderTitle, { color: theme.colors.primary[700] }]}>
            Don't forget!
          </Text>
          <Text style={[styles.reminderText, { color: theme.colors.primary[600] }]}>
            We'll send you a reminder 30 minutes before your appointment
          </Text>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View style={[styles.buttonsContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={handleViewBooking}
        >
          <Ionicons name="calendar" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.neutral[300],
            },
          ]}
          onPress={handleGoHome}
        >
          <Ionicons name="home" size={20} color={theme.colors.text.primary} />
          <Text style={[styles.secondaryButtonText, { color: theme.colors.text.primary }]}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  detailsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailInfo: {},
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 32,
    gap: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderText: {
    fontSize: 13,
    lineHeight: 18,
  },
  buttonsContainer: {
    marginTop: 'auto',
    gap: 12,
    paddingBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BookingSuccessScreen;
