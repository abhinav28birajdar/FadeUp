import { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, Pressable, Image, ActivityIndicator, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Shop } from "@/types/firebaseModels";
import ModernCard from "@/components/ModernCard";

// Hero slider data
const heroSlides = [
  {
    id: "1",
    title: "Premium Haircuts",
    description: "Experience the best barbers in town",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    title: "No Wait Time",
    description: "Book your slot and skip the queue",
    imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "3",
    title: "Expert Stylists",
    description: "Get styled by professionals",
    imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
];

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface ShopRenderItem {
  item: Shop;
  index: number;
}

interface HeroRenderItem {
  item: HeroSlide;
  index: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<FlatList>(null);
  const windowWidth = Dimensions.get("window").width;

  // Fetch shops from Firestore
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsQuery = query(collection(db, "shops"), orderBy("name"));
        const querySnapshot = await getDocs(shopsQuery);
        
        const shopsData: Shop[] = [];
        querySnapshot.forEach((doc) => {
          shopsData.push({ id: doc.id, ...doc.data() } as Shop);
        });
        
        setShops(shopsData);
      } catch (error) {
        console.error("Error fetching shops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  // Auto-scroll hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (activeSlide + 1) % heroSlides.length;
      setActiveSlide(nextSlide);
      sliderRef.current?.scrollToIndex({
        index: nextSlide,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSlide]);

  // Render hero slide
  const renderHeroSlide = ({ item, index }: HeroRenderItem) => (
    <View style={{ width: windowWidth, height: 200 }}>
      <Image
        source={{ uri: item.imageUrl }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          backgroundColor: "rgba(0,0,0,0.5)",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
          key={`title-${item.id}`}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#F3F4F6", // text-primary-light
            }}
          >
            {item.title}
          </Text>
        </MotiView>
        <Text
          style={{
            fontSize: 16,
            color: "#A1A1AA", // text-secondary-light
          }}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  // Render shop item
  const renderShopItem = ({ item, index }: ShopRenderItem) => (
    <Pressable
      onPress={() => router.push(`/shop/${item.id}`)}
      style={({ pressed }) => ({ marginBottom: 16 })}
    >
      {({ pressed }) => (
        <ModernCard pressed={pressed} delay={index * 100}>
          <Image
            source={{ uri: item.image_url || "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }}
            style={{
              width: "100%",
              height: 160,
              borderRadius: 12,
              marginBottom: 12,
            }}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#F3F4F6", // text-primary-light
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#A1A1AA", // text-secondary-light
              marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#38BDF8", // text-accent-secondary
                marginRight: 4,
              }}
            >
              {item.average_rating ? item.average_rating.toFixed(1) : "New"} 
            </Text>
            <Text style={{ color: "#A1A1AA" }}>
              {item.average_rating ? "/ 5.0" : ""}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#A1A1AA", // text-secondary-light
            }}
          >
            {item.address}
          </Text>
        </ModernCard>
      )}
    </Pressable>
  );

  // Render pagination dots
  const renderPaginationDots = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
        marginBottom: 24,
      }}
    >
      {heroSlides.map((_, index) => (
        <MotiView
          key={index}
          animate={{
            scale: activeSlide === index ? 1.2 : 1,
            backgroundColor: activeSlide === index ? "#38BDF8" : "#52525B", // accent-secondary : dark-border
          }}
          transition={{ type: "timing", duration: 300 }}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 4,
          }}
        />
      ))}
    </View>
  );

  // Render loading skeleton
  const renderSkeleton = () => (
    <>
      <View
        style={{
          height: 200,
          borderRadius: 16,
          backgroundColor: "#52525B", // dark-border
          marginBottom: 16,
        }}
      />
      {[1, 2, 3].map((_, index) => (
        <View
          key={index}
          style={{
            height: 280,
            borderRadius: 16,
            backgroundColor: "#27272A", // dark-card
            marginBottom: 16,
            padding: 16,
          }}
        >
          <View
            style={{
              height: 160,
              borderRadius: 12,
              backgroundColor: "#52525B", // dark-border
              marginBottom: 12,
            }}
          />
          <View
            style={{
              height: 24,
              width: "60%",
              borderRadius: 4,
              backgroundColor: "#52525B", // dark-border
              marginBottom: 8,
            }}
          />
          <View
            style={{
              height: 16,
              width: "90%",
              borderRadius: 4,
              backgroundColor: "#52525B", // dark-border
              marginBottom: 8,
            }}
          />
          <View
            style={{
              height: 16,
              width: "40%",
              borderRadius: 4,
              backgroundColor: "#52525B", // dark-border
            }}
          />
        </View>
      ))}
    </>
  );

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
            marginBottom: 16,
          }}
        >
          Welcome, {user?.first_name || "Customer"}!
        </Text>
      </MotiView>

      {loading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={shops}
          renderItem={renderShopItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <FlatList
                ref={sliderRef}
                data={heroSlides}
                renderItem={renderHeroSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const slideIndex = Math.floor(
                    event.nativeEvent.contentOffset.x / windowWidth
                  );
                  setActiveSlide(slideIndex);
                }}
              />
              {renderPaginationDots()}
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#F3F4F6", // text-primary-light
                  marginBottom: 16,
                }}
              >
                Explore Shops
              </Text>
            </>
          }
          ListEmptyComponent={
            <ModernCard>
              <Text
                style={{
                  fontSize: 18,
                  textAlign: "center",
                  color: "#F3F4F6", // text-primary-light
                }}
              >
                No shops available at the moment.
              </Text>
            </ModernCard>
          }
        />
      )}
    </View>
  );
}