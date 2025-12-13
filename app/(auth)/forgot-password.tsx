import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image, // Thêm Image
} from "react-native";
import { useRouter } from "expo-router";
// import { MotiView, MotiImage } from "moti"; // XÓA/COMMENT DÒNG NÀY
import api from "@/utils/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [numberPhone, setNumberPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    // ... (Giữ nguyên logic)
    if (!/^[0-9]{10}$/.test(numberPhone.trim())) {
      Alert.alert("Lỗi", "Số điện thoại phải gồm đúng 10 số.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        numberPhone: numberPhone.trim(),
      });

      if (res.data.err === 0) {
        const token = res.data.reset_token ?? res.data.resetToken ?? res.data.resetToken;
        if (!token) {
          console.warn('Forgot: server returned success but no reset token', res.data);
          Alert.alert('Lỗi', 'Máy chủ không trả về mã xác thực để xác minh. Vui lòng thử lại.');
          return;
        }

        router.push({
          pathname: "/verify-reset-otp",
          params: { token, numberPhone },
        });
      } else {
        Alert.alert("Lỗi", res.data.mes);
      }
    } catch (e) {
      const err = e as any;
      console.log("FORGOT ERROR:", err?.response?.data || err);
      Alert.alert("Lỗi", "Không thể gửi OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* ================= IMAGE - Dùng View thường thay thế ================= */}
          <View // THAY THẾ MOTIVIEW
            style={styles.imageWrapper}
            // XÓA CÁC PROPS ANIMATION (from, animate, transition)
          >
            <Image // THAY THẾ MOTIIMAGE
              source={require("../../assets/images/gemini.png")}
              style={styles.image}
              // XÓA CÁC PROPS ANIMATION
            />
          </View>

          {/* ================= TITLE ================= */}
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập số điện thoại để nhận mã OTP đặt lại mật khẩu.
            </Text>
          </View>

          {/* ================= FORM - Dùng View thường thay thế ================= */}
          <View // THAY THẾ MOTIVIEW
            style={styles.card}
            // XÓA CÁC PROPS ANIMATION
          >
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Số điện thoại"
                placeholderTextColor="#9C8C4A"
                keyboardType="number-pad"
                maxLength={10}
                style={styles.input}
                value={numberPhone}
                onChangeText={setNumberPhone}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              disabled={loading}
              onPress={handleSendOtp}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Gửi mã OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDF5",
  },
  imageWrapper: {
    height: 260,
    backgroundColor: "#FFE9A3",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  titleWrapper: {
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#2A2A2A",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#6B6B6B",
  },
  card: {
    marginTop: 20,
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#E3D8A5",
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
    justifyContent: "center",
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    color: "#2A2A2A",
  },
  button: {
    height: 52,
    backgroundColor: "#FFCC00",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFCC00",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
  },
});
