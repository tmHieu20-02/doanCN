import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";

export default function StaffLayout() {
  const { user } = useAuth();

  console.log("STAFF USER:", user);

  // ❌ Nếu chưa login → về login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // ❌ Nếu là user role 3 → ép về UI user
  if (user.roleId !== 2) {
    return <Redirect href="/(tabs)" />;
  }

  // ✔ Staff hợp lệ → render UI staff
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Staff Panel"
      }}
    />
  );
}
