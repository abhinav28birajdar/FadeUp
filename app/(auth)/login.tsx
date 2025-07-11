import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isDemoMode } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { UserProfile } from "@/types/firebaseModels";
import ModernCard from "@/components/ModernCard";

export default function LoginScreen() {
  const router = useRouter();
  const { setFirebaseUser, setUser, setRole } = useAuthStore();
  const selectedRole = useAuthStore((state) => state.role);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Input focus states for animations
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (isDemoMode) {
      Alert.alert(
        "Demo Mode",
        "Firebase authentication is not configured. Please set up your Firebase environment variables.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
        
        // Check if the user's role matches the selected role
        if (selectedRole !== "unauthenticated" && userData.role !== selectedRole) {
          await auth.signOut();
          Alert.alert(
            "Role Mismatch",
            `You selected ${selectedRole} but your account is registered as a ${userData.role}.`
          );
          setLoading(false);
          return;
        }
        
        // Update auth store
        setFirebaseUser(firebaseUser);
        setUser(userData);
        setRole(userData.role);
        
        // Navigate to the appropriate screen
        if (userData.role === "customer") {
          router.replace("/(customer)/home");
        } else if (userData.role === "shopkeeper") {
          router.replace("/(shopkeeper)/dashboard");
        }
      } else {
        // User exists in Auth but not in Firestore
        await auth.signOut();
        Alert.alert("Error", "User profile not found. Please register again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <ModernCard style={{ width: "100%", maxWidth: 400 }}>
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500 }}
        >
          <Text style={{ 
            fontSize: 32, 
            fontWeight: "bold", 
            color: "#F3F4F6", // text-primary-light
            marginBottom: 24,
            textAlign: "center"
          }}>
            Login
          </Text>
        </MotiView>

        {isDemoMode && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 500, delay: 200 }}
            style={{ marginBottom: 16 }}
          >
            <View style={{
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              borderColor: "#F97316",
              borderWidth: 1,
              borderRadius: 8,
              padding: 12,
            }}>
              <Text style={{ 
                fontSize: 12, 
                color: "#F97316", // text-status-pending
                textAlign: "center"
              }}>
                Demo Mode: Authentication disabled
              </Text>
            </View>
          </MotiView>
        )}

        <MotiView
          animate={{ 
            borderColor: emailFocused ? "#38BDF8" : "#52525B" // accent-secondary : dark-border
          }}
          transition={{ type: "timing", duration: 200 }}
          style={{
            marginBottom: 16,
            borderWidth: 1,
            borderRadius: 12,
            backgroundColor: "rgba(18, 18, 18, 0.5)", // bg-dark-background/50
            padding: 16,
          }}
        >
          <TextInput
            placeholder="Email"
            placeholderTextColor="#A1A1AA" // text-secondary-light
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ 
              color: "#F3F4F6", // text-primary-light
              fontSize: 16,
            }}
          />
        </MotiView>

        <MotiView
          animate={{ 
            borderColor: passwordFocused ? "#38BDF8" : "#52525B" // accent-secondary : dark-border
          }}
          transition={{ type: "timing", duration: 200 }}
          style={{
            marginBottom: 24,
            borderWidth: 1,
            borderRadius: 12,
            backgroundColor: "rgba(18, 18, 18, 0.5)", // bg-dark-background/50
            padding: 16,
          }}
        >
          <TextInput
            placeholder="Password"
            placeholderTextColor="#A1A1AA" // text-secondary-light
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            secureTextEntry
            style={{ 
              color: "#F3F4F6", // text-primary-light
              fontSize: 16,
            }}
          />
        </MotiView>

        <Pressable
          onPress={handleLogin}
          disabled={loading}
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
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
                height: 56,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#F3F4F6" />
              ) : (
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: "bold", 
                  color: "#F3F4F6" // text-primary-light
                }}>
                  Login
                </Text>
              )}
            </MotiView>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/register")}
          style={({ pressed }) => ({ marginTop: 16 })}
        >
          {({ pressed }) => (
            <MotiView
              animate={{ scale: pressed ? 0.98 : 1 }}
              transition={{ type: "timing", duration: 150 }}
              style={{
                alignItems: "center",
                padding: 8,
              }}
            >
              <Text style={{ 
                fontSize: 16, 
                color: "#38BDF8", // text-accent-secondary
              }}>
                Don't have an account? Register
              </Text>
            </MotiView>
          )}
        </Pressable>
      </ModernCard>
    </View>
  );
}