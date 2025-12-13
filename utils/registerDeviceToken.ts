// utils/registerDeviceToken.ts
import api from "@/utils/api";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerDeviceToken(accessToken: string) {
  console.log("🔔 [registerDeviceToken] CALLED");

  if (!Device.isDevice) {
    console.log("❌ [registerDeviceToken] Not a physical device");
    return;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  console.log("🔔 [registerDeviceToken] Permission status:", status);

  if (status !== "granted") {
    console.log("❌ [registerDeviceToken] Permission not granted");
    return;
  }

  const { data: expoPushToken } =
    await Notifications.getExpoPushTokenAsync({
      projectId: "f9c4f501-0148-4dae-8c41-f48884dcd530",
    });

  console.log("🔔 [registerDeviceToken] Expo push token:", expoPushToken);

  try {
    const res = await api.post(
      "/device-token/register",
      {
        fcm_token: expoPushToken,
        platform: Platform.OS,
        device_id:
          Device.osInternalBuildId ||
          Device.deviceName ||
          "unknown",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // 🔥 LOG QUAN TRỌNG NHẤT
    console.log("🟢 [registerDeviceToken] STATUS:", res.status);
    console.log("🟢 [registerDeviceToken] DATA:", res.data);

    return res;
  } catch (e: any) {
    console.log("🔴 [registerDeviceToken] ERROR STATUS:", e?.response?.status);
    console.log("🔴 [registerDeviceToken] ERROR DATA:", e?.response?.data);
    console.log("🔴 [registerDeviceToken] ERROR MESSAGE:", e?.message);
    throw e;
  }
}
