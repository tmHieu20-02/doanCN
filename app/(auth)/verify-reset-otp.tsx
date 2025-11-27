import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/utils/api";

export default function VerifyResetOtp() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const res = await api.post("/auth/verify-reset-otp", {
        reset_token: token,
        otp,
      });

      if (res.data.err === 0) {
        router.push({
          pathname: "/reset-password",
          params: { token },
        });
      } else {
        Alert.alert("Lỗi", res.data.mes);
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể xác minh OTP.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Xác minh OTP</Text>

      <TextInput
        placeholder="Nhập OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginTop: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleVerify}
        style={{
          backgroundColor: "#FFCC00",
          padding: 14,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ textAlign: "center", fontWeight: "700" }}>Xác minh</Text>
      </TouchableOpacity>
    </View>
  );
}
