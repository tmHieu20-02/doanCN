import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import api from "@/utils/api";

export default function ForgotPassword() {
  const router = useRouter();
  const [numberPhone, setNumberPhone] = useState("");

  const handleSendOtp = async () => {
    try {
      const res = await api.post("/auth/forgot-password", { numberPhone });

      if (res.data.err === 0) {
        const token = res.data.reset_token;

        router.push({
          pathname: "/verify-reset-otp",
          params: { token },
        });
      } else {
        Alert.alert("Lỗi", res.data.mes);
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể gửi OTP.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Quên mật khẩu</Text>

      <TextInput
        placeholder="Nhập số điện thoại"
        keyboardType="number-pad"
        value={numberPhone}
        onChangeText={setNumberPhone}
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginTop: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleSendOtp}
        style={{
          backgroundColor: "#FFCC00",
          padding: 14,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ textAlign: "center", fontWeight: "700" }}>
          Gửi mã OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
}
