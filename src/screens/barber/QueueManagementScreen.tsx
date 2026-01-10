/**
 * Barber Queue Management Screen
 * Manage current queue, call customers, track wait times
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge, Button, ConfirmModal } from '../../components/ui';
import { useTheme } from '../../theme';

interface QueueCustomer {
  id: string;
  name: string;
  phone: string;
  services: string[];
  totalDuration: number;
  totalPrice: number;
  joinedAt: string;
  waitTime: number;
  position: number;
  status: 'waiting' | 'in_service' | 'notified';
  avatar?: string;
  notes?: string;
}

const mockQueueCustomers: QueueCustomer[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+1 555-0101',
    services: ['Fade Haircut', 'Beard Trim'],
    totalDuration: 65,
    totalPrice: 50,
    joinedAt: '10:15 AM',
    waitTime: 5,
    position: 1,
    status: 'notified',
  },
  {
    id: '2',
    name: 'Mike Johnson',
    phone: '+1 555-0102',
    services: ['Classic Haircut'],
    totalDuration: 30,
    totalPrice: 25,
    joinedAt: '10:25 AM',
    waitTime: 25,
    position: 2,
    status: 'waiting',
  },
  {
    id: '3',
    name: 'Robert Wilson',
    phone: '+1 555-0103',
    services: ['Hot Towel Shave'],
    totalDuration: 30,
    totalPrice: 30,
    joinedAt: '10:35 AM',
    waitTime: 40,
    position: 3,
    status: 'waiting',
    notes: 'Prefers extra hot towel',
  },
  {
    id: '4',
    name: 'David Brown',
    phone: '+1 555-0104',
    services: ['Fade Haircut', 'Hair Coloring'],
    totalDuration: 120,
    totalPrice: 100,
    joinedAt: '10:45 AM',
    waitTime: 55,
    position: 4,
    status: 'waiting',
  },
];

export const QueueManagementScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [queueCustomers, setQueueCustomers] = useState(mockQueueCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<QueueCustomer | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [customerToRemove, setCustomerToRemove] = useState<QueueCustomer | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleStartService = (customer: QueueCustomer) => {
    Alert.alert(
      'Start Service',
      `Start service for ${customer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            // TODO: Implement start service
            setQueueCustomers((prev) =>
              prev.map((c) =>
                c.id === customer.id ? { ...c, status: 'in_service' as const } : c
              )
            );
          },
        },
      ]
    );
  };

  const handleNotifyCustomer = (customer: QueueCustomer) => {
    // TODO: Send notification to customer
    setQueueCustomers((prev) =>
      prev.map((c) =>
        c.id === customer.id ? { ...c, status: 'notified' as const } : c
      )
    );
    Alert.alert('Notified', `${customer.name} has been notified`);
  };

  const handleRemoveFromQueue = (customer: QueueCustomer) => {
    setCustomerToRemove(customer);
    setShowRemoveModal(true);
  };

  const confirmRemove = () => {
    if (customerToRemove) {
      setQueueCustomers((prev) =>
        prev.filter((c) => c.id !== customerToRemove.id)
      );
      setShowRemoveModal(false);
      setCustomerToRemove(null);
    }
  };

  const handleCallCustomer = (customer: QueueCustomer) => {
    // TODO: Implement phone call
    Alert.alert('Call', `Calling ${customer.phone}`);
  };

  const handleAddToQueue = () => {
    router.push('/add-to-queue');
  };

  const handleCompleteService = (customer: QueueCustomer) => {
    Alert.alert(
      'Complete Service',
      `Mark service as completed for ${customer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            // TODO: Implement complete service
            setQueueCustomers((prev) =>
              prev.filter((c) => c.id !== customer.id)
            );
            Alert.alert('Success', 'Service completed!');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: QueueCustomer['status']) => {
    switch (status) {
      case 'notified':
        return theme.colors.warning[500];
      case 'in_service':
        return theme.colors.success[500];
      default:
        return theme.colors.text.muted;
    }
  };

  const getStatusLabel = (status: QueueCustomer['status']) => {
    switch (status) {
      case 'notified':
        return 'Notified';
      case 'in_service':
        return 'In Service';
      default:
        return 'Waiting';
    }
  };

  const totalWaitTime = queueCustomers.reduce((acc, c) => acc + c.totalDuration, 0);

  const renderHeader = () => (
    <View style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.queueStats}>
        <View style={styles.queueStatItem}>
          <Text style={[styles.queueStatValue, { color: theme.colors.primary[500] }]}>
            {queueCustomers.length}
          </Text>
          <Text style={[styles.queueStatLabel, { color: theme.colors.text.secondary }]}>
            In Queue
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.queueStatItem}>
          <Text style={[styles.queueStatValue, { color: theme.colors.primary[500] }]}>
            ~{totalWaitTime}
          </Text>
          <Text style={[styles.queueStatLabel, { color: theme.colors.text.secondary }]}>
            Minutes Total
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.queueStatItem}>
          <Text style={[styles.queueStatValue, { color: theme.colors.primary[500] }]}>
            {queueCustomers.filter((c) => c.status === 'in_service').length}
          </Text>
          <Text style={[styles.queueStatLabel, { color: theme.colors.text.secondary }]}>
            In Service
          </Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <Button
          variant="outline"
          size="sm"
          onPress={() => router.push('/queue/settings')}
          style={{ flex: 1 }}
        >
          <Ionicons name="settings-outline" size={16} color={theme.colors.primary[500]} />
          <Text style={{ color: theme.colors.primary[500], marginLeft: 4 }}>Settings</Text>
        </Button>
        <Button size="sm" onPress={handleAddToQueue} style={{ flex: 1 }}>
          <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
          <Text style={{ color: '#FFFFFF', marginLeft: 4 }}>Add Customer</Text>
        </Button>
      </View>
    </View>
  );

  const renderCustomerCard = ({ item, index }: { item: QueueCustomer; index: number }) => (
    <View
      style={[
        styles.customerCard,
        {
          backgroundColor: theme.colors.surface,
          borderLeftColor:
            item.status === 'in_service'
              ? theme.colors.success[500]
              : item.status === 'notified'
              ? theme.colors.warning[500]
              : theme.colors.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.positionBadge}>
          <Text
            style={[
              styles.positionText,
              {
                color:
                  index === 0
                    ? theme.colors.success[500]
                    : theme.colors.text.secondary,
              },
            ]}
          >
            #{item.position}
          </Text>
        </View>
        <Avatar name={item.name} size={48} />
        <View style={styles.customerInfo}>
          <Text style={[styles.customerName, { color: theme.colors.text.primary }]}>
            {item.name}
          </Text>
          <Text style={[styles.joinedTime, { color: theme.colors.text.muted }]}>
            Joined at {item.joinedAt}
          </Text>
        </View>
        <Badge
          label={getStatusLabel(item.status)}
          variant={
            item.status === 'in_service'
              ? 'success'
              : item.status === 'notified'
              ? 'warning'
              : 'default'
          }
          size="sm"
        />
      </View>

      <View style={styles.servicesSection}>
        <Text style={[styles.servicesLabel, { color: theme.colors.text.muted }]}>
          Services:
        </Text>
        <Text style={[styles.servicesList, { color: theme.colors.text.secondary }]}>
          {item.services.join(', ')}
        </Text>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text.muted} />
          <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
            {item.totalDuration} min
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={16} color={theme.colors.text.muted} />
          <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
            ${item.totalPrice}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons
            name="hourglass-outline"
            size={16}
            color={
              item.waitTime > 30
                ? theme.colors.warning[500]
                : theme.colors.text.muted
            }
          />
          <Text
            style={[
              styles.detailText,
              {
                color:
                  item.waitTime > 30
                    ? theme.colors.warning[500]
                    : theme.colors.text.secondary,
              },
            ]}
          >
            {item.waitTime} min wait
          </Text>
        </View>
      </View>

      {item.notes && (
        <View
          style={[styles.notesSection, { backgroundColor: theme.colors.warning[50] }]}
        >
          <Ionicons name="document-text-outline" size={16} color={theme.colors.warning[600]} />
          <Text style={[styles.notesText, { color: theme.colors.warning[700] }]}>
            {item.notes}
          </Text>
        </View>
      )}

      <View style={styles.cardActions}>
        {item.status === 'waiting' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.neutral[100] }]}
              onPress={() => handleNotifyCustomer(item)}
            >
              <Ionicons name="notifications-outline" size={18} color={theme.colors.primary[500]} />
              <Text style={[styles.actionText, { color: theme.colors.primary[500] }]}>
                Notify
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.neutral[100] }]}
              onPress={() => handleCallCustomer(item)}
            >
              <Ionicons name="call-outline" size={18} color={theme.colors.primary[500]} />
              <Text style={[styles.actionText, { color: theme.colors.primary[500] }]}>
                Call
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.status === 'notified' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.success[50], flex: 1 }]}
            onPress={() => handleStartService(item)}
          >
            <Ionicons name="play-outline" size={18} color={theme.colors.success[500]} />
            <Text style={[styles.actionText, { color: theme.colors.success[500] }]}>
              Start Service
            </Text>
          </TouchableOpacity>
        )}

        {item.status === 'in_service' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.success[500], flex: 1 }]}
            onPress={() => handleCompleteService(item)}
          >
            <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
            <Text style={[styles.actionText, { color: '#FFFFFF' }]}>
              Complete Service
            </Text>
          </TouchableOpacity>
        )}

        {item.status !== 'in_service' && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error[50] }]}
            onPress={() => handleRemoveFromQueue(item)}
          >
            <Ionicons name="close-outline" size={18} color={theme.colors.error[500]} />
            <Text style={[styles.actionText, { color: theme.colors.error[500] }]}>
              Remove
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={theme.colors.text.muted} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        No customers in queue
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
        Add customers or wait for online queue joins
      </Text>
      <Button onPress={handleAddToQueue} style={{ marginTop: 24 }}>
        Add Customer
      </Button>
    </View>
  );

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
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Queue Management
        </Text>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.neutral[100] }]}
          onPress={onRefresh}
        >
          <Ionicons name="refresh-outline" size={20} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={queueCustomers}
        renderItem={renderCustomerCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <ConfirmModal
        visible={showRemoveModal}
        title="Remove from Queue"
        message={`Remove ${customerToRemove?.name} from the queue? They will need to rejoin.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        confirmVariant="error"
        onConfirm={confirmRemove}
        onCancel={() => {
          setShowRemoveModal(false);
          setCustomerToRemove(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  queueStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  queueStatItem: {
    alignItems: 'center',
  },
  queueStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  queueStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  customerCard: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionBadge: {
    marginRight: 12,
    width: 32,
    alignItems: 'center',
  },
  positionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  joinedTime: {
    fontSize: 12,
  },
  servicesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  servicesLabel: {
    fontSize: 13,
    marginRight: 4,
  },
  servicesList: {
    fontSize: 13,
    flex: 1,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  notesText: {
    fontSize: 13,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 250,
  },
});

export default QueueManagementScreen;
