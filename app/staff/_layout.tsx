import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/useAuth";
import { useEffect, useRef } from "react";

export default function StaffLayout() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  // 🔒 đảm bảo redirect chỉ chạy 1 lần
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (checkedRef.current) return;

    checkedRef.current = true;

    // ❌ chưa login
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    // ❌ không phải staff
    if (user.roleId !== 2) {
      router.replace("/(tabs)");
      return;
    }
  }, [user, isInitialized]);

  // ⛔ chưa init xong → đừng render gì cả
  if (!isInitialized) {
    return null;
  }

  // ⛔ user không hợp lệ → đợi router.replace xử lý
  if (!user || user.roleId !== 2) {
    return null;
  }

  // ✅ staff hợp lệ → render staff stack
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
