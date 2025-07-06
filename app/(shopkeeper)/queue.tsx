import { Stack } from 'expo-router';
import { doc, DocumentData, getDoc, QuerySnapshot, writeBatch } from 'firebase/firestore';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import ModernCard from '@/src/components/ModernCard';
import { db } from '@/src/lib/firebase';
import { subscribeToQueueUpdates } from '@/src/lib/queueRealtime';
import { useAuthStore } from '@/src/store/authStore';
import { Booking, QueueEntry, UserProfile } from '@/src/types/firebaseModels';

interface QueueItem extends QueueEntry {
  customerName: string;
  serviceNames: string[];
}

export default function ShopkeeperQueueScreen() {
  const { user } = useAuthStore();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Subscribe to queue updates
  useEffect(() => {
    if (!user?.shop_id) return;
    
    const unsubscribe = subscribeToQueueUpdates(user.shop_id, (snapshot) => {
      fetchAndProcessQueue(snapshot);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const fetchAndProcessQueue = async (snapshot: QuerySnapshot<DocumentData>) => {
    try {
      const queueData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QueueEntry[];
      
      // Get customer names and service details for each queue entry
      const queueWithDetails = await Promise.all(
        queueData.map(async (entry) => {
          // Get customer name
          let customerName = 'Customer';
          try {
            const customerDoc = await getDoc(doc(db, 'users', entry.customer_id));
            if (customerDoc.exists()) {
              const customerData = customerDoc.data() as UserProfile;
              customerName = `${customerData.first_name} ${customerData.last_name}`;
            }
          } catch (error) {
            console.error('Error fetching customer:', error);
          }
          
          // Get service names
          let serviceNames: string[] = [];
          try {
            const bookingDoc = await getDoc(doc(db, 'bookings', entry.booking_id));
            if (bookingDoc.exists()) {
              const bookingData = bookingDoc.data() as Booking;
              
              // Get service names
              const servicePromises = bookingData.service_ids.map(async (serviceId) => {
                const serviceDoc = await getDoc(doc(db, 'services', serviceId));
                return serviceDoc.exists() ? serviceDoc.data().name : 'Service';
              });
              
              serviceNames = await Promise.all(servicePromises);
            }
          } catch (error) {
            console.error('Error fetching booking:', error);
          }
          
          return {
            ...entry,
            customerName,
            serviceNames
          };
        })
      );
      
      // Sort by position
      const sortedQueue = queueWithDetails.sort((a, b) => a.position - b.position);
      
      setQueueItems(sortedQueue);
      setLoading(false);
    } catch (error) {
      console.error('Error processing queue data:', error);
      setLoading(false);
    }
  };

  const handleMarkAsCompleted = async (queueItem: QueueItem) => {
    Alert.alert(
      'Confirm Completion',
      `Are you sure you want to mark ${queueItem.customerName}'s appointment as completed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setActionLoading(queueItem.id);
            try {
              // Update both booking and queue entry in a batch
              const batch = writeBatch(db);
              
              // Update booking status
              batch.update(doc(db, 'bookings', queueItem.booking_id), {
                status: 'completed'
              });
              
              // Update queue entry status
              batch.update(doc(db, 'queue', queueItem.id), {
                status: 'completed'
              });
              
              await batch.commit();
              
              // Queue will update automatically via the subscription
            } catch (error) {
              console.error('Error marking as completed:', error);
              Alert.alert('Error', 'Failed to update status');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const renderQueueItem = ({ item, index }: { item: QueueItem, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: 20 }}
      transition={{ type: 'timing', duration: 300, delay: index * 100 }}
    >
      <ModernCard delay={index * 100}>
        <View style={styles.queueItemContent}>
          <View style={styles.queueItemInfo}>
            <View style={styles.customerInfo}>
              <Text style={[styles.primaryLightText, styles.textLg, styles.fontSemibold]}>{item.customerName}</Text>
              <View style={styles.positionBadge}>
                <Text style={{ color: '#38BDF8', fontWeight: 'bold' }}>{item.position}</Text>
              </View>
            </View>
            
            <Text style={{ color: '#A1A1AA', marginTop: 4 }}>
              {item.serviceNames.join(', ')}
            </Text>
          </View>
          
          {item.status === 'waiting' && (
            <Pressable
              onPress={() => handleMarkAsCompleted(item)}
              disabled={actionLoading === item.id}
              style={({ pressed }) => [
                styles.completeButton,
                pressed && styles.completeButtonPressed
              ]}
            >
              {actionLoading === item.id ? (
                <ActivityIndicator size="small" color="#F3F4F6" />
              ) : (
                <Text style={[styles.primaryLightText, { textAlign: 'center', fontWeight: '600' }]}>
                  Complete
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </ModernCard>
    </MotiView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Manage Queue' }} />
      
      <View style={styles.content}>
        <Text style={[styles.primaryLightText, styles.textLg, styles.fontSemibold, { paddingHorizontal: 16, marginBottom: 16 }]}>
          Live Queue
        </Text>
        
        {queueItems.length > 0 ? (
          <AnimatePresence>
            <FlatList
              data={queueItems}
              renderItem={renderQueueItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.queueList}
            />
          </AnimatePresence>
        ) : (
          <ModernCard>
            <Text style={{ color: '#C4B5FD', textAlign: 'center' }}>
              Queue is empty
            </Text>
          </ModernCard>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  primaryLightText: {
    color: '#F3F4F6', // Replace with your primary-light color
  },
  textLg: {
    fontSize: 18, // Adjust as needed for 'lg'
  },
  fontSemibold: {
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  queueList: {
    gap: 16,
  },
  queueItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  completeButtonPressed: {
    opacity: 0.8,
  },
});