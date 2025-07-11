import { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { collection, query, where, orderBy, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Booking, UserProfile, Service, Shop } from "@/types/firebaseModels";
import ModernCard from "@/components/ModernCard";

interface BookingDisplay extends Booking {
  customerName: string;
  services: string[];
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopAndBookings = async () => {
      try {
        if (!user?.id || !user?.shop_id) {
          setLoading(false);
          return;
        }
        
        // Fetch shop details
        const shopDoc = await getDoc(doc(db, "shops", user.shop_id));
        
        if (shopDoc.exists()) {
          setShop({ id: shopDoc.id, ...shopDoc.data() } as Shop);
          
          // Fetch bookings for this shop
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("shop_id", "==", user.shop_id),
            orderBy("booking_date"),
            orderBy("slot_time")
          );
          
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const bookingsPromises = bookingsSnapshot.docs.map(async (docSnapshot) => {
            const bookingData = { id: docSnapshot.id, ...docSnapshot.data() } as Booking;
            
            // Fetch customer details
            const customerDoc = await getDoc(doc(db, "users", bookingData.customer_id));
            let customerName = "Unknown Customer";
            
            if (customerDoc.exists()) {
              const customerData = customerDoc.data() as UserProfile;
              customerName = `${customerData.first_name} ${customerData.last_name}`;
            }
            
            // Fetch service details
            const servicePromises = bookingData.service_ids.map(serviceId => 
              getDoc(doc(db, "services", serviceId))
            );
            
            const serviceSnapshots = await Promise.all(servicePromises);
            const services = serviceSnapshots
              .filter(docSnapshot => docSnapshot.exists())
              .map(docSnapshot => (docSnapshot.data() as Service).name);
            
            return {
              ...bookingData,
              customerName,
              services,
            };
          });
          
          const bookingsData = await Promise.all(bookingsPromises);
          setBookings(bookingsData);
        }
      } catch (error) {
        console.error("Error fetching shop and bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopAndBookings();
  }, [user?.id, user?.shop_id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F97316"; // text-status-pending
      case "confirmed":
        return "#3B82F6"; // text-status-confirmed
      case "completed":
        return "#10B981"; // text-status-completed
      case "cancelled":
        return "#EF4444"; // text-status-cancelled
      default:
        return "#A1A1AA"; // text-secondary-light
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "pending":
        return "rgba(249, 115, 22, 0.2)"; // bg-status-pending with opacity
      case "confirmed":
        return "rgba(59, 130, 246, 0.2)"; // bg-status-confirmed with opacity
      case "completed":
        return "rgba(16, 185, 129, 0.2)"; // bg-status-completed with opacity
      case "cancelled":
        return "rgba(239, 68, 68, 0.2)"; // bg-status-cancelled with opacity
      default:
        return "rgba(161, 161, 170, 0.2)"; // bg-secondary-light with opacity
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <ModernCard>
          <Text style={{ fontSize: 18, color: "#F3F4F6", textAlign: "center" }}>
            Shop information not found. Please contact support.
          </Text>
        </ModernCard>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 8,
          }}
        >
          My Shop Dashboard
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: "#A1A1AA", // text-secondary-light
            marginBottom: 24,
          }}
        >
          Welcome, {user?.first_name}
        </Text>
      </MotiView>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/dashboard/booking/${item.id}`)}
            style={({ pressed }) => ({ marginBottom: 16 })}
          >
            {({ pressed }) => (
              <ModernCard pressed={pressed} delay={index * 100}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#F3F4F6", // text-primary-light
                    }}
                  >
                    {item.customerName}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: getStatusBgColor(item.status),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: getStatusColor(item.status),
                      }}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#A1A1AA", // text-secondary-light
                    marginBottom: 8,
                  }}
                >
                  {item.services.join(", ")}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#A1A1AA", // text-secondary-light
                    }}
                  >
                    {item.booking_date} at {item.slot_time}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: "#10B981", // text-status-completed
                    }}
                  >
                    ${item.total_price.toFixed(2)}
                  </Text>
                </View>
              </ModernCard>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <ModernCard>
            <Text
              style={{
                fontSize: 18,
                color: "#F3F4F6", // text-primary-light
                textAlign: "center",
              }}
            >
              No bookings yet.
            </Text>
          </ModernCard>
        }
      />
    </View>
  );
}