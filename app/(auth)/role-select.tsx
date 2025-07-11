import { View, Text, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useAuthStore } from "@/store/authStore";
import ModernCard from "@/components/ModernCard";
import { isDemoMode } from "@/lib/firebase";

export default function RoleSelectScreen() {
  const router = useRouter();
  const { setRole } = useAuthStore();

  const handleRoleSelect = (role: "customer" | "shopkeeper") => {
    if (isDemoMode) {
      Alert.alert(
        "Demo Mode",
        "Firebase is not configured. Please set up your Firebase environment variables to use authentication features.",
        [
          { text: "Continue Anyway", onPress: () => {
            setRole(role);
            router.push("/login");
          }},
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }
    
    setRole(role);
    router.push("/login");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600 }}
      >
        <Text style={{ 
          fontSize: 48, 
          fontWeight: "bold", 
          color: "#F3F4F6", // text-primary-light
          marginBottom: 40,
          textAlign: "center"
        }}>
          FadeUp
        </Text>
      </MotiView>

      {isDemoMode && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 800, delay: 200 }}
          style={{ marginBottom: 20 }}
        >
          <ModernCard style={{ backgroundColor: "rgba(249, 115, 22, 0.1)", borderColor: "#F97316" }}>
            <Text style={{ 
              fontSize: 14, 
              color: "#F97316", // text-status-pending
              textAlign: "center",
              marginBottom: 8
            }}>
              ⚠️ Demo Mode
            </Text>
            <Text style={{ 
              fontSize: 12, 
              color: "#A1A1AA", // text-secondary-light
              textAlign: "center"
            }}>
              Firebase not configured. Authentication will not work.
            </Text>
          </ModernCard>
        </MotiView>
      )}

      <ModernCard>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: "bold", 
          color: "#F3F4F6", // text-primary-light
          marginBottom: 20,
          textAlign: "center"
        }}>
          I am a...
        </Text>

        <Pressable
          onPress={() => handleRoleSelect("customer")}
          style={({ pressed }) => ({ marginBottom: 16 })}
        >
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.98 : 1 }}
              transition={{ type: "timing", duration: 150 }}
              style={{
                backgroundColor: "#8B5CF6", // bg-accent-primary
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{ 
                fontSize: 18, 
                fontWeight: "bold", 
                color: "#F3F4F6" // text-primary-light
              }}>
                Customer
              </Text>
            </MotiView>
          )}
        </Pressable>

        <Pressable
          onPress={() => handleRoleSelect("shopkeeper")}
          style={({ pressed }) => ({})}
        >
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.98 : 1 }}
              transition={{ type: "timing", duration: 150 }}
              style={{
                backgroundColor: "#8B5CF6", // bg-accent-primary
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{ 
                fontSize: 18, 
                fontWeight: "bold", 
                color: "#F3F4F6" // text-primary-light
              }}>
                Shopkeeper
              </Text>
            </MotiView>
          )}
        </Pressable>
      </ModernCard>
    </View>
  );
}