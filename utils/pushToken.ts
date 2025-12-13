import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

/* ======================================================
   NOTIFICATION HANDLER – FIX ĐÚNG TYPE (SDK 50+)
====================================================== */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,

    // ✅ BẮT BUỘC với Android 13+
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/* ======================================================
   LISTEN NOTIFICATION (APP ĐANG MỞ)
====================================================== */
export function listenNotificationForeground() {
  return Notifications.addNotificationReceivedListener((notification) => {
    console.log("🔔 FOREGROUND NOTIFICATION:", {
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
    });
  });
}

/* ======================================================
   LISTEN USER TAP NOTIFICATION
====================================================== */
export function listenNotificationClick() {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("👉 CLICK NOTIFICATION:", {
      title: response.notification.request.content.title,
      body: response.notification.request.content.body,
      data: response.notification.request.content.data,
    });
  });
}

/* ======================================================
   GET EXPO PUSH TOKEN
====================================================== */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { data } = await Notifications.getExpoPushTokenAsync();
  console.log("✅ EXPO PUSH TOKEN:", data);
  return data;
}
