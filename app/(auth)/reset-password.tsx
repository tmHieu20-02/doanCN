import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/utils/api";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async () => {
    try {
      const res = await api.post(
        "/auth/reset-password",
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.err === 0) {
        Alert.alert("Thành công", "Đổi mật khẩu thành công");
        router.replace("/login");
      } else {
        Alert.alert("Lỗi", res.data.mes);
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể đổi mật khẩu.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Đặt mật khẩu mới</Text>

      <TextInput
        secureTextEntry
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginTop: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleReset}
        style={{
          backgroundColor: "#FFCC00",
          padding: 14,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ textAlign: "center", fontWeight: "700" }}>
          Xác nhận
        </Text>
      </TouchableOpacity>
    </View>
  );
}
