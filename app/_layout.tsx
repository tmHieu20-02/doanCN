import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { View, ActivityIndicator } from "react-native";

import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";

function RootLayoutNav() {
  const { user, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    // ===========================
    // 1. Chưa đăng nhập → ép vào Login
    // ===========================
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // ===========================
    // 2. Đã đăng nhập mà còn ở nhóm (auth)
    //    → Chuyển theo role
    // ===========================
    if (user && inAuthGroup) {
      if (user.roleId === 2) {
        router.replace("/staff");      // UI STAFF
      } else if (user.roleId === 3) {
        router.replace("/(tabs)");     // UI USER
      }
      return;
    }

    // ===========================
    // 3. Người dùng đã đăng nhập
    //    Nếu họ ở sai UI → ép đúng role
    // ===========================
    if (user) {
      if (user.roleId === 2 && segments[0] !== "staff") {
        router.replace("/staff");
      }
      if (user.roleId === 3 && segments[0] !== "(tabs)") {
        router.replace("/(tabs)");
      }
    }
  }, [user, isInitialized, segments]);

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
