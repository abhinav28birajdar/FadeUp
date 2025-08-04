import { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, Alert, ActivityIndicator } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { doc, getDoc, writeBatch, collection, query, where, getDocs, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { QueueEntry, UserProfile, Booking, Service, Shop } from "@/types/firebaseModels";
import { subscribeToQueueUpdates } from "@/lib/queueRealtime";
import ModernCard from "@/components/ModernCard";

interface QueueItemDisplay extends QueueEntry {
  customerName: string;
  services: string[];
}

export default function ShopkeeperQueueScreen() {
  const { user } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopQueue, setShopQueue] = useState<QueueItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch shop details
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        if (!user?.shop_id) {
          setLoading(false);
          return;
        }
        
        const shopDoc = await getDoc(doc(db, "shops", user.shop_id));
        
        if (shopDoc.exists()) {
          setShop({ id: shopDoc.id, ...shopDoc.data() } as Shop);
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
      }
    };

    fetchShopDetails();
  }, [user?.shop_id]);

  // Set up real-time queue updates
  useEffect(() => {
    if (!user?.shop_id) {
      setLoading(false);
      return;
    }

    const fetchAndProcessQueue = async (snapshot: QuerySnapshot<DocumentData>) => {
      try {
        const queueEntries: QueueItemDisplay[] = [];
        
        // Process each queue entry
        for (const doc of snapshot.docs) {
          const queueData = { id: doc.id, ...doc.data() } as QueueEntry;
          
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
      } catch (error) {
        console.error("Error processing queue data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to real-time updates
    const unsubscribe = subscribeToQueueUpdates(user.shop_id, fetchAndProcessQueue);
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [user?.shop_id]);

  const handleMarkAsCompleted = async (queueEntry: QueueItemDisplay) => {
    Alert.alert(
      "Confirm Completion",
      `Are you sure you want to mark ${queueEntry.customerName}'s booking as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
            setActionLoading(queueEntry.id);
            
            try {
              // Use a batch to update both booking and queue entry
              const batch = writeBatch(db);
              
              // Update booking status
              const bookingRef = doc(db, "bookings", queueEntry.booking_id);
              batch.update(bookingRef, { status: "completed" });
              
              // Update queue entry status
              const queueRef = doc(db, "queue", queueEntry.id);
              batch.update(queueRef, { status: "completed" });
              
              // Commit the batch
              await batch.commit();
              
              // The real-time listener will update the UI automatically
            } catch (error) {
              console.error("Error updating queue entry:", error);
              Alert.alert("Error", "Failed to update queue entry. Please try again.");
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
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
        
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 8,
          }}
        >
          Live Queue
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: "#A1A1AA", // text-secondary-light
            marginBottom: 24,
          }}
        >
          {shop.name}
        </Text>
      </MotiView>

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
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#8B5CF6", // bg-accent-primary
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
                    <View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#F3F4F6", // text-primary-light
                          marginBottom: 4,
                        }}
                      >
                        {item.customerName}
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
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      backgroundColor: "rgba(59, 130, 246, 0.2)", // bg-status-confirmed with opacity
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "#3B82F6", // text-status-confirmed
                      }}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                {item.status === "waiting" && (
                  <Pressable
                    onPress={() => handleMarkAsCompleted(item)}
                    disabled={actionLoading === item.id}
                    style={({ pressed }) => ({ marginTop: 8 })}
                  >
                    {({ pressed }) => (
                      <MotiView
                        animate={{ scale: pressed ? 0.98 : 1 }}
                        
                        style={{
                          backgroundColor: "#10B981", // bg-status-completed
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {actionLoading === item.id ? (
                          <ActivityIndicator size="small" color="#F3F4F6" />
                        ) : (
                          <Text
                            style={{
                              fontSize: 14,
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
                )}
              </ModernCard>
            </MotiView>
          </AnimatePresence>
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
              No customers currently in the queue.
            </Text>
          </ModernCard>
        }
      />
    </View>
  );
}
