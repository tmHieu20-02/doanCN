import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { View, ActivityIndicator } from "react-native";

import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
// import { registerForPushNotifications } from "@/hooks/useNotifications"; // ❌ XÓA

function RootLayoutNav() {
  const { user, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const root = segments?.[0] ?? null;

  // ❌ COMMENT toàn bộ notification logic
  // useEffect(() => {
  //   if (isInitialized && user) {
  //     registerForPushNotifications();
  //   }
  // }, [isInitialized, user]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = root === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    if (user && inAuthGroup) {
      if (user.roleId === 2) {
        router.replace("/staff");
      } else if (user.roleId === 3) {
        router.replace("/(tabs)");
      }
      return;
    }

    if (user) {
      if (user.roleId === 2 && root !== "staff") {
        router.replace("/staff");
        return;
      }

      if (user.roleId === 3 && root === "staff") {
        router.replace("/(tabs)");
        return;
      }
    }
  }, [user, isInitialized, root]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFB300" />
      </View>
    );
  }

  return (
    <>
      <Slot />
      <Toast />
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
