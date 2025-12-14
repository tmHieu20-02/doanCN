// app/_layout.tsx

import { Slot } from "expo-router";
import {
  View,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

// 👉 GESTURE ROOT (FIX CRASH SWIPEABLE)
import { GestureHandlerRootView } from "react-native-gesture-handler";

// 👉 AUTH
import { AuthProvider, useAuth } from "@/hooks/useAuth";

// 👉 NOTIFICATIONS
import * as Notifications from "expo-notifications";

/* ============================================================
   🔔 GLOBAL NOTIFICATION HANDLER (API MỚI – KHÔNG WARNING)
   ⚠️ PHẢI ĐẶT NGOÀI COMPONENT
============================================================ */
Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log("🔔 [GLOBAL] Notification received (foreground enabled)");
    return {
      shouldShowBanner: true, // ✅ thay cho shouldShowAlert
      shouldShowList: true,   // ✅ thay cho shouldShowAlert
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

/* ============================================================
   Fix lỗi reanimated trên android cũ (GIỮ NGUYÊN)
============================================================ */
if (Platform.OS === "android") {
  try {
    // @ts-ignore
    const hook = global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook && typeof hook.inject === "function") {
      hook.inject = function () {};
    }
  } catch (e) {}
}

/* ============================================================ */

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const [loaded, error] = useFonts({
    // custom fonts nếu có
  });

  const { isInitialized } = useAuth();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || !isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFB300" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Slot />
      <Toast />
      <StatusBar style="dark" backgroundColor="transparent" translucent />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

/* ============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
