import { useState, useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { collection, query, where, getDocs, getDoc, doc, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { QueueEntry, UserProfile, Booking, Service } from "@/types/firebaseModels";
import { subscribeToQueueUpdates } from "@/lib/queueRealtime";
import ModernCard from "@/components/ModernCard";

interface QueueItemDisplay extends QueueEntry {
  customerName: string;
  services: string[];
}

export default function QueueScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [shopQueue, setShopQueue] = useState<QueueItemDisplay[]>([]);
  const [myQueuePosition, setMyQueuePosition] = useState<number | null>(null);
  const [queueAhead, setQueueAhead] = useState<number>(0);
  const [myShopId, setMyShopId] = useState<string | null>(null);

  // Fetch the shop ID for the customer's most recent booking
  useEffect(() => {
    const fetchMyShopId = async () => {
      try {
        if (!user?.id) return;
        
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("customer_id", "==", user.id),
          where("status", "in", ["pending", "confirmed"])
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        
        if (!bookingsSnapshot.empty) {
          const bookingData = bookingsSnapshot.docs[0].data();
          setMyShopId(bookingData.shop_id);
        }
      } catch (error) {
        console.error("Error fetching shop ID:", error);
      }
    };

    fetchMyShopId();
  }, [user?.id]);

  // Set up real-time queue updates
  useEffect(() => {
    if (!myShopId) {
      setLoading(false);
      return;
    }

    const fetchAndProcessQueue = async (snapshot: QuerySnapshot<DocumentData>) => {
      try {
        const queueEntries: QueueItemDisplay[] = [];
        let myPosition = null;
        
        // Process each queue entry
        for (const doc of snapshot.docs) {
          const queueData = { id: doc.id, ...doc.data() } as QueueEntry;
          
          // Check if this is the current user's queue entry
          if (queueData.customer_id === user?.id) {
            myPosition = queueData.position;
          }
          
          // Fetch customer details
          const customerDoc = await getDoc(doc(db, "users", queueData.customer_id));
          let customerName = "Unknown";
          
          if (customerDoc.exists()) {
            const customerData = customerDoc.data() as UserProfile;
            customerName = `${customerData.first_name} ${customerData.last_name.charAt(0)}.`;
          }
          
          // Fetch booking and service details
          const bookingDoc = await getDoc(doc(db, "bookings", queueData.booking_id));
          let services: string[] = [];
          
          if (bookingDoc.exists()) {
            const bookingData = bookingDoc.data() as Booking;
            
            // Fetch service names
            const servicePromises = bookingData.service_ids.map(serviceId => 
              getDoc(doc(db, "services", serviceId))
            );
            
            const serviceSnapshots = await Promise.all(servicePromises);
            services = serviceSnapshots
              .filter(doc => doc.exists())
              .map(doc => (doc.data() as Service).name);
          }
          
          queueEntries.push({
            ...queueData,
            customerName,
            services,
          });
        }
        
        // Sort by position
        queueEntries.sort((a, b) => a.position - b.position);
        
        setShopQueue(queueEntries);
        setMyQueuePosition(myPosition);
        
        // Calculate how many people are ahead in the queue
        if (myPosition !== null) {
          const ahead = queueEntries.filter(entry => 
            entry.position < myPosition && entry.status === "waiting"
          ).length;
          setQueueAhead(ahead);
        }
      } catch (error) {
        console.error("Error processing queue data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to real-time updates
    const unsubscribe = subscribeToQueueUpdates(myShopId, fetchAndProcessQueue);
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [myShopId, user?.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!myShopId) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <ModernCard>
          <Text style={{ fontSize: 18, color: "#F3F4F6", textAlign: "center" }}>
            You don't have any active bookings.
          </Text>
        </ModernCard>
      </View>
    );
  }

  if (myQueuePosition === null) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <ModernCard>
          <Text style={{ fontSize: 18, color: "#F3F4F6", textAlign: "center" }}>
            You are not currently in the queue.
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
            marginBottom: 24,
          }}
        >
          Your Live Queue
        </Text>
      </MotiView>

      <ModernCard>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Your position in the queue
        </Text>
        <Text
          style={{
            fontSize: 64,
            fontWeight: "bold",
            color: "#38BDF8", // text-accent-secondary
            textAlign: "center",
          }}
        >
          {myQueuePosition}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#A1A1AA", // text-secondary-light
            textAlign: "center",
            marginTop: 8,
          }}
        >
          {queueAhead === 0 
            ? "You're next!" 
            : `${queueAhead} ${queueAhead === 1 ? "person" : "people"} ahead of you`}
        </Text>
      </ModernCard>

      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#F3F4F6", // text-primary-light
          marginTop: 24,
          marginBottom: 16,
        }}
      >
        People in Queue
      </Text>

      <FlatList
        data={shopQueue}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatePresence>
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -100 }}
              transition={{ type: "timing", duration: 500, delay: index * 100 }}
              style={{ marginBottom: 12 }}
            >
              <ModernCard>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: item.customer_id === user?.id ? "#8B5CF6" : "#52525B",
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#F3F4F6", // text-primary-light
                      }}
                    >
                      {item.position}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#F3F4F6", // text-primary-light
                        marginBottom: 4,
                      }}
                    >
                      {item.customer_id === user?.id ? "You" : item.customerName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#A1A1AA", // text-secondary-light
                      }}
                    >
                      {item.services.join(", ")}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: 
                        item.status === "waiting" 
                          ? "rgba(59, 130, 246, 0.2)" // bg-status-confirmed with opacity
                          : item.status === "completed"
                            ? "rgba(16, 185, 129, 0.2)" // bg-status-completed with opacity
                            : "rgba(239, 68, 68, 0.2)", // bg-status-cancelled with opacity
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: 
                          item.status === "waiting" 
                            ? "#3B82F6" // text-status-confirmed
                            : item.status === "completed"
                              ? "#10B981" // text-status-completed
                              : "#EF4444", // text-status-cancelled
                      }}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </ModernCard>
            </MotiView>
          </AnimatePresence>
        )}
        ListEmptyComponent={
          <ModernCard>
            <Text
              style={{
                fontSize: 16,
                color: "#F3F4F6", // text-primary-light
                textAlign: "center",
              }}
            >
              No one is currently in the queue.
            </Text>
          </ModernCard>
        }
      />
    </View>
  );
}