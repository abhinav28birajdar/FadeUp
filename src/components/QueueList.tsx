import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { UI_CONFIG } from '../config/constants';
import { QueueItem } from '../types';
import { formatTime, formatWaitTime } from '../utils/time';

interface QueueListProps {
  queue: QueueItem[];
  showActions?: boolean;
}

export function QueueList({ queue, showActions = false }: QueueListProps) {
  const renderQueueItem = ({ item, index }: { item: QueueItem; index: number }) => (
    <View style={styles.queueItem}>
      <View style={styles.positionBadge}>
        <Text style={styles.positionText}>{index + 1}</Text>
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.serviceName}>{item.serviceName}</Text>
        <Text style={styles.arrivalTime}>
          Joined {formatTime(item.createdAt)}
        </Text>
      </View>
      
      <View style={styles.waitInfo}>
        <Text style={styles.waitTime}>
          {formatWaitTime(item.estimatedWaitMinutes)}
        </Text>
        <Text style={styles.serviceTime}>
          {formatWaitTime(item.serviceDuration)} service
        </Text>
      </View>
    </View>
  );

  if (queue.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No customers in queue</Text>
        <Text style={styles.emptySubtext}>
          Customers will appear here when they join your queue
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={queue}
      renderItem={renderQueueItem}
      keyExtractor={(item) => item.id}
      style={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    maxHeight: 300, // Limit height for dashboard view
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_CONFIG.spacing.md,
    backgroundColor: UI_CONFIG.colors.surface,
    borderRadius: UI_CONFIG.borderRadius.lg,
    marginBottom: UI_CONFIG.spacing.sm,
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
  },
  positionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: UI_CONFIG.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: UI_CONFIG.spacing.md,
  },
  positionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: UI_CONFIG.fontSize.sm,
  },
  itemInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
  },
  serviceName: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
    marginTop: UI_CONFIG.spacing.xs,
  },
  arrivalTime: {
    fontSize: UI_CONFIG.fontSize.xs,
    color: UI_CONFIG.colors.textLight,
    marginTop: UI_CONFIG.spacing.xs,
  },
  waitInfo: {
    alignItems: 'flex-end',
  },
  waitTime: {
    fontSize: UI_CONFIG.fontSize.sm,
    fontWeight: '600',
    color: UI_CONFIG.colors.primary,
  },
  serviceTime: {
    fontSize: UI_CONFIG.fontSize.xs,
    color: UI_CONFIG.colors.textSecondary,
    marginTop: UI_CONFIG.spacing.xs,
  },
  emptyContainer: {
    padding: UI_CONFIG.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: UI_CONFIG.fontSize.md,
    color: UI_CONFIG.colors.textSecondary,
    textAlign: 'center',
    marginBottom: UI_CONFIG.spacing.sm,
  },
  emptySubtext: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textLight,
    textAlign: 'center',
  },
});