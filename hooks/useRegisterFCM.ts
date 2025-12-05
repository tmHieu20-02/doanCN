import { useEffect } from "react";
import messaging from "@react-native-firebase/messaging";
import * as SecureStore from "expo-secure-store";

export function useRegisterFCM() {
  useEffect(() => {
    async function register() {
      const session = await SecureStore.getItemAsync("my-user-session");
      const user = session ? JSON.parse(session) : null;
      if (!user) return;

      // 1. Xin quyền FCM
      const authStatus = await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log("Không có quyền nhận thông báo");
        return;
      }

      // 2. Lấy FCM token
      const fcmToken = await messaging().getToken();
      console.log("FCM TOKEN:", fcmToken);

      // 3. Gửi về backend
      await fetch("https://phatdat.store/api/v1/notification/save-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          fcm_token: fcmToken,
        }),
      });
    }

    register();
  }, []);
}
