// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { Home, Calendar, User, Search, Bell } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router'; // ← THÊM

export default function TabLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  // ❗ CHẶN STAFF KHÔNG ĐƯỢC VÀO TABS
  if (user?.roleId === 2) {
    return <Redirect href="/staff" />;   // ← CHỈ THÊM 1 DÒNG NÀY
  }

  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          height: 74,
          paddingTop: 6,
          paddingBottom: 10,

          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 4,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 3,
        },

        tabBarActiveTintColor: '#FFB300',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >

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
