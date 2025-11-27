// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",  // TRANSITION MƯỢT
        gestureEnabled: true,           // Vuốt để back
        fullScreenGestureEnabled: true, // Vuốt full-screen cực mượt
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
     
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-reset-otp" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
