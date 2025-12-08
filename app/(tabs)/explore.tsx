import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_BARBERSHOPS = [
  {
    id: 1,
    name: "Classic Cuts",
    distance: "0.5 miles",
    rating: 4.8,
    waitTime: "15 min",
    isOpen: true,
  },
  {
    id: 2,
    name: "Modern Fade",
    distance: "0.8 miles", 
    rating: 4.6,
    waitTime: "25 min",
    isOpen: true,
  },
  {
    id: 3,
    name: "Elite Barber Co",
    distance: "1.2 miles",
    rating: 4.9,
    waitTime: "Closed",
    isOpen: false,
  },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Explore</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Discover barbershops near you
        </ThemedText>
      </ThemedView>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search barbershops, services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
            <ThemedText style={[styles.filterText, styles.filterTextActive]}>All</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <ThemedText style={styles.filterText}>Open Now</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <ThemedText style={styles.filterText}>Nearby</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <ThemedText style={styles.filterText}>Top Rated</ThemedText>
          </TouchableOpacity>
        </ScrollView>

        {/* Barbershop List */}
        <ScrollView style={styles.listContainer}>
          {MOCK_BARBERSHOPS.map((shop) => (
            <TouchableOpacity key={shop.id} style={styles.shopCard}>
              <View style={styles.shopHeader}>
                <ThemedText type="defaultSemiBold" style={styles.shopName}>
                  {shop.name}
                </ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: shop.isOpen ? '#10B981' : '#EF4444' }]}>
                  <ThemedText style={styles.statusText}>
                    {shop.isOpen ? 'Open' : 'Closed'}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.shopInfo}>
                <ThemedText style={styles.distance}>📍 {shop.distance}</ThemedText>
                <ThemedText style={styles.rating}>⭐ {shop.rating}</ThemedText>
                <ThemedText style={styles.waitTime}>⏱️ {shop.waitTime}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subtitle: {
    marginTop: 5,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  shopCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shopName: {
    fontSize: 18,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distance: {
    opacity: 0.7,
  },
  rating: {
    opacity: 0.7,
  },
  waitTime: {
    opacity: 0.7,
  },
});