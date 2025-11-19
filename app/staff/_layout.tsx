import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

export default function StaffLayout() {
  const { user } = useAuth();

  // Nếu chưa login hoặc không phải staff → đẩy về UI user
  if (!user || user.roleId !== 2) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Staff Panel"
      }}
    />
  );
}
