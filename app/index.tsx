import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const { user, isInitialized } = useAuth();

  if (!isInitialized) return null;

  // ❌ chưa login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // ✅ staff
  if (user.roleId === 2) {
    return <Redirect href="/staff/(stafftabs)" />;
  }

  // ✅ user thường
  return <Redirect href="/(tabs)" />;
}
