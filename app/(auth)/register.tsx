import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db, isDemoMode } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { UserProfile } from "@/types/firebaseModels";
import ModernCard from "@/components/ModernCard";

export default function RegisterScreen() {
  const router = useRouter();
  const { setFirebaseUser, setUser, setRole } = useAuthStore();
  const selectedRole = useAuthStore((state) => state.role);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Input focus states for animations
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const handleRegister = async () => {
    if (isDemoMode) {
      Alert.alert(
        "Demo Mode",
        "Firebase authentication is not configured. Please set up your Firebase environment variables.",
        [{ text: "OK" }]
      );
      return;
    }

    // Validate inputs
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Ensure email is not null
      if (!firebaseUser.email) {
        throw new Error("Email is required");
      }
      
      // Determine final role (default to customer if not selected)
      const finalRole = selectedRole === "unauthenticated" ? "customer" : selectedRole;
      
      // Create user profile in Firestore
      const userData: UserProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        first_name: firstName,
        last_name: lastName,
        role: finalRole,
        created_at: Timestamp.now(),
      };
      
      await setDoc(doc(db, "users", firebaseUser.uid), userData);
      
      // Update auth store
      setFirebaseUser(firebaseUser);
      setUser(userData);
      setRole(finalRole);
      
      Alert.alert("Success", "Registration successful!");
      
      // Navigate to the appropriate screen
      if (finalRole === "customer") {
        router.replace("/(customer)/home");
      } else if (finalRole === "shopkeeper") {
        router.replace("/(shopkeeper)/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Registration Failed", "An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={{ 
        flexGrow: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        padding: 20 
      }}
    >
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
            Register
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
            borderColor: firstNameFocused ? "#38BDF8" : "#52525B" // accent-secondary : dark-border
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
            placeholder="First Name"
            placeholderTextColor="#A1A1AA" // text-secondary-light
            value={firstName}
            onChangeText={setFirstName}
            onFocus={() => setFirstNameFocused(true)}
            onBlur={() => setFirstNameFocused(false)}
            style={{ 
              color: "#F3F4F6", // text-primary-light
              fontSize: 16,
            }}
          />
        </MotiView>

        <MotiView
          animate={{ 
            borderColor: lastNameFocused ? "#38BDF8" : "#52525B" // accent-secondary : dark-border
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
            placeholder="Last Name"
            placeholderTextColor="#A1A1AA" // text-secondary-light
            value={lastName}
            onChangeText={setLastName}
            onFocus={() => setLastNameFocused(true)}
            onBlur={() => setLastNameFocused(false)}
            style={{ 
              color: "#F3F4F6", // text-primary-light
              fontSize: 16,
            }}
          />
        </MotiView>

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
            marginBottom: 16,
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

        <MotiView
          animate={{ 
            borderColor: confirmPasswordFocused ? "#38BDF8" : "#52525B" // accent-secondary : dark-border
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
            placeholder="Confirm Password"
            placeholderTextColor="#A1A1AA" // text-secondary-light
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setConfirmPasswordFocused(true)}
            onBlur={() => setConfirmPasswordFocused(false)}
            secureTextEntry
            style={{ 
              color: "#F3F4F6", // text-primary-light
              fontSize: 16,
            }}
          />
        </MotiView>

        <Pressable
          onPress={handleRegister}
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
                  Register
                </Text>
              )}
            </MotiView>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/login")}
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
                Already have an account? Login
              </Text>
            </MotiView>
          )}
        </Pressable>
      </ModernCard>
    </ScrollView>
  );
}