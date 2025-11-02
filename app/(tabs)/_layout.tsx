// app/(tabs)/_layout.tsx

import { Tabs, useRouter } from 'expo-router'; // <--- 1. Import useRouter
import { Home, Calendar, User, Search, Bell } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth'; // <--- 2. Import useAuth (sửa đường dẫn nếu cần)
import { useEffect } from 'react'; // <--- 3. Import useEffect

export default function TabLayout() {
  const { user, isLoading } = useAuth(); // <--- 4. Lấy trạng thái xác thực
  const router = useRouter();

  // 5. Thêm hook useEffect để kiểm tra
  useEffect(() => {
    // Chỉ kiểm tra khi đã load xong và không có user
    if (!isLoading && !user) {
      // Đẩy người dùng về trang đăng nhập
      router.replace('/(auth)/login');
    }
  }, [user, isLoading]); // Chạy lại khi user hoặc isLoading thay đổi

  // 6. Trong khi đang tải hoặc nếu không có user, không hiển thị gì cả
  // để tránh việc các tab bị "nháy" lên trước khi bị đẩy về
  if (isLoading || !user) {
    return null; // Hoặc return một màn hình <LoadingComponent />
  }

  // 7. Nếu đã đăng nhập (vượt qua các bước trên), hiển thị các tab
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: 76,
          paddingTop: 8,
          paddingBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Tìm kiếm',
          tabBarIcon: ({ size, color }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Lịch hẹn',
          tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ size, color }) => <Bell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}