import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { UI_CONFIG, VALIDATION_CONFIG } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { shopService } from '../services/firestore';
import { OpeningHours, ShopFormData } from '../types';

const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
  saturday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
  sunday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
};

interface BarberOnboardingScreenProps {
  onCompleted: () => void;
}

export function BarberOnboardingScreen({ onCompleted }: BarberOnboardingScreenProps) {
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [maxSlots, setMaxSlots] = useState('3');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const validateForm = (): boolean => {
    if (!shopName.trim()) {
      Alert.alert('Error', 'Please enter your shop name');
      return false;
    }

    if (shopName.length > VALIDATION_CONFIG.maxShopNameLength) {
      Alert.alert('Error', `Shop name must be less than ${VALIDATION_CONFIG.maxShopNameLength} characters`);
      return false;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your shop address');
      return false;
    }

    if (phone && !VALIDATION_CONFIG.phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    const slotsNumber = parseInt(maxSlots);
    if (isNaN(slotsNumber) || slotsNumber < 1 || slotsNumber > 10) {
      Alert.alert('Error', 'Maximum slots must be between 1 and 10');
      return false;
    }

    return true;
  };

  const handleCreateShop = async () => {
    if (!validateForm() || !user) return;

    try {
      setLoading(true);

      const formData: ShopFormData = {
        name: shopName.trim(),
        description: description.trim() || undefined,
        address: address.trim(),
        phone: phone.trim() || undefined,
        openingHours: DEFAULT_OPENING_HOURS,
        maxSimultaneousSlots: parseInt(maxSlots),
      };

      // For now, using default coordinates - in production, you'd geocode the address
      const shopData = {
        ...formData,
        barberId: user.id,
        latitude: 37.7749, // Default to San Francisco
        longitude: -122.4194,
        imageUrls: [],
        rating: 5.0,
        totalRatings: 0,
        isOpen: true,
      };

      await shopService.create(shopData);
      onCompleted();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create shop. Please try again.');
      console.error('Create shop error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Set Up Your Barbershop</Text>
          <Text style={styles.subtitle}>
            Let's create your shop profile so customers can find and book with you
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Shop Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., The Classic Cut"
                value={shopName}
                onChangeText={setShopName}
                maxLength={VALIDATION_CONFIG.maxShopNameLength}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your shop and services..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={VALIDATION_CONFIG.maxDescriptionLength}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main St, City, State"
                value={address}
                onChangeText={setAddress}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 123-4567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Maximum Simultaneous Customers *</Text>
              <TextInput
                style={styles.input}
                placeholder="3"
                value={maxSlots}
                onChangeText={setMaxSlots}
                keyboardType="number-pad"
                editable={!loading}
              />
              <Text style={styles.helpText}>
                How many customers can you serve at the same time?
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateShop}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Create Shop</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            You can update these details anytime from your shop settings
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: UI_CONFIG.spacing.lg,
    paddingVertical: UI_CONFIG.spacing.xl,
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
    marginBottom: UI_CONFIG.spacing.xxl,
    lineHeight: 20,
  },
  form: {
    marginBottom: UI_CONFIG.spacing.xl,
  },
  inputGroup: {
    marginBottom: UI_CONFIG.spacing.lg,
  },
  label: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
    marginBottom: UI_CONFIG.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
    borderRadius: UI_CONFIG.borderRadius.lg,
    paddingHorizontal: UI_CONFIG.spacing.md,
    paddingVertical: UI_CONFIG.spacing.md,
    fontSize: UI_CONFIG.fontSize.md,
    backgroundColor: UI_CONFIG.colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
    marginTop: UI_CONFIG.spacing.xs,
  },
  button: {
    backgroundColor: UI_CONFIG.colors.primary,
    borderRadius: UI_CONFIG.borderRadius.lg,
    paddingVertical: UI_CONFIG.spacing.lg,
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
  },
  note: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
    textAlign: 'center',
  },
});