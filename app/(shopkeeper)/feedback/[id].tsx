import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Feedback, UserProfile } from "@/types/firebaseModels";
import ModernCard from "@/components/ModernCard";

export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbackDetails = async () => {
      try {
        // Fetch feedback details
        const feedbackDoc = await getDoc(doc(db, "feedback", id as string));
        
        if (feedbackDoc.exists()) {
          const feedbackData = { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
          setFeedback(feedbackData);
          
          // Fetch customer details
          const customerDoc = await getDoc(doc(db, "users", feedbackData.customer_id));
          if (customerDoc.exists()) {
            setCustomer({ id: customerDoc.id, ...customerDoc.data() } as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching feedback details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFeedbackDetails();
    }
  }, [id]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          style={{
            fontSize: 24,
            color: i <= rating ? "#38BDF8" : "#52525B", // text-accent-secondary : dark-border
          }}
        >
          ★
        </Text>
      );
    }
    return (
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!feedback) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <ModernCard>
          <Text style={{ fontSize: 18, color: "#F3F4F6", textAlign: "center" }}>
            Feedback not found
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
          Feedback Details
        </Text>
      </MotiView>

      <ModernCard>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 16,
          }}
        >
          {customer ? `${customer.first_name} ${customer.last_name}` : "Anonymous Customer"}
        </Text>
        
        {renderStars(feedback.rating)}
        
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 800 }}
          style={{ marginBottom: 16 }}
        >
          {feedback.comment ? (
            <Text
              style={{
                fontSize: 18,
                color: "#A1A1AA", // text-secondary-light
                lineHeight: 28,
                fontStyle: "italic",
              }}
            >
              "{feedback.comment}"
            </Text>
          ) : (
            <Text
              style={{
                fontSize: 16,
                color: "#A1A1AA", // text-secondary-light
                fontStyle: "italic",
              }}
            >
              No comment provided.
            </Text>
          )}
        </MotiView>
        
        <Text
          style={{
            fontSize: 14,
            color: "#A1A1AA", // text-secondary-light
          }}
        >
          Submitted on {formatDate(feedback.submitted_at)}
        </Text>
      </ModernCard>
    </ScrollView>
  );
}