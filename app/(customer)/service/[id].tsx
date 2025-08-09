import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ModernCard } from "../../../src/components/ModernCard";
import { supabase } from "../../../src/lib/supabase";
import { Service } from "../../../src/types/supabase";

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data: serviceData, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (serviceData) {
          setService(serviceData);
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <ModernCard>
          <Text style={{ fontSize: 18, color: "#F3F4F6", textAlign: "center" }}>
            Service not found
          </Text>
        </ModernCard>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
      <ModernCard style={{ width: "100%", maxWidth: 400 }}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 0 }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#F3F4F6", // text-primary-light
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            {service.name}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 200 }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#10B981", // text-status-completed
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            ${service.price.toFixed(2)}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 400 }}
        >
          <Text
            style={{
              fontSize: 18,
              color: "#A1A1AA", // text-secondary-light
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Duration: {service.duration} minutes
          </Text>
        </MotiView>

        {service.description && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 600 }}
            style={{ marginBottom: 32 }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#A1A1AA", // text-secondary-light
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              {service.description}
            </Text>
          </MotiView>
        )}

        <Pressable
          onPress={() => router.push(`/booking/${service.shop_id}`)}
          style={({ pressed }) => ({})}
        >
          {({ pressed }) => (
            <MotiView
              from={{ scale: 1 }}
              animate={{ 
                scale: pressed ? 0.96 : 1,
              }}
              transition={{ delay: 0 }}
              style={{
                backgroundColor: "#8B5CF6", // bg-accent-primary
                paddingVertical: 20,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <MotiView
                from={{ scale: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ delay: 1000 }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#F3F4F6", // text-primary-light
                  }}
                >
                  Book This Service
                </Text>
              </MotiView>
            </MotiView>
          )}
        </Pressable>
      </ModernCard>
    </View>
  );
}