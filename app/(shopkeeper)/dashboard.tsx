import { router, Stack } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import ModernCard from '@/src/components/ModernCard';
import { auth, db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/authStore';
import { Booking, Shop, UserProfile } from '@/src/types/firebaseModels';

interface BookingWithDetails extends Booking {
  customerName: string;
  serviceNames: string[];
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoutPressed, setLogoutPressed] = useState(false);

  useEffect(() => {
    const fetchShopAndBookings = async () => {
      try {
        if (!user) return;
        
        // Check if user has a shop
        if (!user.shop_id) {
          // Create a shop for this shopkeeper
          // This would typically be a separate onboarding flow
          console.log('Shopkeeper has no shop yet');
          setLoading(false);
          return;
        }
        
        // Fetch shop details
        const shopDoc = await getDoc(doc(db, 'shops', user.shop_id));
        if (shopDoc.exists()) {
          const shopData = { id: shopDoc.id, ...shopDoc.data() } as Shop;
          setShop(shopData);
          
          // Update header title
          const shopName = shopData.name;
          
          // Fetch bookings for this shop
          const bookingsQuery = query(
            collection(db, 'bookings'),
            where('shop_id', '==', user.shop_id)
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const bookingsData = bookingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Booking[];
          
          // Get customer names and service details for each booking
          const bookingsWithDetails = await Promise.all(
            bookingsData.map(async (booking) => {
              // Get customer name
              let customerName = 'Customer';
              try {
                const customerDoc = await getDoc(doc(db, 'users', booking.customer_id));
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
                const servicePromises = booking.service_ids.map(serviceId => 
                  getDoc(doc(db, 'services', serviceId))
                );
                const serviceResults = await Promise.all(servicePromises);
                serviceNames = serviceResults
                  .filter(doc => doc.exists())
                  .map(doc => doc.data().name as string);
              } catch (error) {
                console.error('Error fetching services:', error);
              }
              
              return {
                ...booking,
                customerName,
                serviceNames
              };
            })
          );
          
          // Sort bookings by date and time
          const sortedBookings = bookingsWithDetails.sort((a, b) => {
            const dateA = new Date(`${a.booking_date}T${a.slot_time}`);
            const dateB = new Date(`${b.booking_date}T${b.slot_time}`);
            return dateA.getTime() - dateB.getTime();
          });
          
          setBookings(sortedBookings);
        }
      } catch (error) {
        console.error('Error fetching shop and bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopAndBookings();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Auth state change listener in _layout will handle redirection
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-status-pending';
      case 'confirmed': return 'bg-status-confirmed';
      case 'completed': return 'bg-status-completed';
      case 'cancelled': return 'bg-status-cancelled';
      default: return 'bg-secondary-light';
    }
  };

  const renderBookingItem = ({ item, index }: { item: BookingWithDetails, index: number }) => (
    <Pressable
      onPress={() => router.push(`/dashboard/booking/${item.id}`)}
      style={({ pressed }) => [
        pressed && styles.bookingItemPressed
      ]}
    >
      <ModernCard delay={index * 100}>
        <View style={styles.bookingHeader}>
          <Text style={{ color: '#38BDF8', fontSize: 18, fontWeight: '600' }}>{item.customerName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}> {/* Use backgroundColor directly */}
            <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: '600' }}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <View style={styles.bookingDetails}>
          <Text style={{ color: '#A1A1AA' }}>
            {new Date(item.booking_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })} at {item.slot_time}
          </Text>
          <Text style={{ color: '#A1A1AA', marginTop: 8 }}>
            {item.serviceNames.join(', ')}
          </Text>
          <Text style={{ color: '#22C55E', fontWeight: '600', marginTop: 8 }}>
            ${item.total_price.toFixed(2)}
          </Text>
        </View>
      </ModernCard>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Dashboard' }} />
        <ModernCard>
          <Text style={{ color: '#38BDF8', textAlign: 'center', marginBottom: 16 }}>
            You don't have a shop set up yet
          </Text>
          <Pressable
            onPressIn={() => setLogoutPressed(true)}
            onPressOut={() => setLogoutPressed(false)}
            onPress={handleLogout}
            style={({ pressed }) => [
              pressed && styles.logoutButtonPressed
            ]}
          >
            <ModernCard 
              style={{ backgroundColor: '#EF4444', paddingVertical: 12 }}
              pressed={logoutPressed}
            >
              <Text style={{ color: '#F3F4F6', textAlign: 'center' }}>
                Logout
              </Text>
            </ModernCard>
          </Pressable>
        </ModernCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `${shop.name} Dashboard` }} />
      
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
        >
          <View style={styles.actionsContainer}>
            <Pressable
              onPress={() => router.push('/queue')}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed
              ]}
            >
              <ModernCard style={{ backgroundColor: '#0EA5E9', paddingVertical: 16, paddingHorizontal: 8 }}>
                <Text style={{ color: '#F3F4F6', textAlign: 'center', fontWeight: '600' }}>
                  Manage Queue
                </Text>
              </ModernCard>
            </Pressable>
            
            <Pressable
              onPress={() => router.push('/feedback')}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed
              ]}
            >
              <ModernCard style={{ backgroundColor: '#22D3EE', paddingVertical: 16, paddingHorizontal: 8 }}>
                <Text style={{ color: '#F3F4F6', textAlign: 'center', fontWeight: '600' }}>
                  View Feedback
                </Text>
              </ModernCard>
            </Pressable>
          </View>
        </MotiView>
        
        <View style={styles.bookingsContainer}>
          <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', paddingHorizontal: 16, marginBottom: 16 }}>
            Upcoming Bookings
          </Text>
          
          {bookings.length > 0 ? (
            <FlatList
              data={bookings}
              renderItem={renderBookingItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.bookingsList}
            />
          ) : (
            <ModernCard>
              <Text style={{ color: '#38BDF8', textAlign: 'center' }}>
                No bookings available
              </Text>
            </ModernCard>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonPressed: {
    opacity: 0.9,
  },
  bookingsContainer: {
    flex: 1,
  },
  bookingsList: {
    gap: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDetails: {
    marginTop: 12,
  },
  bookingItemPressed: {
    opacity: 0.9,
  },
  logoutButtonPressed: {
    opacity: 0.9,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
});