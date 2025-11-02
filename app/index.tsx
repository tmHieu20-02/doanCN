// app/index.tsx
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth'; // <-- Kiểm tra lại đường dẫn này
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

export default function StartPage() {
  // Lấy trạng thái từ hook
  const { user, isLoading } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    // Nếu đang kiểm tra, đợi
    if (isLoading) {
      return; 
    }

    if (user) {
      // Nếu có user, đẩy vào trang chính
      router.replace('/(tabs)');
    } else {
      // Nếu không có user, đẩy ra trang đăng nhập
      router.replace('/(auth)/login');
    }
  }, [user, isLoading]); // Chạy lại khi 2 giá trị này thay đổi

  // Hiển thị màn hình tải trong khi đang kiểm tra
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}