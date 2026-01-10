/**
 * Select Services Screen
 * Step 1 of booking flow - select services to book
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../../components/ui';
import { useTheme } from '../../theme';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  popular?: boolean;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Classic Haircut',
    description: 'Traditional haircut with clippers and scissors',
    duration: 30,
    price: 25,
    category: 'Haircuts',
  },
  {
    id: '2',
    name: 'Fade Haircut',
    description: 'Clean fade with precision blending',
    duration: 45,
    price: 35,
    category: 'Haircuts',
    popular: true,
  },
  {
    id: '3',
    name: 'Beard Trim',
    description: 'Shape and trim your beard',
    duration: 20,
    price: 15,
    category: 'Beard',
  },
  {
    id: '4',
    name: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with hot towel',
    duration: 30,
    price: 30,
    category: 'Beard',
  },
  {
    id: '5',
    name: 'Hair Coloring',
    description: 'Full hair color treatment',
    duration: 60,
    price: 50,
    category: 'Coloring',
  },
  {
    id: '6',
    name: 'Kids Haircut',
    description: 'Haircut for children under 12',
    duration: 25,
    price: 18,
    category: 'Kids',
  },
  {
    id: '7',
    name: 'Haircut + Beard',
    description: 'Full haircut with beard trim combo',
    duration: 50,
    price: 45,
    category: 'Packages',
    popular: true,
  },
];

export const SelectServicesScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ shopId: string }>();

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...new Set(mockServices.map((s) => s.category))];

  const filteredServices =
    selectedCategory === 'All'
      ? mockServices
      : mockServices.filter((s) => s.category === selectedCategory);

  const totalDuration = mockServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.duration, 0);

  const totalPrice = mockServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((acc, s) => acc + s.price, 0);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContinue = () => {
    router.push({
      pathname: '/booking/select-barber',
      params: {
        shopId: params.shopId,
        services: selectedServices.join(','),
      },
    });
  };

  const renderService = ({ item }: { item: Service }) => {
    const isSelected = selectedServices.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.serviceCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isSelected
              ? theme.colors.primary[500]
              : theme.colors.neutral[200],
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => toggleService(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.serviceMain}>
          <View style={styles.serviceInfo}>
            <View style={styles.serviceHeader}>
              <Text
                style={[styles.serviceName, { color: theme.colors.text.primary }]}
              >
                {item.name}
              </Text>
              {item.popular && (
                <Badge label="Popular" variant="primary" size="small" />
              )}
            </View>
            <Text
              style={[styles.serviceDescription, { color: theme.colors.text.secondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
            <View style={styles.serviceMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={theme.colors.text.muted}
                />
                <Text
                  style={[styles.metaText, { color: theme.colors.text.muted }]}
                >
                  {item.duration} min
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.serviceRight}>
            <Text
              style={[styles.servicePrice, { color: theme.colors.text.primary }]}
            >
              ${item.price}
            </Text>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isSelected
                    ? theme.colors.primary[500]
                    : 'transparent',
                  borderColor: isSelected
                    ? theme.colors.primary[500]
                    : theme.colors.neutral[300],
                },
              ]}
            >
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </View>
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
            Select Services
          </Text>
          <Text style={[styles.stepText, { color: theme.colors.text.muted }]}>
            Step 1 of 4
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
              { backgroundColor: theme.colors.primary[500], width: '25%' },
            ]}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === item
                      ? theme.colors.primary[500]
                      : theme.colors.surface,
                  borderColor:
                    selectedCategory === item
                      ? theme.colors.primary[500]
                      : theme.colors.neutral[200],
                },
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === item
                        ? '#FFFFFF'
                        : theme.colors.text.secondary,
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Services List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={renderService}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.servicesList}
      />

      {/* Bottom Bar */}
      {selectedServices.length > 0 && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <View>
              <Text
                style={[styles.summaryLabel, { color: theme.colors.text.secondary }]}
              >
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} • {totalDuration} min
              </Text>
              <Text
                style={[styles.summaryTotal, { color: theme.colors.text.primary }]}
              >
                Total: ${totalPrice}
              </Text>
            </View>
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
  categoriesContainer: {
    marginBottom: 8,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  servicesList: {
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  serviceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  serviceMain: {
    flexDirection: 'row',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  serviceRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectServicesScreen;
