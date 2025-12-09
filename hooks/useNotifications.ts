import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import api from "../utils/api";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});


export async function registerForPushNotifications() {
  try {
    if (!Device.isDevice) {
      console.log("Phải dùng thiết bị thật để nhận thông báo");
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Không có quyền nhận thông báo");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const expoToken = tokenData.data;

    console.log("EXPO TOKEN:", expoToken);

    const session = await SecureStore.getItemAsync("my-user-session");
    const user = session ? JSON.parse(session) : null;

    if (user?.id) {
      await api.post("/device/register", {
        user_id: user.id,
        fcm_token: expoToken
      });
    }

    return expoToken;
  } catch (error) {
    console.log("REGISTER NOTIFICATION ERROR:", error);
    return null;
  }
}
