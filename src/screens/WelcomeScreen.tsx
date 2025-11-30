import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { UI_CONFIG } from '../config/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Brand Section */}
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>✂️</Text>
          </View>
          <Text style={styles.appName}>FadeUp</Text>
          <Text style={styles.tagline}>Skip the wait, book your cut</Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureTitle}>Find Nearby Barbers</Text>
            <Text style={styles.featureDescription}>
              Discover barbershops in your area and see real-time availability
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⏱️</Text>
            <Text style={styles.featureTitle}>Real-Time Queue</Text>
            <Text style={styles.featureDescription}>
              Join the queue remotely and get live updates on your position
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💺</Text>
            <Text style={styles.featureTitle}>Book Your Slot</Text>
            <Text style={styles.featureDescription}>
              Schedule appointments or join the queue with just a few taps
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: UI_CONFIG.spacing.lg,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: UI_CONFIG.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.lg,
  },
  logo: {
    fontSize: 60,
  },
  appName: {
    fontSize: UI_CONFIG.fontSize.xxxl + 8,
    fontWeight: 'bold',
    color: UI_CONFIG.colors.text,
    marginBottom: UI_CONFIG.spacing.sm,
  },
  tagline: {
    fontSize: UI_CONFIG.fontSize.lg,
    color: UI_CONFIG.colors.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    gap: UI_CONFIG.spacing.xl,
  },
  feature: {
    alignItems: 'center',
    paddingHorizontal: UI_CONFIG.spacing.md,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: UI_CONFIG.spacing.md,
  },
  featureTitle: {
    fontSize: UI_CONFIG.fontSize.lg,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
    marginBottom: UI_CONFIG.spacing.sm,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: UI_CONFIG.spacing.lg,
    paddingBottom: UI_CONFIG.spacing.xxl,
  },
  getStartedButton: {
    backgroundColor: UI_CONFIG.colors.primary,
    borderRadius: UI_CONFIG.borderRadius.xl,
    paddingVertical: UI_CONFIG.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  getStartedButtonText: {
    color: 'white',
    fontSize: UI_CONFIG.fontSize.lg,
    fontWeight: '600',
  },
});