import { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Booking, Shop, Service } from "@/types/firebaseModels";
import ModernCard from "@/components/ModernCard";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!user?.id) return;
        
        // Get the most recent booking for this user
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("customer_id", "==", user.id),
          orderBy("created_at", "desc"),
          limit(1)
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        if (!bookingsSnapshot.empty) {
          const bookingDoc = bookingsSnapshot.docs[0];
          const bookingData = { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
          setBooking(bookingData);
          
          // Fetch shop details
          const shopDoc = await getDoc(doc(db, "shops", bookingData.shop_id));
          if (shopDoc.exists()) {
            setShop({ id: shopDoc.id, ...shopDoc.data() } as Shop);
          }
          
          // Fetch service details
          const servicesPromises = bookingData.service_ids.map(serviceId => 
            getDoc(doc(db, "services", serviceId))
          );
          
          const servicesSnapshots = await Promise.all(servicesPromises);
          const servicesData = servicesSnapshots
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() } as Service));
          
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!booking || !shop) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <ModernCard>
          <Text style={{ fontSize: 18, color: "#F3F4F6", textAlign: "center" }}>
            Booking information not found
          </Text>
        </ModernCard>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15 }}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#10B981", // bg-status-completed
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 40, color: "#F3F4F6" }}>✓</Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#10B981", // text-status-completed
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Booking Confirmed!
        </Text>
      </MotiView>

      <ModernCard style={{ width: "100%", maxWidth: 400 }}>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#F3F4F6", // text-primary-light
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {shop.name}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 400 }}
        >
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#A1A1AA", // text-secondary-light
                marginBottom: 8,
              }}
            >
              Services Booked:
            </Text>
            {services.map((service) => (
              <View
                key={service.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: "#F3F4F6" }}>{service.name}</Text>
                <Text style={{ color: "#A1A1AA" }}>${service.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 600 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: "#52525B", // border-dark-border
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#F3F4F6", // text-primary-light
              }}
            >
              Total:
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#10B981", // text-status-completed
              }}
            >
              ${booking.total_price.toFixed(2)}
            </Text>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 800 }}
        >
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#A1A1AA", // text-secondary-light
                marginBottom: 8,
              }}
            >
              Date & Time:
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#F3F4F6", // text-primary-light
              }}
            >
              {booking.booking_date} at {booking.slot_time}
            </Text>
          </View>
        </MotiView>

        <Pressable
          onPress={() => router.push("/queue")}
          style={({ pressed }) => ({})}
        >
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.98 : 1 }}
              
              style={{
                backgroundColor: "#8B5CF6", // bg-accent-primary
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#F3F4F6", // text-primary-light
                }}
              >
                View Live Queue
              </Text>
            </MotiView>
          )}
        </Pressable>
      </ModernCard>
    </View>
  );
}
