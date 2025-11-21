import { Stack } from "expo-router";

export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Đặt lịch" }} />
      <Stack.Screen name="create" options={{ title: "Tạo lịch hẹn" }} />
    </Stack>
  );
}
