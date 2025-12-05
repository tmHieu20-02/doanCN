import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import api from "../utils/api";
import * as SecureStore from "expo-secure-store";
Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldSetBadge: false,
      shouldPlaySound: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    } as Notifications.NotificationBehavior),
});


export async function registerForPushNotifications() {
  try {
    // Phải chạy trên thiết bị thật
    if (!Device.isDevice) {
      console.log("Push Notifications chỉ hoạt động trên device thực");
      return null;
    }

    // Quyền thông báo
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }

    if (status !== "granted") {
      console.log("Không có quyền nhận thông báo");
      return null;
    }

    // Lấy projectId (Expo EAS)
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      null;

    if (!projectId) {
      console.log("Không tìm thấy projectId trong app.json / app.config.js");
      return null;
    }

    // Lấy Expo Push Token
    const expoToken = (
      await Notifications.getExpoPushTokenAsync({ projectId })
    ).data;

    console.log("Expo Push Token:", expoToken);

    // Gửi token về backend
    const session = await SecureStore.getItemAsync("my-user-session");
    const user = session ? JSON.parse(session) : null;

    if (user?.id) {
      await api.post("/device/register", {
        user_id: user.id,
        fcm_token: expoToken,
      });
    }

    return expoToken;
  } catch (error) {
    console.log("REGISTER NOTIFICATION ERROR:", error);
    return null;
  }
}
