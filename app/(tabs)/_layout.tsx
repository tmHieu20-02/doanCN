import { Tabs } from "expo-router";
import { Home, User, Calendar, Bell, Search } from "lucide-react-native";
import { colors } from "@/ui/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#FACC15",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          position: "absolute",
          bottom: 16,
          left: 20,
          right: 20,
          height: 68,
          backgroundColor: "#fff",
          borderRadius: 26,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 8,
          paddingBottom: 8,
        },
      }}
    >

      {/* --- 1. LỊCH HẸN (index) --- */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Lịch hẹn",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      {/* --- 2. HỒ SƠ (đổi lên vị trí thứ 2) --- */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />

      {/* --- 3. LỊCH SỬ (bookings) --- */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Lịch sử",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />

      {/* --- 4. THÔNG BÁO --- */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color, size }) => (
            <Bell size={size} color={color} />
          ),
        }}
      />

      {/* --- 5. SEARCH (đưa xuống cuối) --- */}
      <Tabs.Screen
        name="search"
        options={{
          title: "search",
          tabBarIcon: ({ color, size }) => (
            <Search size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
