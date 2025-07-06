import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import { collection, query, where, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore';

import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/authStore';
import { QueueEntry, Booking, UserProfile } from '@/src/types/firebaseModels';
import ModernCard from '@/src/components/ModernCard';
import { subscribeToQueueUpdates } from '@/src/lib/queueRealtime';

interface QueueItem extends QueueEntry {
  customerName: string;
  serviceNames: string[];
}

export default function QueueScreen() {
  const { user } = useAuthStore();
  const [myQueueEntry, setMyQueueEntry] = useState<QueueItem | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [myShopId, setMyShopId] = useState<string | null>(null);

  // Find the shop ID from the customer's latest booking
  useEffect(() => {
    const findMyShopId = async () => {
      if (!user) return;
      
      try {
        // Get the latest booking for this customer
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('customer_id', '==', user.id),
          where('status', 'in', ['pending', 'confirmed'])
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        if (!bookingsSnapshot.empty) {
          // Sort by created_at to get the latest
          const bookings = bookingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Booking[];
          
          const latestBooking = bookings.sort((a, b) => 
            b.created_at.toMillis() - a.created_at.toMillis()
          )[0];
          
          setMyShopId(latestBooking.shop_id);
        } else {
          console.log('No active bookings found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error finding shop ID:', error);
        setLoading(false);
      }
    };

    findMyShopId();
  }, [user]);

  // Subscribe to queue updates when we have a shop ID
  useEffect(() => {
    if (!myShopId || !user) return;
    
    const unsubscribe = subscribeToQueueUpdates(myShopId, (snapshot) => {
      fetchAndProcessQueue(snapshot);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [myShopId, user]);

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
            const customerDoc = await getDocs(
              query(collection(db, 'users'), where('id', '==', entry.customer_id))
            );
            if (!customerDoc.empty) {
              const customerData = customerDoc.docs[0].data() as UserProfile;
              customerName = `${customerData.first_name} ${customerData.last_name.charAt(0)}.`;
            }
          } catch (error) {
            console.error('Error fetching customer:', error);
          }
          
          // Get service names
          let serviceNames: string[] = [];
          try {
            const bookingDoc = await getDocs(
              query(collection(db, 'bookings'), where('id', '==', entry.booking_id))
            );
            if (!bookingDoc.empty) {
              const bookingData = bookingDoc.docs[0].data() as Booking;
              
              // Get service names
              const servicePromises = bookingData.service_ids.map(async (serviceId) => {
                const serviceQuery = query(collection(db, 'services'), where('id', '==', serviceId));
                const serviceDoc = await getDocs(serviceQuery);
                return serviceDoc.empty ? 'Service' : serviceDoc.docs[0].data().name;
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
      
      // Find my queue entry
      const myEntry = queueWithDetails.find(entry => entry.customer_id === user?.id) || null;
      setMyQueueEntry(myEntry);
      
      // Set all queue entries
      setQueueItems(queueWithDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error processing queue data:', error);
      setLoading(false);
    }
  };

  // Get customers ahead of me
  const getCustomersAhead = () => {
    if (!myQueueEntry) return [];
    
    return queueItems.filter(item => 
      item.position < myQueueEntry.position && 
      item.status === 'waiting'
    );
  };

  const customersAhead = getCustomersAhead();

  const renderQueueItem = ({ item, index }: { item: QueueItem, index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: 20 }}
      transition={{ type: 'timing', duration: 300, delay: index * 100 }}
    >
      <ModernCard delay={index * 100}>
        <View style={styles.queueItemContent}>
          <View>
            <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600' }}>{item.customerName}</Text>
            <Text style={{ color: '#A1A1AA', marginTop: 4 }}>{item.serviceNames.join(', ')}</Text>
          </View>
          <View style={styles.positionBadge}>
            <Text style={{ color: '#0EA5E9', fontWeight: 'bold' }}>{item.position}</Text>
          </View>
        </View>
      </ModernCard>
    </MotiView>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ModernCard>
          <Text style={{ color: '#38BDF8', textAlign: 'center' }}>Loading queue information...</Text>
        </ModernCard>
      </View>
    );
  }

  if (!myQueueEntry) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Live Queue' }} />
        <ModernCard>
          <Text style={{ color: '#38BDF8', textAlign: 'center' }}>
            You are not currently in any queue
          </Text>
        </ModernCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Live Queue' }} />
      
      <View style={styles.content}>
        {/* My Position */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <ModernCard>
            <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>Your Position</Text>
            <View style={styles.myPositionContainer}>
              <Text style={{ color: '#38BDF8', fontSize: 18 }}>Current position:</Text>
              <Text style={{ color: '#0EA5E9', fontSize: 28, fontWeight: 'bold' }}>{myQueueEntry.position}</Text>
            </View>
            <Text style={{ color: '#A1A1AA', marginTop: 16 }}>
              {myQueueEntry.position === 1 
                ? "You're next! Please be ready." 
                : `There ${customersAhead.length === 1 ? 'is' : 'are'} ${customersAhead.length} customer${customersAhead.length === 1 ? '' : 's'} ahead of you.`
              }
            </Text>
          </ModernCard>
        </MotiView>
        
        {/* Customers Ahead */}
        {customersAhead.length > 0 && (
          <View style={styles.aheadContainer}>
            <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', paddingHorizontal: 16, marginBottom: 16 }}>Customers Ahead</Text>
            
            <AnimatePresence>
              <FlatList
                data={customersAhead}
                renderItem={renderQueueItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.queueList}
              />
            </AnimatePresence>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  myPositionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aheadContainer: {
    flex: 1,
  },
  queueList: {
    gap: 12,
  },
  queueItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});