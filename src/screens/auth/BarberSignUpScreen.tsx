/**
 * Barber Sign Up Screen (Multi-Step)
 * Registration form for barber/shop owner accounts
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme';

const TOTAL_STEPS = 4;

interface BarberSignUpFormData {
  // Step 1: Personal Info
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  // Step 2: Shop Info
  shopName: string;
  shopDescription: string;
  shopCategory: string;
  businessRegistration: string;
  // Step 3: Location
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  // Step 4: Operating Hours
  operatingDays: number[];
  openingTime: string;
  closingTime: string;
}

const SHOP_CATEGORIES = [
  'Barber Shop',
  'Hair Salon',
  'Unisex Salon',
  'Beauty Parlor',
  'Spa & Salon',
  'Mobile Barber',
];

const DAYS_OF_WEEK = [
  { key: 0, label: 'Sun' },
  { key: 1, label: 'Mon' },
  { key: 2, label: 'Tue' },
  { key: 3, label: 'Wed' },
  { key: 4, label: 'Thu' },
  { key: 5, label: 'Fri' },
  { key: 6, label: 'Sat' },
];

export const BarberSignUpScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const [formData, setFormData] = useState<BarberSignUpFormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    shopDescription: '',
    shopCategory: '',
    businessRegistration: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    operatingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat by default
    openingTime: '09:00',
    closingTime: '19:00',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BarberSignUpFormData, string>>>({});

  const updateField = (field: keyof BarberSignUpFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const toggleDay = (day: number) => {
    const days = formData.operatingDays.includes(day)
      ? formData.operatingDays.filter((d) => d !== day)
      : [...formData.operatingDays, day].sort();
    updateField('operatingDays', days);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof BarberSignUpFormData, string>> = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email';
        }
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;
      case 2:
        if (!formData.shopName.trim()) newErrors.shopName = 'Shop name is required';
        if (!formData.shopCategory) newErrors.shopCategory = 'Please select a category';
        break;
      case 3:
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        break;
      case 4:
        if (formData.operatingDays.length === 0) {
          Alert.alert('Error', 'Please select at least one operating day');
          return false;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: 'barber',
        shopData: {
          name: formData.shopName,
          description: formData.shopDescription,
          category: formData.shopCategory,
          businessRegistration: formData.businessRegistration,
          address: {
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country || 'US',
          },
          operatingHours: {
            days: formData.operatingDays,
            openTime: formData.openingTime,
            closeTime: formData.closingTime,
          },
        },
      });
      router.replace('/auth/email-verification');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <React.Fragment key={index}>
            <View
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index + 1 <= currentStep
                      ? theme.colors.primary[500]
                      : theme.colors.gray[300],
                },
              ]}
            >
              {index + 1 < currentStep && (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              )}
              {index + 1 === currentStep && (
                <Text style={styles.progressNumber}>{index + 1}</Text>
              )}
            </View>
            {index < TOTAL_STEPS - 1 && (
              <View
                style={[
                  styles.progressLine,
                  {
                    backgroundColor:
                      index + 1 < currentStep
                        ? theme.colors.primary[500]
                        : theme.colors.gray[300],
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      <Text style={[styles.stepLabel, { color: theme.colors.text.secondary }]}>
        Step {currentStep} of {TOTAL_STEPS}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Personal Information
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
        Let's start with your basic information
      </Text>

      <Input
        label="Full Name"
        placeholder="Enter your full name"
        value={formData.fullName}
        onChangeText={(text) => updateField('fullName', text)}
        error={errors.fullName}
        icon="person-outline"
        autoCapitalize="words"
      />

      <Input
        label="Email"
        placeholder="Enter your email"
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
        error={errors.email}
        icon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Phone Number"
        placeholder="Enter your phone number"
        value={formData.phone}
        onChangeText={(text) => updateField('phone', text)}
        error={errors.phone}
        icon="call-outline"
        keyboardType="phone-pad"
      />

      <Input
        label="Password"
        placeholder="Create a password"
        value={formData.password}
        onChangeText={(text) => updateField('password', text)}
        error={errors.password}
        icon="lock-closed-outline"
        rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
        onRightIconPress={() => setShowPassword(!showPassword)}
        secureTextEntry={!showPassword}
      />

      <Input
        label="Confirm Password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChangeText={(text) => updateField('confirmPassword', text)}
        error={errors.confirmPassword}
        icon="lock-closed-outline"
        secureTextEntry={!showPassword}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Shop Information
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
        Tell us about your business
      </Text>

      <Input
        label="Shop Name"
        placeholder="Enter your shop name"
        value={formData.shopName}
        onChangeText={(text) => updateField('shopName', text)}
        error={errors.shopName}
        icon="storefront-outline"
      />

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>
          Shop Category
        </Text>
        <TouchableOpacity
          style={[
            styles.selectButton,
            {
              backgroundColor: theme.colors.input.background,
              borderColor: errors.shopCategory
                ? theme.colors.error[500]
                : theme.colors.input.border,
            },
          ]}
          onPress={() => setShowCategoryPicker(true)}
        >
          <Ionicons
            name="business-outline"
            size={20}
            color={theme.colors.text.muted}
          />
          <Text
            style={[
              styles.selectText,
              {
                color: formData.shopCategory
                  ? theme.colors.text.primary
                  : theme.colors.input.placeholder,
              },
            ]}
          >
            {formData.shopCategory || 'Select category'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.colors.text.muted}
          />
        </TouchableOpacity>
        {errors.shopCategory && (
          <Text style={[styles.errorText, { color: theme.colors.error[500] }]}>
            {errors.shopCategory}
          </Text>
        )}
      </View>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <View style={[styles.pickerOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.pickerContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.pickerTitle, { color: theme.colors.text.primary }]}>
              Select Category
            </Text>
            {SHOP_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.pickerItem,
                  formData.shopCategory === category && {
                    backgroundColor: theme.colors.primary[50],
                  },
                ]}
                onPress={() => {
                  updateField('shopCategory', category);
                  setShowCategoryPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    {
                      color:
                        formData.shopCategory === category
                          ? theme.colors.primary[600]
                          : theme.colors.text.primary,
                    },
                  ]}
                >
                  {category}
                </Text>
                {formData.shopCategory === category && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.primary[600]}
                  />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.pickerCancel, { borderTopColor: theme.colors.border }]}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={[styles.pickerCancelText, { color: theme.colors.text.secondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Input
        label="Shop Description"
        placeholder="Describe your shop..."
        value={formData.shopDescription}
        onChangeText={(text) => updateField('shopDescription', text)}
        icon="document-text-outline"
        multiline
        numberOfLines={4}
        style={{ height: 100, textAlignVertical: 'top' }}
      />

      <Input
        label="Business Registration (Optional)"
        placeholder="Enter registration number"
        value={formData.businessRegistration}
        onChangeText={(text) => updateField('businessRegistration', text)}
        icon="card-outline"
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Shop Location
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
        Where is your shop located?
      </Text>

      <Input
        label="Address Line 1"
        placeholder="Street address"
        value={formData.addressLine1}
        onChangeText={(text) => updateField('addressLine1', text)}
        error={errors.addressLine1}
        icon="location-outline"
      />

      <Input
        label="Address Line 2 (Optional)"
        placeholder="Apartment, suite, unit, etc."
        value={formData.addressLine2}
        onChangeText={(text) => updateField('addressLine2', text)}
        icon="home-outline"
      />

      <View style={styles.rowInputs}>
        <View style={{ flex: 1 }}>
          <Input
            label="City"
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => updateField('city', text)}
            error={errors.city}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="State"
            placeholder="State"
            value={formData.state}
            onChangeText={(text) => updateField('state', text)}
            error={errors.state}
          />
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={{ flex: 1 }}>
          <Input
            label="Postal Code"
            placeholder="Postal code"
            value={formData.postalCode}
            onChangeText={(text) => updateField('postalCode', text)}
            error={errors.postalCode}
            keyboardType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="Country"
            placeholder="Country"
            value={formData.country}
            onChangeText={(text) => updateField('country', text)}
          />
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text.primary }]}>
        Operating Hours
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.text.secondary }]}>
        When is your shop open?
      </Text>

      {/* Days of Operation */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>
          Days of Operation
        </Text>
        <View style={styles.daysContainer}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = formData.operatingDays.includes(day.key);
            return (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary[500]
                      : theme.colors.gray[100],
                    borderColor: isSelected
                      ? theme.colors.primary[500]
                      : theme.colors.gray[200],
                  },
                ]}
                onPress={() => toggleDay(day.key)}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: isSelected ? '#FFFFFF' : theme.colors.text.secondary },
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Opening Time */}
      <Input
        label="Opening Time"
        placeholder="09:00"
        value={formData.openingTime}
        onChangeText={(text) => updateField('openingTime', text)}
        icon="time-outline"
      />

      {/* Closing Time */}
      <Input
        label="Closing Time"
        placeholder="19:00"
        value={formData.closingTime}
        onChangeText={(text) => updateField('closingTime', text)}
        icon="time-outline"
      />

      {/* Summary */}
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: theme.colors.primary[50] },
        ]}
      >
        <Ionicons
          name="information-circle"
          size={24}
          color={theme.colors.primary[600]}
        />
        <Text style={[styles.summaryText, { color: theme.colors.primary[700] }]}>
          You can always modify these settings later from your shop dashboard.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Alert.alert('Save Draft', 'Your progress has been saved')}
        >
          <Text style={[styles.saveDraft, { color: theme.colors.primary[500] }]}>
            Save Draft
          </Text>
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomActions,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        {currentStep > 1 && (
          <Button variant="outline" onPress={handleBack} style={{ flex: 1, marginRight: 12 }}>
            Back
          </Button>
        )}
        <Button
          onPress={handleNext}
          loading={loading}
          style={{ flex: currentStep > 1 ? 1 : undefined }}
          fullWidth={currentStep === 1}
        >
          {currentStep < TOTAL_STEPS ? 'Next' : 'Create Account'}
        </Button>
      </View>
    </KeyboardAvoidingView>
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
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDraft: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    maxWidth: 60,
  },
  stepLabel: {
    textAlign: 'center',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  stepContent: {},
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginTop: 16,
  },
  summaryText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  pickerContent: {
    width: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pickerItemText: {
    fontSize: 16,
  },
  pickerCancel: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  pickerCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default BarberSignUpScreen;
