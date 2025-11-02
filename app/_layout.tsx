// app/_layout.tsx

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/hooks/useAuth'; // <-- Sửa đường dẫn nếu cần

export default function RootLayout() {
  useFrameworkReady();

  return (
    // Bọc toàn bộ <Stack> bằng <AuthProvider>
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* Dòng <Stack.Screen name="(auth)" /> ĐÃ BỊ XÓA */}
        
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style="auto" />
    </AuthProvider>
  );
}