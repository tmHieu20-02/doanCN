import { Tabs } from "expo-router";
import { Home, User, Calendar, Bell } from "lucide-react-native";
import { Animated } from "react-native";
import { useRef } from "react";
import { AppIcons } from "@/ui/icons";


export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,

        tabBarActiveTintColor: "#FACC15",
        tabBarInactiveTintColor: "#A1A1AA",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          marginBottom: 6,
        },

        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 26,
          right: 26,
          height: 74,
          borderRadius: 36,
          backgroundColor: "#ffffff",
          paddingBottom: 6,
          paddingTop: 6,

          // Glass-card smooth shadow
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 12,
        },

        // Hiệu ứng phóng icon khi active
        tabBarIcon: ({ color, focused, size }) => {
          const scale = useRef(new Animated.Value(1)).current;

          Animated.spring(scale, {
            toValue: focused ? 1.18 : 1,
            friction: 6,
            tension: 120,
            useNativeDriver: true,
          }).start();

          const icons: any = {
            index: <Home color={color} size={size} />,
            bookings: <Calendar color={color} size={size} />,
            notifications: <Bell color={color} size={size} />,
            profile: <User color={color} size={size} />,
          };

          return (
            <Animated.View
              style={{
                transform: [{ scale }],
                padding: 6,
                borderRadius: 16,
                backgroundColor: focused ? "rgba(250, 204, 21, 0.15)" : "transparent",
              }}
            >
              {icons[route.name]}
            </Animated.View>
          );
        },
      })}
    >
      {/* --- 1. LỊCH HẸN --- */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Lịch hẹn",
        }}
      />

      {/* Ẩn hoàn toàn tab search */}
      <Tabs.Screen
        name="search"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      {/* --- 2. LỊCH SỬ --- */}
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Lịch sử",
        }}
      />

      {/* --- 3. THÔNG BÁO --- */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
        }}
      />

      {/* --- 4. HỒ SƠ --- */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
        }}
      />
    </Tabs>
  );
}
