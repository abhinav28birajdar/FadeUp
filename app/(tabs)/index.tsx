import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">FadeUp</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Find the perfect barbershop near you
        </ThemedText>
      </ThemedView>
      
      <ScrollView style={styles.content}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <TouchableOpacity style={styles.searchButton}>
            <ThemedText style={styles.searchText}>🔍 Search barbershops...</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <ThemedText style={styles.actionEmoji}>📅</ThemedText>
              <ThemedText style={styles.actionTitle}>Book Now</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Schedule an appointment</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <ThemedText style={styles.actionEmoji}>⏱️</ThemedText>
              <ThemedText style={styles.actionTitle}>Join Queue</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Get in line virtually</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Barbershops */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Featured Barbershops
          </ThemedText>
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Featured barbershops will appear here once available.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
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
  searchSection: {
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchText: {
    opacity: 0.6,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
});