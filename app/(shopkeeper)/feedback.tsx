import { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { collection, query, where, orderBy, getDocs, getDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Feedback, UserProfile } from "@/types/firebaseModels";
import ModernCard from "@/components/ModernCard";

interface FeedbackDisplay extends Feedback {
  customerName: string;
}

export default function FeedbackScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<FeedbackDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        if (!user?.shop_id) {
          setLoading(false);
          return;
        }
        
        // Fetch feedbacks for this shop
        const feedbacksQuery = query(
          collection(db, "feedback"),
          where("shop_id", "==", user.shop_id),
          orderBy("submitted_at", "desc")
        );
        
        const feedbacksSnapshot = await getDocs(feedbacksQuery);
        const feedbacksPromises = feedbacksSnapshot.docs.map(async (docSnapshot) => {
          const feedbackData = { id: docSnapshot.id, ...docSnapshot.data() } as Feedback;
          
          // Fetch customer details
          const customerDoc = await getDoc(doc(db, "users", feedbackData.customer_id));
          let customerName = "Anonymous Customer";
          
          if (customerDoc.exists()) {
            const customerData = customerDoc.data() as UserProfile;
            customerName = `${customerData.first_name} ${customerData.last_name}`;
          }
          
          return {
            ...feedbackData,
            customerName,
          };
        });
        
        const feedbacksData = await Promise.all(feedbacksPromises);
        setFeedbacks(feedbacksData);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [user?.shop_id]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          style={{
            fontSize: 18,
            color: i <= rating ? "#38BDF8" : "#52525B", // text-accent-secondary : dark-border
          }}
        >
          ★
        </Text>
      );
    }
    return (
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        {stars}
      </View>
    );
  };

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
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
          Customer Feedback
        </Text>
      </MotiView>

      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push(`/feedback/${item.id}`)}
            style={({ pressed }) => ({ marginBottom: 16 })}
          >
            {({ pressed }) => (
              <ModernCard pressed={pressed} delay={index * 100}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#F3F4F6", // text-primary-light
                    marginBottom: 8,
                  }}
                >
                  {item.customerName}
                </Text>
                {renderStars(item.rating)}
                {item.comment && (
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#A1A1AA", // text-secondary-light
                      marginBottom: 8,
                    }}
                    numberOfLines={2}
                  >
                    "{item.comment}"
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 14,
                    color: "#A1A1AA", // text-secondary-light
                  }}
                >
                  {formatDate(item.submitted_at)}
                </Text>
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
              No feedback received yet.
            </Text>
          </ModernCard>
        }
      />
    </View>
  );
}