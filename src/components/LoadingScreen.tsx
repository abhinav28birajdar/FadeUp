import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { UI_CONFIG } from '../config/constants';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={UI_CONFIG.colors.primary} />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI_CONFIG.colors.background,
  },
  text: {
    marginTop: UI_CONFIG.spacing.md,
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.textSecondary,
  },
});