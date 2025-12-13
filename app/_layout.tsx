import { Slot } from "expo-router";
import { View, ActivityIndicator, Platform, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Toast from 'react-native-toast-message';
import { StatusBar } from "expo-status-bar";

// 👉 QUAN TRỌNG: Import AuthProvider
import { AuthProvider, useAuth } from "@/hooks/useAuth"; 

// Fix lỗi reanimated trên android cũ (nếu có)
if (Platform.OS === "android") {
  try {
    // @ts-ignore
    const hook = global.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook && typeof hook.inject === "function") {
      hook.inject = function () {};
    }
  } catch (e) {}
}

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const [loaded, error] = useFonts({
    // Nếu bạn có font custom thì khai báo ở đây, ví dụ:
    // 'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  });

  // 👉 Lấy thông tin user để check redirect (giữ nguyên logic của bạn)
  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Đợi load font và auth session
  if (!loaded || !isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFB300" />
      </View>
    );
  }

  return (
    // FIX LAYOUT: Dùng View thường để Home tràn viền
    <View style={styles.container}>
      <Slot />
      <Toast />
      {/* StatusBar trong suốt */}
      <StatusBar style="dark" backgroundColor="transparent" translucent />
    </View>
  );
}

export default function RootLayout() {
  return (
    // 🔥 LỖI Ở ĐÂY LÚC NÃY: Phải bọc AuthProvider ở ngoài cùng
    // Nếu thiếu cái này thì useAuth() bên trong sẽ bị undefined -> Lỗi Login
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});