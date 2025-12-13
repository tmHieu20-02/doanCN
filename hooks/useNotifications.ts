import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import api from "../utils/api";

Notifications.setNotificationHandler({
  // Sử dụng 'as any' trên giá trị trả về để bỏ qua kiểm tra kiểu cứng nhắc 
  // do sự không khớp giữa TS và phiên bản SDK
  handleNotification: (notification) => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    } as any; // <-- BUỘC TS CHẤP NHẬN
  },
});


export async function registerForPushNotifications() {
  try {
    // 1. KIỂM TRA THIẾT BỊ
    if (!Device.isDevice) {
      console.log("Phải dùng thiết bị thật để nhận thông báo");
      return null;
    }

    // 2. XIN VÀ LẤY QUYỀN
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

    // 3. LẤY EXPO TOKEN
    // Đảm bảo projectId đã được cấu hình trong app.json
    const tokenData = await Notifications.getExpoPushTokenAsync(); 
    const expoToken = tokenData.data;

    console.log("✅ EXPO PUSH TOKEN ĐÃ LẤY:", expoToken);

    // 4. LẤY THÔNG TIN USER VÀ THIẾT BỊ
    // Lấy accessToken và user từ SecureStore/Session Storage của bạn
    const session = await SecureStore.getItemAsync("my-user-session");
    const user = session ? JSON.parse(session) : null;

    // Lấy thông tin thiết bị cho backend
    const deviceId = Device.osBuildId || Device.deviceName || "unknown-device";
    const platform = Device.osName?.toLowerCase() === "ios" ? "ios" : "android";

    // 5. GỌI API ĐĂNG KÝ (FIX LỖI 404 VÀ THIẾU TRƯỜNG)
    if (user?.id) {
      const response = await api.post("/device-token/register", { // 👈 FIX LỖI 404
        // Backend yêu cầu các trường này:
        // Lưu ý: User ID cũng có thể được lấy từ JWT qua verifyToken
        fcm_token: expoToken, 
        platform: platform, 
        device_id: deviceId, 
      });

      console.log("✅ Đăng ký Device Token thành công:", response.data);
    }

    return expoToken;
  } catch (error) {
    console.error("❌ REGISTER NOTIFICATION ERROR (Lỗi FE/API):", error);
    // Nếu vẫn lỗi 404, hãy kiểm tra lại BASE_URL trong file ../utils/api
    return null;
  }
}