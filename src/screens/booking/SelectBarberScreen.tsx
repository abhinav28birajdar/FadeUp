/**
 * Select Barber Screen
 * Step 2 of booking flow - choose a barber
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui';
import { useTheme } from '../../theme';

interface Barber {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  yearsExperience: number;
  isAvailable: boolean;
  nextAvailable?: string;
}

const mockBarbers: Barber[] = [
  {
    id: 'any',
    name: 'First Available',
    avatar: '',
    rating: 0,
    reviewCount: 0,
    specialties: [],
    yearsExperience: 0,
    isAvailable: true,
  },
  {
    id: '1',
    name: 'Mike Anderson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    rating: 4.9,
    reviewCount: 156,
    specialties: ['Fades', 'Classic Cuts', 'Beard Styling'],
    yearsExperience: 8,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'James Wilson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    rating: 4.7,
    reviewCount: 89,
    specialties: ['Modern Styles', 'Hair Coloring'],
    yearsExperience: 5,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'David Brown',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    rating: 4.8,
    reviewCount: 112,
    specialties: ['Beard Trims', 'Hot Towel Shave'],
    yearsExperience: 6,
    isAvailable: false,
    nextAvailable: 'Tomorrow, 10:00 AM',
  },
];

export const SelectBarberScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ shopId: string; services: string }>();

  const [selectedBarber, setSelectedBarber] = useState<string>('');

  const handleContinue = () => {
    router.push({
      pathname: '/booking/select-datetime',
      params: {
        shopId: params.shopId,
        services: params.services,
        barberId: selectedBarber,
      },
    });
  };

  const renderBarberCard = ({ item, index }: { item: Barber; index: number }) => {
    const isSelected = selectedBarber === item.id;
    const isFirstAvailable = item.id === 'any';

    if (isFirstAvailable) {
      return (
        <TouchableOpacity
          style={[
            styles.firstAvailableCard,
            {
              backgroundColor: isSelected
                ? theme.colors.primary[50]
                : theme.colors.surface,
              borderColor: isSelected
                ? theme.colors.primary[500]
                : theme.colors.neutral[200],
              borderWidth: isSelected ? 2 : 1,
            },
          ]}
          onPress={() => setSelectedBarber(item.id)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.firstAvailableIcon,
              { backgroundColor: theme.colors.primary[100] },
            ]}
          >
            <Ionicons
              name="flash"
              size={28}
              color={theme.colors.primary[500]}
            />
          </View>
          <View style={styles.firstAvailableInfo}>
            <Text
              style={[styles.firstAvailableTitle, { color: theme.colors.text.primary }]}
            >
              First Available
            </Text>
            <Text
              style={[styles.firstAvailableSubtitle, { color: theme.colors.text.secondary }]}
            >
              Get the earliest available slot with any barber
            </Text>
          </View>
          <View
            style={[
              styles.radioOuter,
              {
                borderColor: isSelected
                  ? theme.colors.primary[500]
                  : theme.colors.neutral[300],
              },
            ]}
          >
            {isSelected && (
              <View
                style={[
                  styles.radioInner,
                  { backgroundColor: theme.colors.primary[500] },
                ]}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.barberCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isSelected
              ? theme.colors.primary[500]
              : theme.colors.neutral[200],
            borderWidth: isSelected ? 2 : 1,
            opacity: item.isAvailable ? 1 : 0.7,
          },
        ]}
        onPress={() => item.isAvailable && setSelectedBarber(item.id)}
        activeOpacity={0.8}
        disabled={!item.isAvailable}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.barberInfo}>
          <Text
            style={[styles.barberName, { color: theme.colors.text.primary }]}
          >
            {item.name}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={theme.colors.warning[400]} />
            <Text
              style={[styles.ratingText, { color: theme.colors.text.secondary }]}
            >
              {item.rating} ({item.reviewCount})
            </Text>
            <Text style={[styles.dot, { color: theme.colors.text.muted }]}>•</Text>
            <Text
              style={[styles.experienceText, { color: theme.colors.text.muted }]}
            >
              {item.yearsExperience} years exp.
            </Text>
          </View>
          <View style={styles.specialtiesRow}>
            {item.specialties.slice(0, 2).map((specialty, i) => (
              <View
                key={i}
                style={[
                  styles.specialtyBadge,
                  { backgroundColor: theme.colors.neutral[100] },
                ]}
              >
                <Text
                  style={[styles.specialtyText, { color: theme.colors.text.secondary }]}
                >
                  {specialty}
                </Text>
              </View>
            ))}
          </View>
          {!item.isAvailable && (
            <View
              style={[
                styles.unavailableBadge,
                { backgroundColor: theme.colors.warning[50] },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={12}
                color={theme.colors.warning[600]}
              />
              <Text
                style={[styles.unavailableText, { color: theme.colors.warning[700] }]}
              >
                Next: {item.nextAvailable}
              </Text>
            </View>
          )}
        </View>
        <View
          style={[
            styles.radioOuter,
            {
              borderColor: isSelected
                ? theme.colors.primary[500]
                : theme.colors.neutral[300],
            },
          ]}
        >
          {isSelected && (
            <View
              style={[
                styles.radioInner,
                { backgroundColor: theme.colors.primary[500] },
              ]}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
            Choose Barber
          </Text>
          <Text style={[styles.stepText, { color: theme.colors.text.muted }]}>
            Step 2 of 4
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
              { backgroundColor: theme.colors.primary[500], width: '50%' },
            ]}
          />
        </View>
      </View>

      {/* Barbers List */}
      <FlatList
        data={mockBarbers}
        keyExtractor={(item) => item.id}
        renderItem={renderBarberCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.barbersList}
      />

      {/* Bottom Bar */}
      {selectedBarber && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 24,
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
  barbersList: {
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  firstAvailableCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  firstAvailableIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  firstAvailableInfo: {
    flex: 1,
  },
  firstAvailableTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  firstAvailableSubtitle: {
    fontSize: 13,
  },
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  barberInfo: {
    flex: 1,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 4,
  },
  dot: {
    marginHorizontal: 6,
  },
  experienceText: {
    fontSize: 13,
  },
  specialtiesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  specialtyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 11,
  },
  unavailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  unavailableText: {
    fontSize: 11,
    fontWeight: '500',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectBarberScreen;
