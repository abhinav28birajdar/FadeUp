import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { QueueList } from '../components/QueueList';
import { ServiceList } from '../components/ServiceList';
import { ShopStatus } from '../components/ShopStatus';
import { UI_CONFIG } from '../config/constants';
import { useAuth } from '../contexts/AuthContext';
import { queueService, serviceService, shopService } from '../services/firestore';
import { QueueItem, Service, Shop } from '../types';
import { formatWaitTime } from '../utils/time';

export function BarberDashboard() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  useEffect(() => {
    if (shop) {
      // Subscribe to real-time queue updates
      const unsubscribe = queueService.onQueueUpdate(shop.id, (queueData) => {
        setQueue(queueData);
      });

      return unsubscribe;
    }
  }, [shop]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load shop data
      const shopData = await shopService.getByBarberId(user.id);
      if (shopData) {
        setShop(shopData);
        
        // Load services
        const servicesData = await serviceService.getByShopId(shopData.id);
        setServices(servicesData);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleToggleShopStatus = async () => {
    if (!shop) return;

    try {
      const newStatus = !shop.isOpen;
      await shopService.update(shop.id, { isOpen: newStatus });
      setShop({ ...shop, isOpen: newStatus });
      
      Alert.alert(
        'Shop Status Updated',
        `Your shop is now ${newStatus ? 'open' : 'closed'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update shop status');
    }
  };

  const handleCompleteCustomer = async (queueItemId: string) => {
    try {
      await queueService.completeService(queueItemId);
      Alert.alert('Customer Completed', 'Customer has been marked as done');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete customer service');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut },
      ]
    );
  };

  const activeCustomer = queue.find(item => item.status === 'active');
  const waitingQueue = queue.filter(item => item.status === 'waiting');

  if (loading && !shop) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Shop not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.queueCount}>
            {waitingQueue.length} customers waiting
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <ShopStatus 
          shop={shop} 
          onToggleStatus={handleToggleShopStatus}
        />

        {activeCustomer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Customer</Text>
            <View style={styles.activeCustomerCard}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{activeCustomer.customerName}</Text>
                <Text style={styles.serviceName}>{activeCustomer.serviceName}</Text>
                <Text style={styles.serviceTime}>
                  {formatWaitTime(activeCustomer.serviceDuration)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleCompleteCustomer(activeCustomer.id)}
              >
                <Text style={styles.completeButtonText}>Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Queue ({waitingQueue.length})</Text>
          <QueueList 
            queue={waitingQueue}
            showActions={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <ServiceList 
            services={services}
            shopId={shop.id}
            isOwner={true}
            onServicesUpdated={(updatedServices) => setServices(updatedServices)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_CONFIG.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: UI_CONFIG.spacing.lg,
    paddingTop: UI_CONFIG.spacing.xl,
    paddingBottom: UI_CONFIG.spacing.md,
    backgroundColor: UI_CONFIG.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: UI_CONFIG.colors.border,
  },
  shopName: {
    fontSize: UI_CONFIG.fontSize.lg,
    fontWeight: 'bold',
    color: UI_CONFIG.colors.text,
  },
  queueCount: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.textSecondary,
    marginTop: UI_CONFIG.spacing.xs,
  },
  signOutButton: {
    paddingHorizontal: UI_CONFIG.spacing.md,
    paddingVertical: UI_CONFIG.spacing.sm,
    borderRadius: UI_CONFIG.borderRadius.md,
    borderWidth: 1,
    borderColor: UI_CONFIG.colors.border,
  },
  signOutButtonText: {
    color: UI_CONFIG.colors.textSecondary,
    fontSize: UI_CONFIG.fontSize.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: UI_CONFIG.spacing.lg,
  },
  section: {
    marginVertical: UI_CONFIG.spacing.lg,
  },
  sectionTitle: {
    fontSize: UI_CONFIG.fontSize.lg,
    fontWeight: '600',
    color: UI_CONFIG.colors.text,
    marginBottom: UI_CONFIG.spacing.md,
  },
  activeCustomerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_CONFIG.spacing.md,
    backgroundColor: UI_CONFIG.colors.primary + '10',
    borderRadius: UI_CONFIG.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: UI_CONFIG.colors.primary,
  },
  customerInfo: {
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
  serviceTime: {
    fontSize: UI_CONFIG.fontSize.sm,
    color: UI_CONFIG.colors.primary,
    marginTop: UI_CONFIG.spacing.xs,
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: UI_CONFIG.colors.success,
    paddingHorizontal: UI_CONFIG.spacing.lg,
    paddingVertical: UI_CONFIG.spacing.sm,
    borderRadius: UI_CONFIG.borderRadius.md,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: UI_CONFIG.fontSize.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI_CONFIG.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI_CONFIG.colors.background,
    paddingHorizontal: UI_CONFIG.spacing.lg,
  },
  errorText: {
    fontSize: UI_CONFIG.fontSize.lg,
    color: UI_CONFIG.colors.error,
    textAlign: 'center',
    marginBottom: UI_CONFIG.spacing.lg,
  },
  retryButton: {
    backgroundColor: UI_CONFIG.colors.primary,
    paddingHorizontal: UI_CONFIG.spacing.lg,
    paddingVertical: UI_CONFIG.spacing.md,
    borderRadius: UI_CONFIG.borderRadius.md,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});