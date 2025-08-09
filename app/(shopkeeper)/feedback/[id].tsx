import { useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { ModernCard } from "../../../src/components/ModernCard";
import { supabase } from "../../../src/lib/supabase";
import { UserProfile } from "../../../src/types/supabase";

interface Feedback {
  id: string;
  booking_id: string;
  customer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbackDetails = async () => {
      try {
        // Fetch feedback details
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('feedback')
          .select('*')
          .eq('id', id)
          .single();

        if (feedbackError) throw feedbackError;
        
        if (feedbackData) {
          setFeedback(feedbackData);
          
          // Fetch customer details
          const { data: customerData } = await supabase
            .from('users')
            .select('*')
            .eq('id', feedbackData.customer_id)
            .single();

          if (customerData) {
            setCustomer(customerData);
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
            color: i <= rating ? "#CB9C5E" : "#52525B", // brand-primary : dark-border
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
        <ActivityIndicator size="large" color="#CB9C5E" />
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
        transition={{ delay: 0 }}
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
          transition={{ delay: 800 }}
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
          Submitted on {formatDate(feedback.created_at)}
        </Text>
      </ModernCard>
    </ScrollView>
  );
}