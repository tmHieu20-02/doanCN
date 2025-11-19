import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams();
  const numberPhone = String(params.numberPhone || "");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  // ====================== RESEND OTP ==========================
  const [counter, setCounter] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (!canResend) {
      timer = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [canResend]);

  const handleResend = async () => {
    Alert.alert("Thông báo", "Backend chưa hỗ trợ gửi lại OTP nên không thể thực hiện.");
  };

  // ====================== OTP INPUT ==========================
  const inputRefs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    // Chỉ cho phép nhập số
    if (!/^[0-9]*$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Tự động focus sang ô tiếp theo
    if (text && index < 5) inputRefs.current[index + 1]?.focus();
    // Tự động lùi lại khi xóa
    if (!text && index > 0) inputRefs.current[index - 1]?.focus();
  };

  // ====================== SHAKE ANIMATION ==========================
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // ====================== VERIFY OTP (FIXED) ==========================
  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      triggerShake();
      Alert.alert("Lỗi", "OTP phải gồm 6 số.");
      return;
    }

    setLoading(true);

    const body = {
      numberPhone: String(numberPhone),
      otp: String(code),
    };

    console.log(">>> GỬI OTP:", body);

    try {
      const res = await fetch("https://phatdat.store/api/v1/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });

      // Log để debug
      const text = await res.text(); 
      console.log(">>> STATUS:", res.status);
      console.log(">>> BODY:", text);

      // === LOGIC MỚI: Ưu tiên check Status Code ===
      
      // Trường hợp 1: Thành công (Status 200 OK)
      // Bất kể body rỗng hay có chữ, miễn là 200 thì cho qua.
      if (res.ok) { // res.ok tương đương status trong khoảng 200-299
        Alert.alert("Thành công", "Xác minh OTP thành công!", [
          { text: "OK", onPress: () => router.replace("/(auth)/login") }
        ]);
        return;
      }

      // Trường hợp 2: Lỗi (Status 400, 401, 500...)
      triggerShake();
      
      let errorMessage = "OTP không đúng hoặc đã hết hạn.";

      // Cố gắng đọc lỗi từ Backend trả về (nếu có)
      if (text) {
        try {
            // Nếu trả về JSON có field 'mes' hoặc 'message'
            const data = JSON.parse(text);
            if (data.mes) errorMessage = data.mes;
            else if (data.message) errorMessage = data.message;
        } catch (e) {
            // Nếu trả về text thuần (không phải JSON)
            if (text.trim().length > 0) errorMessage = text;
        }
      }
      
      Alert.alert("Lỗi", errorMessage);

    } catch (err) {
      console.error(err);
      triggerShake();
      Alert.alert("Lỗi", "Không thể kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xác minh OTP</Text>
      <Text style={styles.subtitle}>Mã OTP đã được gửi tới: {numberPhone}</Text>

      <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
        {otp.map((value, index) => (
          <TextInput
            key={index}
            ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={value}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </Animated.View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={handleVerify}
      >
        <Text style={styles.buttonText}>
          {loading ? "Đang xác minh..." : "Xác minh"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity disabled style={{ marginTop: 20 }}>
        <Text style={{ textAlign: "center", color: "#aaa", fontWeight: "600" }}>
          Backend chưa hỗ trợ gửi lại OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ====================== STYLE ==========================
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#FFFDF5" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 10, color: "#2A2A2A" },
  subtitle: { color: "#6B6B6B", marginBottom: 30, fontSize: 15 },
  otpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 40 },
  otpBox: {
    width: 50,
    height: 60,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3D8A5",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#2A2A2A",
  },
  button: { backgroundColor: "#FFCC00", padding: 16, borderRadius: 16 },
  buttonText: { textAlign: "center", fontWeight: "700", fontSize: 18, color: "#222" },
});