import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { UI_CONFIG } from '../config/constants';
import { Shop } from '../types';
import { isShopOpenNow } from '../utils/time';

interface ShopStatusProps {
  shop: Shop;
  onToggleStatus: () => void;
}

export function ShopStatus({ shop, onToggleStatus }: ShopStatusProps) {
  const isCurrentlyOpen = isShopOpenNow(shop.openingHours);
  const canBeOpen = shop.isOpen && isCurrentlyOpen;

  return (
    <View style={styles.container}>
      <View style={styles.statusInfo}>
        <Text style={styles.title}>Shop Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, canBeOpen ? styles.openDot : styles.closedDot]} />
          <Text style={[styles.statusText, canBeOpen ? styles.openText : styles.closedText]}>
            {canBeOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
        {shop.isOpen && !isCurrentlyOpen && (
          <Text style={styles.scheduleNote}>
            Currently outside business hours
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.toggleButton, shop.isOpen ? styles.closeButton : styles.openButton]}
        onPress={onToggleStatus}
      >
        <Text style={styles.toggleButtonText}>
          {shop.isOpen ? 'Close Shop' : 'Open Shop'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: UI_CONFIG.spacing.md,
    backgroundColor: UI_CONFIG.colors.surface,
    borderRadius: UI_CONFIG.borderRadius.lg,
    marginTop: UI_CONFIG.spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  title: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
    marginBottom: UI_CONFIG.spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: UI_CONFIG.spacing.sm,
  },
  openDot: {
    backgroundColor: UI_CONFIG.colors.success,
  },
  closedDot: {
    backgroundColor: UI_CONFIG.colors.error,
  },
  statusText: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '500',
  },
  openText: {
    color: UI_CONFIG.colors.success,
  },
  closedText: {
    color: UI_CONFIG.colors.error,
  },
  scheduleNote: {
    fontSize: UI_CONFIG.fontSize.xs,
    color: UI_CONFIG.colors.textSecondary,
    marginTop: UI_CONFIG.spacing.xs,
  },
  toggleButton: {
    paddingHorizontal: UI_CONFIG.spacing.md,
    paddingVertical: UI_CONFIG.spacing.sm,
    borderRadius: UI_CONFIG.borderRadius.md,
  },
  openButton: {
    backgroundColor: UI_CONFIG.colors.success,
  },
  closeButton: {
    backgroundColor: UI_CONFIG.colors.error,
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: UI_CONFIG.fontSize.sm,
  },
});