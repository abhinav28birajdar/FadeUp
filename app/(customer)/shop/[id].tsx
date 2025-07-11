import { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Shop, Service } from "@/types/firebaseModels";
import ModernCard from "@/components/ModernCard";

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchShopAndServices = async () => {
      try {
        // Fetch shop details
        const shopDoc = await getDoc(doc(db, "shops", id as string));
        
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

    if (id) {
      fetchShopAndServices();
    }
  }, [id]);

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
            marginBottom: 16,
          }}
        >
          {shop.name}
        </Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 800 }}
      >
        <Image
          source={{ uri: shop.image_url || "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" }}
          style={{
            width: "100%",
            height: 250,
            borderRadius: 16,
            marginBottom: 16,
          }}
        />
      </MotiView>

      <ModernCard delay={200}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#38BDF8", // text-accent-secondary
              marginRight: 4,
            }}
          >
            {shop.average_rating ? shop.average_rating.toFixed(1) : "New"} 
          </Text>
          <Text style={{ color: "#A1A1AA", fontSize: 16 }}>
            {shop.average_rating ? "/ 5.0" : ""}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            color: "#A1A1AA", // text-secondary-light
          }}
        >
          {shop.address}
        </Text>
      </ModernCard>

      <ModernCard delay={300}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#F3F4F6", // text-primary-light
            marginBottom: 8,
          }}
        >
          About
        </Text>
        <MotiView
          animate={{ height: descriptionExpanded ? "auto" : 80 }}
          transition={{ type: "timing", duration: 300 }}
          style={{ overflow: "hidden" }}
        >
          <Text
            style={{
              fontSize: 16,
              color: "#A1A1AA", // text-secondary-light
              lineHeight: 24,
            }}
          >
            {shop.description}
          </Text>
        </MotiView>
        {shop.description && shop.description.length > 150 && (
          <Pressable
            onPress={() => setDescriptionExpanded(!descriptionExpanded)}
            style={{ marginTop: 8 }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#38BDF8", // text-accent-secondary
                fontWeight: "bold",
              }}
            >
              {descriptionExpanded ? "Show Less" : "Read More"}
            </Text>
          </Pressable>
        )}
      </ModernCard>

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#F3F4F6", // text-primary-light
          marginTop: 24,
          marginBottom: 16,
        }}
      >
        Our Services
      </Text>

      {services.length === 0 ? (
        <ModernCard>
          <Text
            style={{
              fontSize: 16,
              color: "#A1A1AA", // text-secondary-light
              textAlign: "center",
            }}
          >
            No services available for this shop.
          </Text>
        </ModernCard>
      ) : (
        services.map((service, index) => (
          <Pressable
            key={service.id}
            onPress={() => router.push(`/service/${service.id}`)}
            style={({ pressed }) => ({ marginBottom: 16 })}
          >
            {({ pressed }) => (
              <ModernCard pressed={pressed} delay={400 + index * 100}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#F3F4F6", // text-primary-light
                        marginBottom: 4,
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
                    {service.description && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#A1A1AA", // text-secondary-light
                          marginTop: 4,
                        }}
                        numberOfLines={2}
                      >
                        {service.description}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#10B981", // text-status-completed
                    }}
                  >
                    ${service.price.toFixed(2)}
                  </Text>
                </View>
              </ModernCard>
            )}
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}