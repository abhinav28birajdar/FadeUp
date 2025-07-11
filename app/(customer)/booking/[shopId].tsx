import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { collection, query, where, getDocs, addDoc, doc, runTransaction, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Service, Shop } from "@/types/firebaseModels";
import ModernCard from "@/components/ModernCard";

// Available time slots
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function BookingScreen() {
  const { shopId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [commentFocused, setCommentFocused] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Calculate total price
  const totalPrice = services
    .filter(service => selectedServiceIds.includes(service.id))
    .reduce((sum, service) => sum + service.price, 0);

  useEffect(() => {
    const fetchShopAndServices = async () => {
      try {
        // Fetch shop details
        const shopDoc = await getDoc(doc(db, "shops", shopId as string));
        
        if (shopDoc.exists()) {
          setShop({ id: shopDoc.id, ...shopDoc.data() } as Shop);
          
          // Fetch services for this shop
          const servicesQuery = query(
            collection(db, "services"),
            where("shop_id", "==", shopDoc.id)
          );
          
          const servicesSnapshot = await getDocs(servicesQuery);
          const servicesData: Service[] = [];
          
          servicesSnapshot.forEach((doc) => {
            servicesData.push({ id: doc.id, ...doc.data() } as Service);
          });
          
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopAndServices();
    }
  }, [shopId]);

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setBookingDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleConfirmBooking = async () => {
    // Validate inputs
    if (selectedServiceIds.length === 0) {
      Alert.alert("Error", "Please select at least one service");
      return;
    }

    if (!selectedSlot) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    setBookingLoading(true);

    try {
      // Format date as YYYY-MM-DD
      const formattedDate = bookingDate.toISOString().split("T")[0];

      // Create booking in a transaction
      await runTransaction(db, async (transaction) => {
        // Create booking document
        const bookingRef = doc(collection(db, "bookings"));
        
        const bookingData = {
          id: bookingRef.id,
          customer_id: user?.id,
          shop_id: shopId,
          service_ids: selectedServiceIds,
          booking_date: formattedDate,
          slot_time: selectedSlot,
          total_price: totalPrice,
          status: "pending",
          feedback_comment: feedbackComment || null,
          created_at: Timestamp.now(),
        };
        
        transaction.set(bookingRef, bookingData);
        
        // Find the highest position in the queue
        const queueQuery = query(
          collection(db, "queue"),
          where("shop_id", "==", shopId),
          where("status", "==", "waiting")
        );
        
        const queueSnapshot = await getDocs(queueQuery);
        let highestPosition = 0;
        
        queueSnapshot.forEach((doc) => {
          const position = doc.data().position;
          if (position > highestPosition) {
            highestPosition = position;
          }
        });
        
        // Create queue entry
        const queueRef = doc(collection(db, "queue"));
        
        const queueData = {
          id: queueRef.id,
          booking_id: bookingRef.id,
          customer_id: user?.id,
          shop_id: shopId,
          position: highestPosition + 1,
          status: "waiting",
          created_at: Timestamp.now(),
        };
        
        transaction.set(queueRef, queueData);
        
        return { bookingId: bookingRef.id };
      });
      
      Alert.alert("Success", "Booking confirmed successfully!");
      router.replace("/booking/confirmation");
    } catch (error) {
      console.error("Error creating booking:", error);
      Alert.alert("Error", "Failed to create booking. Please try again.");
    } finally {
      setBookingLoading(false);
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
            Shop not found
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
          Book Your Slot
        </Text>
      </MotiView>

      {/* Choose Services */}
      <ModernCard delay={100}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 16,
          }}
        >
          Choose Services
        </Text>

        {services.map((service, index) => (
          <Pressable
            key={service.id}
            onPress={() => toggleServiceSelection(service.id)}
            style={{ marginBottom: index === services.length - 1 ? 0 : 12 }}
          >
            <MotiView
              animate={{ 
                backgroundColor: selectedServiceIds.includes(service.id) 
                  ? "rgba(139, 92, 246, 0.2)" // bg-accent-primary with opacity
                  : "transparent",
                borderColor: selectedServiceIds.includes(service.id)
                  ? "#8B5CF6" // border-accent-primary
                  : "#52525B", // border-dark-border
              }}
              transition={{ type: "timing", duration: 200 }}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#F3F4F6", // text-primary-light
                  }}
                >
                  {service.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#A1A1AA", // text-secondary-light
                  }}
                >
                  {service.duration} minutes
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#10B981", // text-status-completed
                }}
              >
                ${service.price.toFixed(2)}
              </Text>
            </MotiView>
          </Pressable>
        ))}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 16,
            paddingTop: 16,
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
            Total
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#10B981", // text-status-completed
            }}
          >
            ${totalPrice.toFixed(2)}
          </Text>
        </View>
      </ModernCard>

      {/* Select Date & Time */}
      <ModernCard delay={200} style={{ marginTop: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 16,
          }}
        >
          Select Date & Time
        </Text>

        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#52525B", // border-dark-border
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "#F3F4F6", // text-primary-light
            }}
          >
            {formatDate(bookingDate)}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#38BDF8", // text-accent-secondary
            }}
          >
            Change
          </Text>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={bookingDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
            themeVariant="dark"
          />
        )}

        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 12,
          }}
        >
          Available Slots
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginHorizontal: -4,
          }}
        >
          {TIME_SLOTS.map((slot) => (
            <Pressable
              key={slot}
              onPress={() => setSelectedSlot(slot)}
              style={{ width: "33.33%", padding: 4 }}
            >
              <MotiView
                animate={{ 
                  backgroundColor: selectedSlot === slot 
                    ? "#8B5CF6" // bg-accent-primary
                    : "transparent",
                  borderColor: selectedSlot === slot
                    ? "#8B5CF6" // border-accent-primary
                    : "#52525B", // border-dark-border
                }}
                transition={{ type: "timing", duration: 200 }}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    color: selectedSlot === slot
                      ? "#F3F4F6" // text-primary-light
                      : "#A1A1AA", // text-secondary-light
                  }}
                >
                  {slot}
                </Text>
              </MotiView>
            </Pressable>
          ))}
        </View>
      </ModernCard>

      {/* Your Message (Optional) */}
      <ModernCard delay={300} style={{ marginTop: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 16,
          }}
        >
          Your Message (Optional)
        </Text>

        <MotiView
          animate={{ 
            borderColor: commentFocused ? "#38BDF8" : "#52525B" // accent-secondary : dark-border
          }}
          transition={{ type: "timing", duration: 200 }}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            backgroundColor: "rgba(18, 18, 18, 0.5)", // bg-dark-background/50
            padding: 16,
          }}
        >
          <TextInput
            placeholder="Any special requests or notes for your booking..."
            placeholderTextColor="#A1A1AA" // text-secondary-light
            value={feedbackComment}
            onChangeText={setFeedbackComment}
            onFocus={() => setCommentFocused(true)}
            onBlur={() => setCommentFocused(false)}
            multiline
            numberOfLines={4}
            style={{ 
              color: "#F3F4F6", // text-primary-light
              fontSize: 16,
              textAlignVertical: "top",
              height: 100,
            }}
          />
        </MotiView>
      </ModernCard>

      {/* Confirm Booking Button */}
      <View style={{ marginTop: 24, marginBottom: 40 }}>
        <Pressable
          onPress={handleConfirmBooking}
          disabled={bookingLoading}
          style={({ pressed }) => ({})}
        >
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.98 : 1 }}
              transition={{ type: "timing", duration: 150 }}
              style={{
                backgroundColor: "#10B981", // bg-status-completed
                paddingVertical: 20,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
                height: 60,
              }}
            >
              {bookingLoading ? (
                <ActivityIndicator color="#F3F4F6" />
              ) : (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#F3F4F6", // text-primary-light
                  }}
                >
                  Confirm Booking
                </Text>
              )}
            </MotiView>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}