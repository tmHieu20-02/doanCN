import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router"; // Import các hook còn thiếu
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { View, ActivityIndicator } from "react-native";

// Import hook Auth
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";

// 1. Component con: Chịu trách nhiệm điều hướng & UI chính
function RootLayoutNav() {
  const { user, isInitialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return; // Chưa check xong bộ nhớ thì thôi

    // Kiểm tra xem user đang đứng ở nhóm route nào
    const inAuthGroup = segments[0] === "(auth)";
    
    // LOGIC BẢO VỆ:
    if (user && inAuthGroup) {
      // Đã login mà còn đứng ở trang Login/Register -> Đá vào trong
      // Sửa đường dẫn này thành nơi bạn muốn (ví dụ: /(tabs)/bookings hoặc /(tabs)/home)
      router.replace("/(tabs)/bookings"); 
    } else if (!user && !inAuthGroup) {
      // Chưa login mà đòi vào trang trong -> Đá ra trang Login
      router.replace("/(auth)/login");
    }
  }, [user, isInitialized, segments]);

  // Màn hình chờ (Splash) trong lúc đang check đăng nhập
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

// 2. Component cha: Chỉ cung cấp Provider
export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}