/**
 * User Type Selection Screen
 * Choose between Customer and Barber account types
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { useTheme } from '../../theme';

type UserType = 'customer' | 'barber' | null;

interface TypeOption {
  type: UserType;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  features: string[];
}

const typeOptions: TypeOption[] = [
  {
    type: 'customer',
    icon: 'person',
    title: 'Customer',
    description: 'Find barbers, join queues, and book appointments',
    features: [
      'Discover nearby barber shops',
      'Join queues remotely',
      'Book appointments',
      'Track wait times in real-time',
      'Save favorite shops & barbers',
    ],
  },
  {
    type: 'barber',
    icon: 'cut',
    title: 'Barber / Shop Owner',
    description: 'Manage your shop, queues, and bookings',
    features: [
      'Manage your shop profile',
      'Handle queue & bookings',
      'Track earnings & analytics',
      'Set services & pricing',
      'Manage staff members',
    ],
  },
];

export const UserTypeSelectionScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<UserType>(null);

  const handleContinue = () => {
    if (selectedType) {
      router.push({
        pathname: '/auth/signup',
        params: { userType: selectedType },
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  const renderTypeCard = (option: TypeOption) => {
    const isSelected = selectedType === option.type;

    return (
      <TouchableOpacity
        key={option.type}
        onPress={() => setSelectedType(option.type)}
        activeOpacity={0.8}
        style={[
          styles.typeCard,
          {
            backgroundColor: theme.colors.card,
            borderColor: isSelected
              ? theme.colors.primary[500]
              : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        {/* Selection Indicator */}
        <View
          style={[
            styles.selectionIndicator,
            {
              borderColor: isSelected
                ? theme.colors.primary[500]
                : theme.colors.gray[300],
              backgroundColor: isSelected
                ? theme.colors.primary[500]
                : 'transparent',
            },
          ]}
        >
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>

        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isSelected
                ? theme.colors.primary[50]
                : theme.colors.gray[100],
            },
          ]}
        >
          <Ionicons
            name={option.icon}
            size={32}
            color={
              isSelected
                ? theme.colors.primary[500]
                : theme.colors.text.secondary
            }
          />
        </View>

        {/* Title & Description */}
        <Text
          style={[
            styles.typeTitle,
            { color: theme.colors.text.primary },
          ]}
        >
          {option.title}
        </Text>
        <Text
          style={[
            styles.typeDescription,
            { color: theme.colors.text.secondary },
          ]}
        >
          {option.description}
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {option.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={
                  isSelected
                    ? theme.colors.primary[500]
                    : theme.colors.success[500]
                }
              />
              <Text
                style={[
                  styles.featureText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: theme.colors.text.primary }]}
        >
          Choose Account Type
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.text.secondary },
          ]}
        >
          Select how you want to use FadeUp
        </Text>

        {/* Type Cards */}
        <View style={styles.cardsContainer}>
          {typeOptions.map(renderTypeCard)}
        </View>
      </View>

      {/* Bottom Action */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Button
          onPress={handleContinue}
          disabled={!selectedType}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 16,
  },
  typeCard: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});

export default UserTypeSelectionScreen;
