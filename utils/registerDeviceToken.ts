import api from "@/utils/api";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function registerDeviceToken(token: string) {
  return api.post("/device-tokens/register", {
    fcm_token: token,
    platform: Platform.OS,
    device_id: Device.osInternalBuildId || Device.deviceName || "unknown",
  });
}
