import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="edit"
        options={{
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="../modal/map-picker"
        options={{
          presentation: "modal",
          headerTitle: "Chọn vị trí",
        }}
      />
    </Stack>
  );
}
