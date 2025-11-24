import { Tabs } from "expo-router";
import { colors } from "../../../ui/theme";
import {
  Calendar,
  ListChecks,
  Star,
  User,
} from "lucide-react-native";

export default function StaffTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          height: 70,
          borderTopWidth: 0,
          borderRadius: 22,
          marginHorizontal: 12,
          marginBottom: 14,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Lịch hẹn",
          tabBarIcon: ({ color }) => (
            <Calendar size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="services"
        options={{
          title: "Dịch vụ",
          tabBarIcon: ({ color }) => (
            <ListChecks size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="rating"
        options={{
          title: "Đánh giá",
          tabBarIcon: ({ color }) => (
            <Star size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <User size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
