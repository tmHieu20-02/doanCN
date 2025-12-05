import messaging from "@react-native-firebase/messaging";
import * as SecureStore from "expo-secure-store";
import api from "../utils/api";

export async function registerForPushNotifications() {
  try {
    // xin quyền FCM
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log("Không có quyền nhận thông báo");
      return;
    }

    // lấy FCM token
    const fcmToken = await messaging().getToken();
    console.log("FCM TOKEN:", fcmToken);

    const session = await SecureStore.getItemAsync("my-user-session");
    const user = session ? JSON.parse(session) : null;

    if (user?.id) {
      await api.post("/device/register", {
        user_id: user.id,
        fcm_token: fcmToken,
      });
    }

    return fcmToken;
  } catch (error) {
    console.log("REGISTER FCM ERROR:", error);
  }
}
