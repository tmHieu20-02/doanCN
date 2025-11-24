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

  // ❗ SAFETY: segments[0] luôn tồn tại
  const root = segments?.[0] ?? null;

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = root === "(auth)";

    // 1. Chưa đăng nhập → ép login
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // 2. Đã đăng nhập nhưng đang ở (auth) → đẩy theo role
    if (user && inAuthGroup) {
      if (user.roleId === 2) {
        router.replace("/staff");
      } else if (user.roleId === 3) {
        router.replace("/(tabs)");
      }
      return;
    }

    // 3. Đăng nhập rồi → ép về đúng root nhưng KHÔNG chặn route con
    if (user) {
      // STAFF (roleId 2)
      if (user.roleId === 2 && root !== "staff") {
        router.replace("/staff");
        return;
      }

      // USER (roleId 3)
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
