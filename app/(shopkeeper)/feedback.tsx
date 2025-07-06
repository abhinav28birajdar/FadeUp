import { router, Stack } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import ModernCard from '@/src/components/ModernCard';
import { db } from '@/src/lib/firebase';
import { useAuthStore } from '@/src/store/authStore';
import { Feedback, UserProfile } from '@/src/types/firebaseModels';

interface FeedbackWithDetails extends Feedback {
  customerName: string;
}

export default function FeedbackScreen() {
  const { user } = useAuthStore();
  const [feedbackItems, setFeedbackItems] = useState<FeedbackWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        if (!user?.shop_id) {
          setLoading(false);
          return;
        }
        
        // Fetch feedback for this shop
        const feedbackQuery = query(
          collection(db, 'feedback'),
          where('shop_id', '==', user.shop_id)
        );
        const feedbackSnapshot = await getDocs(feedbackQuery);
        const feedbackData = feedbackSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Feedback[];
        
        // Get customer names for each feedback
        const feedbackWithDetails = await Promise.all(
          feedbackData.map(async (feedback) => {
            // Get customer name
            let customerName = 'Customer';
            try {
              const customerDoc = await getDoc(doc(db, 'users', feedback.customer_id));
              if (customerDoc.exists()) {
                const customerData = customerDoc.data() as UserProfile;
                customerName = `${customerData.first_name} ${customerData.last_name}`;
              }
            } catch (error) {
              console.error('Error fetching customer:', error);
            }
            
            return {
              ...feedback,
              customerName
            };
          })
        );
        
        // Sort by submission date (newest first)
        const sortedFeedback = feedbackWithDetails.sort((a, b) => 
          b.submitted_at.toMillis() - a.submitted_at.toMillis()
        );
        
        setFeedbackItems(sortedFeedback);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [user]);

  const formatDate = (timestamp: any) => {
    const date = new Date(timestamp.toMillis());
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderFeedbackItem = ({ item, index }: { item: FeedbackWithDetails, index: number }) => (
    <Pressable
      onPress={() => router.push(`/feedback/${item.id}`)}
      style={({ pressed }) => [
        pressed && styles.feedbackItemPressed
      ]}
    >
      <ModernCard delay={index * 100}>
        <View style={styles.feedbackHeader}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text 
                key={star} 
                style={[
                  styles.star,
                  star <= item.rating ? styles.starActive : styles.starInactive
                ]}
              >
                ★
              </Text>
            ))}
          </View>
        </View>
        
        {item.comment && (
          <Text style={styles.comment} numberOfLines={2}>
            {item.comment}
          </Text>
        )}
        
        <Text style={styles.date}>
          {formatDate(item.submitted_at)}
        </Text>
      </ModernCard>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Customer Feedback' }} />
      
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
        >
          <Text style={styles.title}>
            All Feedback
          </Text>
        </MotiView>
        
        {feedbackItems.length > 0 ? (
          <FlatList
            data={feedbackItems}
            renderItem={renderFeedbackItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedbackList}
          />
        ) : (
          <ModernCard>
            <Text style={styles.noFeedbackText}>
              No feedback available
            </Text>
          </ModernCard>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  feedbackList: {
    gap: 16,
    paddingBottom: 24,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackItemPressed: {
    opacity: 0.9,
  },
  customerName: {
    color: '#C4B5FD', // text-primary-light
    fontSize: 18,
    fontWeight: '600',
  },
  star: {
    fontSize: 18,
    marginHorizontal: 1,
  },
  starActive: {
    color: '#F59E42', // text-accent-secondary
  },
  starInactive: {
    color: '#A1A1AA', // text-secondary-light
  },
  comment: {
    color: '#A1A1AA', // text-secondary-light
    marginTop: 8,
  },
  date: {
    color: '#A1A1AA', // text-secondary-light
    textAlign: 'right',
    marginTop: 8,
    fontSize: 13,
  },
  title: {
    color: '#C4B5FD', // text-primary-light
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  noFeedbackText: {
    color: '#C4B5FD', // text-primary-light
    textAlign: 'center',
  },
});