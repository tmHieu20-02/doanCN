import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "@/utils/api";

export default function VerifyResetOtp() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    // Try several token key variations in case backend accepts different param names
    const candidateKeys = ["reset_token", "resetToken", "token"];
    let lastResp: any = null;
    let ok = false;
    for (const key of candidateKeys) {
      try {
        const body: any = { otp };
        body[key] = token;
        const res = await api.post("/auth/verify-reset-otp", body);
        console.log('VERIFY-RESET ATTEMPT:', key, res.status, res.data);
        lastResp = res;
        if (res.data.err === 0 || res.status >= 200 && res.status < 300) {
          ok = true;
          router.push({ pathname: "/reset-password", params: { token } });
          break;
        }
      } catch (e) {
        lastResp = e as any;
        console.warn('VERIFY-RESET attempt failed for', key, e?.response?.data ?? e?.message ?? e);
      }
    }

    if (!ok) {
      // final attempt: send token in Authorization header
      try {
        const hdrRes = await api.post("/auth/verify-reset-otp", { otp }, { headers: { Authorization: `Bearer ${token}` } });
        console.log('VERIFY-RESET ATTEMPT header:', hdrRes.status, hdrRes.data);
        if (hdrRes.data.err === 0 || (hdrRes.status >= 200 && hdrRes.status < 300)) {
          router.push({ pathname: "/reset-password", params: { token } });
          return;
        }
        lastResp = hdrRes;
      } catch (eHdr) {
        lastResp = eHdr as any;
        console.warn('Header attempt failed', eHdr?.response?.data ?? eHdr?.message ?? eHdr);
      }

      const msg = lastResp?.data?.mes || lastResp?.data?.message || JSON.stringify(lastResp?.data || lastResp) || 'Không thể xác minh OTP.';
      Alert.alert('Lỗi', String(msg));
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
