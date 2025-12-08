import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">My Bookings</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Upcoming and past appointments
        </ThemedText>
      </ThemedView>
      
      <ScrollView style={styles.content}>
        <View style={styles.emptyState}>
          <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>
            No bookings yet
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Your upcoming appointments will appear here.
          </ThemedText>
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginBottom: 10,
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
});