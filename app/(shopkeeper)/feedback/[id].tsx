import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MotiView } from 'moti';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/src/lib/firebase';
import { Feedback, UserProfile } from '@/src/types/firebaseModels';
import ModernCard from '@/src/components/ModernCard';

export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [customer, setCustomer] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbackDetails = async () => {
      try {
        if (!id) return;
        
        // Fetch feedback details
        const feedbackDoc = await getDoc(doc(db, 'feedback', id));
        if (feedbackDoc.exists()) {
          const feedbackData = { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
          setFeedback(feedbackData);
          
          // Fetch customer details
          const customerDoc = await getDoc(doc(db, 'users', feedbackData.customer_id));
          if (customerDoc.exists()) {
            setCustomer({ id: customerDoc.id, ...customerDoc.data() } as UserProfile);
          }
        } else {
          console.error('Feedback not found');
        }
      } catch (error) {
        console.error('Error fetching feedback details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackDetails();
  }, [id]);

  const formatDate = (timestamp: any) => {
    const date = new Date(timestamp.toMillis());
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!feedback || !customer) {
    return (
      <View style={styles.container}>
        <ModernCard>
          <Text style={{ color: '#38BDF8', textAlign: 'center' }}>Feedback not found</Text>
        </ModernCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Feedback Details' }} />
      
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <ModernCard>
            <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 16 }}>
              Feedback from {customer.first_name} {customer.last_name}
            </Text>
            
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text 
                  key={star} 
                  style={{ fontSize: 24, color: star <= feedback.rating ? '#0EA5E9' : '#A1A1AA' }}
                >
                  ★
                </Text>
              ))}
              <Text style={{ color: '#38BDF8', marginLeft: 8, fontSize: 18 }}>
                {feedback.rating}/5
              </Text>
            </View>
            
            {feedback.comment && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: 'timing', duration: 800, delay: 300 }}
                style={styles.commentContainer}
              >
                <Text style={{ color: '#38BDF8', fontWeight: '600', marginBottom: 8 }}>Comment:</Text>
                <Text style={{ color: '#A1A1AA', fontSize: 18 }}>
                  {feedback.comment}
                </Text>
              </MotiView>
            )}
            
            <Text style={{ color: '#A1A1AA', textAlign: 'right', marginTop: 16 }}>
              Submitted on {formatDate(feedback.submitted_at)}
            </Text>
          </ModernCard>
        </MotiView>
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  commentContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(18, 18, 18, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
});