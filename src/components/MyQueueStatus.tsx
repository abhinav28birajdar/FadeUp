import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { UI_CONFIG } from '../config/constants';
import { queueService } from '../services/firestore';
import { QueueItem } from '../types';
import { formatWaitTime } from '../utils/time';

interface MyQueueStatusProps {
  queueItem: QueueItem;
  onLeaveQueue: () => void;
}

export function MyQueueStatus({ queueItem, onLeaveQueue }: MyQueueStatusProps) {
  const handleLeaveQueue = () => {
    Alert.alert(
      'Leave Queue',
      'Are you sure you want to leave the queue? You\'ll lose your position.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await queueService.leaveQueue(queueItem.id);
              onLeaveQueue();
            } catch (error) {
              Alert.alert('Error', 'Failed to leave queue');
            }
          },
        },
      ]
    );
  };

  const isActive = queueItem.status === 'active';
  const position = queueItem.positionIndex + 1;

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isActive ? '🎉 Your Turn!' : '⏰ In Queue'}
        </Text>
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeaveQueue}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.shopName}>{queueItem.serviceName}</Text>
      
      {!isActive && (
        <View style={styles.positionInfo}>
          <Text style={styles.positionText}>
            Position #{position} in queue
          </Text>
          <Text style={styles.waitTimeText}>
            Estimated wait: {formatWaitTime(queueItem.estimatedWaitMinutes)}
          </Text>
        </View>
      )}

      {isActive && (
        <Text style={styles.activeText}>
          The barber is ready for you! Head to the shop now.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: UI_CONFIG.colors.warning + '10',
    borderRadius: UI_CONFIG.borderRadius.lg,
    padding: UI_CONFIG.spacing.md,
    marginVertical: UI_CONFIG.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: UI_CONFIG.colors.warning,
  },
  activeContainer: {
    backgroundColor: UI_CONFIG.colors.success + '10',
    borderLeftColor: UI_CONFIG.colors.success,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: UI_CONFIG.spacing.sm,
  },
  title: {
    fontSize: UI_CONFIG.fontSize.md,
    fontWeight: 'bold',
    color: UI_CONFIG.colors.text,
  },
  leaveButton: {
    paddingHorizontal: UI_CONFIG.spacing.sm,
    paddingVertical: UI_CONFIG.spacing.xs,
    borderRadius: UI_CONFIG.borderRadius.sm,
    backgroundColor: UI_CONFIG.colors.error,
  },
  leaveButtonText: {
    color: 'white',
    fontSize: UI_CONFIG.fontSize.xs,
    fontWeight: '600',
  },
  shopName: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
    marginBottom: UI_CONFIG.spacing.sm,
  },
  positionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionText: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.text,
    fontWeight: '600',
  },
  waitTimeText: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.warning,
    fontWeight: '600',
  },
  activeText: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.success,
    fontWeight: '600',
  },
});