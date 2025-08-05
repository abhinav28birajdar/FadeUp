import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

interface BookingDetail {
  id: string;
  customer_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_price: number;
  notes?: string;
  customer_name: string;
  customer_phone?: string;
  service_name: string;
  service_duration: number;
  created_at: string;
}

export default function BookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!id || !user?.id) {
          setLoading(false);
          return;
        }

        // Fetch booking with customer and service details
        const { data: bookingData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            users:customer_id(full_name, phone),
            services:service_id(name, duration),
            shops:shop_id(owner_id)
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching booking:', error);
          Alert.alert('Error', 'Failed to load booking details');
          router.back();
          return;
        }

        // Check if user owns the shop
        if (bookingData.shops?.owner_id !== user.id) {
          Alert.alert('Error', 'You do not have permission to view this booking');
          router.back();
          return;
        }

        if (bookingData) {
          setBooking({
            id: bookingData.id,
            customer_id: bookingData.customer_id,
            service_id: bookingData.service_id,
            booking_date: bookingData.booking_date,
            booking_time: bookingData.booking_time,
            status: bookingData.status,
            total_price: bookingData.total_price,
            notes: bookingData.notes,
            customer_name: bookingData.users?.full_name || 'Unknown Customer',
            customer_phone: bookingData.users?.phone,
            service_name: bookingData.services?.name || 'Unknown Service',
            service_duration: bookingData.services?.duration || 0,
            created_at: bookingData.created_at,
          });
        }
      } catch (error) {
        console.error('Error in fetchBookingDetails:', error);
        Alert.alert('Error', 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookingDetails();
    }
  }, [id]);

  const handleMarkAsCompleted = async () => {
    Alert.alert(
      "Confirm Completion",
      "Are you sure you want to mark this booking as completed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            setActionLoading(true);
            
            try {
              // Use a batch to update both booking and queue entry
              const batch = writeBatch(db);
              
              // Update booking status
              const bookingRef = doc(db, "bookings", id as string);
              batch.update(bookingRef, { status: "completed" });
              
              // Find and update the corresponding queue entry
              const queueQuery = query(
                collection(db, "queue"),
                where("booking_id", "==", id)
              );
              
              const queueSnapshot = await getDocs(queueQuery);
              
              if (!queueSnapshot.empty) {
                const queueDoc = queueSnapshot.docs[0];
                batch.update(doc(db, "queue", queueDoc.id), { status: "completed" });
              }
              
              // Commit the batch
              await batch.commit();
              
              // Refresh booking data
              const updatedBookingDoc = await getDoc(bookingRef);
              if (updatedBookingDoc.exists()) {
                setBooking({ id: updatedBookingDoc.id, ...updatedBookingDoc.data() } as Booking);
              }
              
              Alert.alert("Success", "Booking marked as completed successfully!");
            } catch (error) {
              console.error("Error updating booking status:", error);
              Alert.alert("Error", "Failed to update booking status. Please try again.");
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

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

  if (!booking || !customer) {
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
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
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
            marginBottom: 24,
          }}
        >
          Booking Details
        </Text>
      </MotiView>

      {/* Customer Info */}
      <ModernCard delay={100}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 16,
          }}
        >
          Customer Information
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 4,
          }}
        >
          {customer.first_name} {customer.last_name}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#A1A1AA", // text-secondary-light
          }}
        >
          {customer.email}
        </Text>
      </ModernCard>

      {/* Service Details */}
      <ModernCard delay={200} style={{ marginTop: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 16,
          }}
        >
          Service Details
        </Text>
        {services.map((service) => (
          <View
            key={service.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#F3F4F6", flex: 1 }}>{service.name}</Text>
            <Text style={{ color: "#A1A1AA" }}>${service.price.toFixed(2)}</Text>
          </View>
        ))}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 8,
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
              fontSize: 18,
              fontWeight: "bold",
              color: "#10B981", // text-status-completed
            }}
          >
            ${booking.total_price.toFixed(2)}
          </Text>
        </View>
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#F3F4F6", // text-primary-light
              marginBottom: 4,
            }}
          >
            Date:
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#A1A1AA", // text-secondary-light
              marginBottom: 8,
            }}
          >
            {booking.booking_date}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: "#F3F4F6", // text-primary-light
              marginBottom: 4,
            }}
          >
            Time:
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#A1A1AA", // text-secondary-light
            }}
          >
            {booking.slot_time}
          </Text>
        </View>
      </ModernCard>

      {/* Customer Feedback */}
      {booking.feedback_comment && (
        <ModernCard delay={300} style={{ marginTop: 16 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#F3F4F6", // text-primary-light
              marginBottom: 16,
            }}
          >
            Customer Message
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontStyle: "italic",
              color: "#A1A1AA", // text-secondary-light
            }}
          >
            "{booking.feedback_comment}"
          </Text>
        </ModernCard>
      )}

      {/* Current Status */}
      <ModernCard delay={400} style={{ marginTop: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 16,
          }}
        >
          Current Status
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MotiView
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ type: "timing", duration: 1000, loop: true }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: getStatusBgColor(booking.status),
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: getStatusColor(booking.status),
              }}
            >
              {booking.status.toUpperCase()}
            </Text>
          </MotiView>
        </View>
      </ModernCard>

      {/* Action Buttons */}
      {booking.status !== "completed" && booking.status !== "cancelled" && (
        <View style={{ marginTop: 24, marginBottom: 40 }}>
          <Pressable
            onPress={handleMarkAsCompleted}
            disabled={actionLoading}
            style={({ pressed }) => ({})}
          >
            {({ pressed }) => (
              <MotiView
                animate={{ scale: pressed ? 0.98 : 1 }}
                transition={{ type: "timing", duration: 150 }}
                style={{
                  backgroundColor: "#10B981", // bg-status-completed
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                  height: 56,
                }}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#F3F4F6" />
                ) : (
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#F3F4F6", // text-primary-light
                    }}
                  >
                    Mark as Completed
                  </Text>
                )}
              </MotiView>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}