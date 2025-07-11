import { router, Stack } from 'expo-router';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { auth, db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/authStore';
import { Booking, Shop, UserProfile } from '@/src/types/firebaseModels';

// --- Components ---

interface BookingWithDetails extends Booking {
  customerName: string;
  serviceNames: string[];
}

const DashboardHeader = ({ shopName, onLogout }: { shopName: string; onLogout: () => void }) => (
  <View className="p-4 bg-surface">
    <Stack.Screen options={{ title: `${shopName} Dashboard` }} />
    <Pressable onPress={onLogout} className="absolute top-4 right-4 bg-red-500 p-2 rounded-lg">
      <Text className="text-white">Logout</Text>
    </Pressable>
  </View>
);

const ActionCard = ({ title, onPress, delay }: { title: string; onPress: () => void; delay: number }) => (
  <MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'timing', duration: 500, delay }}
    className="flex-1"
  >
    <Pressable onPress={onPress} className="bg-surface rounded-2xl p-6 items-center justify-center mx-2">
      <Text className="text-primary text-lg font-semibold">{title}</Text>
    </Pressable>
  </MotiView>
);

const BookingCard = ({ item, index }: { item: BookingWithDetails; index: number }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-status-pending';
      case 'confirmed': return 'bg-status-confirmed';
      case 'completed': return 'bg-status-completed';
      case 'cancelled': return 'bg-status-cancelled';
      default: return 'bg-secondary';
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300, delay: index * 100 }}
    >
      <Pressable 
        onPress={() => router.push(`/dashboard/booking/${item.id}`)} 
        className="bg-surface rounded-2xl p-4 mx-4 mb-4"
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-primary text-xl font-bold">{item.customerName}</Text>
          <View className={`px-3 py-1 rounded-full ${getStatusClass(item.status)}`}>
            <Text className="text-background font-bold text-xs">{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text className="text-secondary mb-2">{item.serviceNames.join(', ')}</Text>
        <View className="flex-row justify-between items-center mt-2 border-t border-border pt-3">
          <Text className="text-accent font-semibold">
            {new Date(item.booking_date).toLocaleDateString()} at {item.slot_time}
          </Text>
          <Text className="text-primary text-lg font-bold">${item.total_price.toFixed(2)}</Text>
        </View>
      </Pressable>
    </MotiView>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <View className="flex-1 justify-center items-center p-8">
    <Text className="text-secondary text-lg text-center">{message}</Text>
  </View>
);

// --- Main Screen ---

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopAndBookings = async () => {
      if (!user || !user.shop_id) {
        setLoading(false);
        return;
      }

      try {
        const shopDocRef = doc(db, 'shops', user.shop_id);
        const shopDoc = await getDoc(shopDocRef);

        if (shopDoc.exists()) {
          const shopData = { id: shopDoc.id, ...shopDoc.data() } as Shop;
          setShop(shopData);

          const bookingsQuery = query(collection(db, 'bookings'), where('shop_id', '==', user.shop_id));
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Booking);

          const bookingsWithDetails = await Promise.all(
            bookingsData.map(async (booking) => {
              const customerDoc = await getDoc(doc(db, 'users', booking.customer_id));
              const customerName = customerDoc.exists() ? `${(customerDoc.data() as UserProfile).first_name} ${(customerDoc.data() as UserProfile).last_name}` : 'Customer';
              
              const serviceNames = await Promise.all(
                  booking.service_ids.map(async (serviceId) => {
                      const serviceDoc = await getDoc(doc(db, 'services', serviceId));
                      return serviceDoc.exists() ? serviceDoc.data().name : '';
                  })
              );

              return { ...booking, customerName, serviceNames: serviceNames.filter(name => name) };
            })
          );

          setBookings(bookingsWithDetails.sort((a, b) => new Date(`${a.booking_date}T${a.slot_time}`).getTime() - new Date(`${b.booking_date}T${b.slot_time}`).getTime()));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopAndBookings();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <View className="flex-1 justify-center items-center bg-background"><ActivityIndicator size="large" color="#38BDF8" /></View>;
  }

  if (!shop) {
    return (
        <View className="flex-1 justify-center items-center bg-background p-8">
            <Stack.Screen options={{ title: 'Dashboard' }} />
            <Text className="text-primary text-xl text-center mb-6">No shop is associated with your account.</Text>
            <Pressable onPress={handleLogout} className="bg-accent rounded-lg py-3 px-6">
                <Text className="text-background font-bold">Logout</Text>
            </Pressable>
        </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <DashboardHeader shopName={shop.name} onLogout={handleLogout} />
      
      <View className="flex-row p-2">
        <ActionCard title="Manage Queue" onPress={() => router.push('/queue')} delay={100} />
        <ActionCard title="View Feedback" onPress={() => router.push('/feedback')} delay={200} />
      </View>

      <Text className="text-primary text-2xl font-bold px-4 mt-4 mb-2">Upcoming Bookings</Text>

      {bookings.length > 0 ? (
        <FlatList
          data={bookings}
          renderItem={({ item, index }) => <BookingCard item={item} index={index} />}
          keyExtractor={(item) => item.id}
          contentContainerClassName="pb-4"
        />
      ) : (
        <EmptyState message="You have no upcoming bookings." />
      )}
    </View>
  );
}
