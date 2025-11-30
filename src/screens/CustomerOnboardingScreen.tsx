import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { UI_CONFIG } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../hooks/useLocation';

interface CustomerOnboardingScreenProps {
  onCompleted: () => void;
}

export function CustomerOnboardingScreen({ onCompleted }: CustomerOnboardingScreenProps) {
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const { requestPermission, getCurrentLocation, location, loading: locationLoading } = useLocation();

  const handleRequestLocation = async () => {
    try {
      setLoading(true);
      const hasPermission = await requestPermission();
      
      if (hasPermission) {
        await getCurrentLocation();
        Alert.alert(
          'Location Enabled', 
          'Great! We can now show you nearby barbershops.',
          [{ text: 'Continue', onPress: onCompleted }]
        );
      } else {
        Alert.alert(
          'Location Permission', 
          'You can still use the app, but you\'ll need to search for barbershops manually.',
          [{ text: 'Continue', onPress: onCompleted }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to setup location services');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Location Setup?',
      'You can enable location services later in settings to find nearby barbershops.',
      [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Skip', onPress: onCompleted },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>

        <Text style={styles.title}>Enable Location</Text>
        <Text style={styles.subtitle}>
          Help us find barbershops near you for the best experience
        </Text>

        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🎯</Text>
            <Text style={styles.benefitText}>Find nearby barbershops</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>📏</Text>
            <Text style={styles.benefitText}>See accurate distances</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>Faster search results</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.enableButton}
          onPress={handleRequestLocation}
          disabled={loading || locationLoading}
        >
          {loading || locationLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.enableButtonText}>Enable Location</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading || locationLoading}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        {location && (
          <Text style={styles.statusText}>
            ✅ Location enabled successfully
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.colors.background,
    paddingHorizontal: UI_CONFIG.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: UI_CONFIG.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.xl,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: UI_CONFIG.fontSize.xxl,
    fontWeight: 'bold',
    color: UI_CONFIG.colors.text,
    textAlign: 'center',
    marginBottom: UI_CONFIG.spacing.sm,
  },
  subtitle: {
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: UI_CONFIG.spacing.xl,
  },
  benefits: {
    alignSelf: 'stretch',
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: UI_CONFIG.spacing.md,
    paddingHorizontal: UI_CONFIG.spacing.lg,
    backgroundColor: UI_CONFIG.colors.surface,
    borderRadius: UI_CONFIG.borderRadius.lg,
    marginBottom: UI_CONFIG.spacing.md,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: UI_CONFIG.spacing.md,
  },
  benefitText: {
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.text,
    flex: 1,
  },
  actions: {
    paddingBottom: UI_CONFIG.spacing.xxl,
  },
  enableButton: {
    backgroundColor: UI_CONFIG.colors.primary,
    borderRadius: UI_CONFIG.borderRadius.lg,
    paddingVertical: UI_CONFIG.spacing.lg,
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.md,
  },
  enableButtonText: {
    color: 'white',
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: UI_CONFIG.spacing.md,
  },
  skipButtonText: {
    color: UI_CONFIG.colors.textSecondary,
    fontSize: UI_CONFIG.fontSize.md,
  },
  statusText: {
    textAlign: 'center',
    color: UI_CONFIG.colors.success,
    fontSize: UI_CONFIG.fontSize.sm,
    marginTop: UI_CONFIG.spacing.sm,
  },
});