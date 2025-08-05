import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";

interface FeedbackDisplay {
  id: string;
  customer_id: string;
  shop_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer_name: string;
}

export default function FeedbackScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState<FeedbackDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }

        // First get the shop owned by this user
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (shopError || !shopData) {
          console.error('Error fetching shop:', shopError);
          setLoading(false);
          return;
        }
        
        // Fetch reviews for this shop with customer details
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            users:customer_id(full_name)
          `)
          .eq('shop_id', shopData.id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else if (reviewsData) {
          const formattedFeedbacks = reviewsData.map(review => ({
            id: review.id,
            customer_id: review.customer_id,
            shop_id: review.shop_id,
            booking_id: review.booking_id,
            rating: review.rating,
            comment: review.comment || '',
            created_at: review.created_at,
            customer_name: review.users?.full_name || 'Anonymous Customer',
          }));

          setFeedbacks(formattedFeedbacks);
        }
      } catch (error) {
        console.error('Error in fetchFeedbacks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [user?.id]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} className={`text-lg ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>
          ⭐
        </Text>
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFeedbackItem = ({ item, index }: { item: FeedbackDisplay; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 300,
      }}
      className="bg-white rounded-2xl p-4 mx-4 mb-3 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{item.customer_name}</Text>
          <View className="flex-row items-center mt-1">
            {renderStars(item.rating)}
            <Text className="ml-2 text-sm text-gray-600">({item.rating}/5)</Text>
          </View>
        </View>
        <Text className="text-xs text-gray-500">{formatDate(item.created_at)}</Text>
      </View>

      {item.comment && (
        <View className="bg-gray-50 p-3 rounded-lg mb-3">
          <Text className="text-gray-700">{item.comment}</Text>
        </View>
      )}

      <Pressable
        className="bg-[#CB9C5E] py-2 px-4 rounded-lg self-start"
        onPress={() => router.push(`/(shopkeeper)/feedback/${item.id}`)}
      >
        <Text className="text-white font-medium">View Details</Text>
      </Pressable>
    </MotiView>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#CB9C5E" />
        <Text className="mt-4 text-gray-600">Loading feedback...</Text>
      </View>
    );
  }

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          duration: 300,
        }}
        className="bg-[#CB9C5E] pt-12 pb-6 px-6"
      >
        <Text className="text-2xl font-bold text-white mb-1">Customer Feedback</Text>
        <Text className="text-white/90">Reviews and ratings from your customers</Text>
      </MotiView>

      {/* Stats */}
      <View className="flex-row px-4 -mt-4 mb-6">
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 300,
          }}
          className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm"
        >
          <Text className="text-2xl font-bold text-[#CB9C5E]">{averageRating}</Text>
          <Text className="text-gray-600">Average Rating</Text>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 300,
          }}
          className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm"
        >
          <Text className="text-2xl font-bold text-[#CB9C5E]">{feedbacks.length}</Text>
          <Text className="text-gray-600">Total Reviews</Text>
        </MotiView>
      </View>

      {/* Feedback List */}
      {feedbacks.length > 0 ? (
        <FlatList
          data={feedbacks}
          renderItem={renderFeedbackItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</Text>
          <Text className="text-gray-600 text-center">
            When customers leave reviews for your services, they'll appear here.
          </Text>
        </View>
      )}
    </View>
  );
}
