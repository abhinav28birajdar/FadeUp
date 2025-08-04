import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, isDemoMode } from "@/lib/firebase";
import { UserProfile } from "@/types/firebaseModels";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { user, firebaseUser, role, setFirebaseUser, setUser, setRole, clearAuth } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  // Listen for authentication state changes
  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, skip Firebase auth and go straight to role selection
      setAppReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
            setUser(userData);
            setRole(userData.role);
          } else {
            // User authenticated but no profile, force logout
            await auth.signOut();
            clearAuth();
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          await auth.signOut();
          clearAuth();
        }
      } else {
        // User is signed out
        clearAuth();
      }
      
      setAppReady(true);
    });

    return unsubscribe;
  }, []);

  // Handle routing based on authentication state
  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    
    if (isDemoMode) {
      // In demo mode, always allow access to auth screens
      if (!inAuthGroup) {
        router.replace("/role-select");
      }
      return;
    }
    
    if (firebaseUser && role) {
      // User is authenticated, redirect to appropriate screen
      if (inAuthGroup) {
        if (role === "customer") {
          router.replace("/(customer)/home");
        } else if (role === "shopkeeper") {
          router.replace("/(shopkeeper)/dashboard");
        }
      }
    } else {
      // User is not authenticated, redirect to auth
      if (!inAuthGroup) {
        router.replace("/role-select");
      }
    }
  }, [appReady, segments, firebaseUser, role]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#121212", "#1A1A1A", "#242424"]}
        style={{ flex: 1, position: "absolute", width: "100%", height: "100%" }}
      />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
          animationDuration: 200,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen 
          name="(customer)" 
          options={{ animation: "fade" }}
        />
        <Stack.Screen 
          name="(shopkeeper)" 
          options={{ animation: "fade" }}
        />
      </Stack>
    </View>
  );
}
