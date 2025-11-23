import { Tabs } from "expo-router";
import { Home, User, Calendar, Bell } from "lucide-react-native";

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

      {/* --- 1. LỊCH HẸN --- */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Lịch hẹn",
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      {/* --- ẨN HOÀN TOÀN SEARCH KHỎI TAB BAR --- */}
      <Tabs.Screen
  name="search"
  options={{
    href: null,        // ẨN HOÀN TOÀN KHỎI TAB BAR
    headerShown: false,
  }}
/>


      {/* --- 2. LỊCH SỬ --- */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Lịch sử",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />

      {/* --- 3. THÔNG BÁO --- */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color, size }) => (
            <Bell size={size} color={color} />
          ),
        }}
      />

      {/* --- 4. HỒ SƠ --- */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
