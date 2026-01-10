import { ThemedText } from '@/components/themed-text';
import Button from '@/src/components/ui/Button';
import Card from '@/src/components/ui/Card';
import { useTheme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, View } from 'react-native';

interface QueuePosition {
  id: string;
  customerName: string;
  service: string;
  estimatedWaitTime: number; // minutes
  position: number;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled';
  joinedAt: Date;
  estimatedStartTime?: Date;
  isCurrentUser?: boolean;
}

interface QueueItemProps {
  item: QueuePosition;
  onCancel?: (item: QueuePosition) => void;
  onEdit?: (item: QueuePosition) => void;
  showActions?: boolean;
  isBarber?: boolean;
}

export const QueueItem: React.FC<QueueItemProps> = React.memo(({
  item,
  onCancel,
  onEdit,
  showActions = false,
  isBarber = false,
}) => {
  const theme = useTheme();

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return remaining > 0 ? `${hours}h ${remaining}min` : `${hours}h`;
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  const getStatusColor = (status: QueuePosition['status']) => {
    switch (status) {
      case 'waiting': return theme.colors.warning[500];
      case 'in-progress': return theme.colors.primary[500];
      case 'completed': return theme.colors.success[500];
      case 'cancelled': return theme.colors.error[500];
      default: return theme.colors.secondary[500];
    }
  };

  const getStatusText = (status: QueuePosition['status']) => {
    switch (status) {
      case 'waiting': return 'Waiting';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status as string;
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => onCancel?.(item) },
      ]
    );
  };

  return (
    <Card
      variant={item.isCurrentUser ? 'outlined' : 'default'}
      style={{
        marginBottom: theme.spacing[3],
        borderColor: item.isCurrentUser ? theme.colors.primary[300] : undefined,
        backgroundColor: item.isCurrentUser ? theme.colors.primary[50] : undefined,
      }}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing[3],
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary[500], alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing[3],
          }}>
            <ThemedText variant="body" style={{ color: 'white', fontWeight: '700' }}>
              #{item.position}
            </ThemedText>
          </View>

          <View>
            <ThemedText variant="subheading" weight="semibold">{item.customerName}</ThemedText>
            {item.isCurrentUser && (
              <ThemedText variant="caption" color="primary" weight="medium">Your Position</ThemedText>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[1], borderRadius: theme.borderRadius.md, backgroundColor: `${getStatusColor(item.status)}20` }}>
          <ThemedText variant="caption" weight="medium" style={{ color: getStatusColor(item.status) }}>{getStatusText(item.status)}</ThemedText>
        </View>
      </View>

      {/* Service */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing[2] }}>
        <Ionicons name="cut" size={16} color={theme.colors.text.muted} />
        <ThemedText variant="body" style={{ marginLeft: theme.spacing[2], flex: 1 }}>{item.service}</ThemedText>
      </View>

      {/* Timings */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: showActions ? theme.spacing[4] : 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="time" size={16} color={theme.colors.text.muted} />
          <ThemedText variant="caption" color="muted" style={{ marginLeft: theme.spacing[1] }}>Wait: {formatWaitTime(item.estimatedWaitTime)}</ThemedText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="calendar" size={16} color={theme.colors.text.muted} />
          <ThemedText variant="caption" color="muted" style={{ marginLeft: theme.spacing[1] }}>Joined: {formatTime(item.joinedAt)}</ThemedText>
        </View>

        {item.estimatedStartTime && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="play" size={16} color={theme.colors.text.muted} />
            <ThemedText variant="caption" color="muted" style={{ marginLeft: theme.spacing[1] }}>Est: {formatTime(item.estimatedStartTime)}</ThemedText>
          </View>
        )}
      </View>

      {/* Actions */}
      {showActions && (item.status === 'waiting' || item.status === 'in-progress') && (
        <View style={{ flexDirection: 'row' }}>
          {!isBarber && onCancel && item.status === 'waiting' && (
            <Button variant="danger" size="sm" onPress={handleCancel} style={{ flex: 1 }}>Cancel</Button>
          )}

          {isBarber && onEdit && (
            <Button variant="secondary" size="sm" onPress={() => onEdit(item)} style={{ flex: 1 }}>
              {item.status === 'waiting' ? 'Start Service' : 'Complete'}
            </Button>
          )}
        </View>
      )}
    </Card>
  );
});

QueueItem.displayName = 'QueueItem';

export default QueueItem;