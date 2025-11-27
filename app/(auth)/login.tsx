import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  StatusBar,
  Image,
} from "react-native";

import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/api";
import Toast from "react-native-toast-message";

import { Link, useRouter } from "expo-router";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, AnimatePresence } from "moti";
import { AxiosError } from "axios";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, isLoading } = useAuth();

  const [mode, setMode] = useState("login"); // login | forgot | register

  /* LOGIN STATES */
  const [numberPhone, setNumberPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /* FORGOT */
  const [fpPhone, setFpPhone] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  /* REGISTER */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [rgPhone, setRgPhone] = useState("");
  const [rgPassword, setRgPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ============================= LOGIN ============================= */
  const handleSignIn = async () => {
    if (!numberPhone || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (!/^[0-9]{10}$/.test(numberPhone)) {
      Alert.alert("Lỗi", "Số điện thoại phải gồm đúng 10 số.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu quá ngắn.");
      return;
    }

    setLoginLoading(true);

    try {
      const result = await signIn({
        numberPhone: numberPhone.trim(),
        password: password.trim(),
      });

      if (!result.success) {
        Alert.alert("Đăng nhập thất bại", result.message || "Kiểm tra lại thông tin.");
      }
    } catch {
      Alert.alert("Lỗi", "Có lỗi hệ thống xảy ra.");
    } finally {
      setLoginLoading(false);
    }
  };

  /* ============================= FORGOT PASSWORD ============================= */
  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(fpPhone.trim())) {
      Alert.alert("Lỗi", "Số điện thoại phải gồm đúng 10 số.");
      return;
    }

    setFpLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        numberPhone: fpPhone.trim(),
      });

      if (res.data.err === 0) {
        router.push({
          pathname: "/verify-reset-otp",
          params: {
            token: res.data.reset_token,
            numberPhone: fpPhone.trim(),
          },
        });
      } else {
        Alert.alert("Lỗi", res.data.mes);
      }
    } catch (e) {
  const err = e as AxiosError;
  console.log("FORGOT ERROR:", err.response?.data || err);
  Alert.alert("Lỗi", "Không thể gửi OTP.");
} finally {
      setFpLoading(false);
    }
  };

  /* ============================= REGISTER (GIỮ NGUYÊN) ============================= */
  const handleSignUp = async () => {
    if (!fullName || !email || !rgPhone || !rgPassword || !confirmPassword) {
      Toast.show({ type: "error", text1: "Thiếu thông tin", text2: "Vui lòng nhập tất cả trường." });
      return;
    }

    if (fullName.length < 3) {
      Toast.show({ type: "error", text1: "Tên không hợp lệ" });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Toast.show({ type: "error", text1: "Email sai định dạng" });
      return;
    }

    if (!/^[0-9]{10}$/.test(rgPhone)) {
      Toast.show({ type: "error", text1: "SĐT phải 10 số" });
      return;
    }

    if (rgPassword.length < 6) {
      Toast.show({ type: "error", text1: "Mật khẩu quá yếu" });
      return;
    }

    if (rgPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Mật khẩu không khớp" });
      return;
    }

    const response = await signUp({
      full_name: fullName.trim(),
      email: email.trim(),
      numberPhone: rgPhone.trim(),
      password: rgPassword.trim(),
    });

    if (response.success) {
      Toast.show({
        type: "success",
        text1: "Đăng ký thành công",
        text2: "Hãy kiểm tra email lấy OTP",
      });

      router.push({
        pathname: "/(auth)/verify-otp",
        params: { numberPhone: rgPhone.trim() },
      });
    } else {
      Toast.show({ type: "error", text1: "Đăng ký thất bại", text2: response.message });
    }
  };

  /* ============================= RENDER ============================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#FFE9A3", "#FFE29B", "#FFD98A"]} style={styles.header}>
          <Text style={styles.headerTitle}>
            {mode === "login" && "Đăng nhập để tiếp tục"}
            {mode === "forgot" && "Quên mật khẩu"}
            {mode === "register" && "Tạo tài khoản mới"}
          </Text>

          <Image
            source={require("../../assets/images/Login-rafiki.png")}
            style={styles.headerImage}
            resizeMode="contain"
          />
        </LinearGradient>

        {/* ================== CONTENT ================== */}
        <View style={styles.formArea}>
          <AnimatePresence>

            {/* ================= LOGIN FORM ================= */}
            {mode === "login" && (
              <MotiView
                key="loginForm"
                from={{ opacity: 0, translateY: 40 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -40 }}
                transition={{ duration: 350 }}
                style={styles.card}
              >
                <Text style={styles.formTitle}>Đăng nhập</Text>
                <Text style={styles.formSubtitle}>Nhập thông tin để tiếp tục</Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="phone-outline" size={22} color="#333" />
                  <TextInput
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={numberPhone}
                    onChangeText={setNumberPhone}
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="lock-outline" size={22} color="#333" />
                  <TextInput
                    placeholder="Mật khẩu"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                  />
                </View>

                <TouchableOpacity style={styles.forgotBtn} onPress={() => setMode("forgot")}>
                  <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginButton, loginLoading && { opacity: 0.7 }]}
                  onPress={handleSignIn}
                  disabled={loginLoading}
                >
                  {loginLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.loginButtonText}>Đăng nhập</Text>}
                </TouchableOpacity>

                <Text style={styles.orText}>Hoặc tiếp tục với</Text>

                <View style={styles.socialRow}>
                  <View style={styles.socialBtn}><AntDesign name="apple1" size={24} color="#000" /></View>
                  <View style={styles.socialBtn}><AntDesign name="google" size={24} color="#DB4437" /></View>
                  <View style={styles.socialBtn}><AntDesign name="facebook-square" size={24} color="#4267B2" /></View>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Chưa có tài khoản?</Text>
                  <TouchableOpacity onPress={() => setMode("register")}>
                    <Text style={styles.registerText}>Đăng ký ngay</Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            )}

            {/* ================= FORGOT FORM ================= */}
            {mode === "forgot" && (
              <MotiView
                key="forgotForm"
                from={{ opacity: 0, translateY: 60 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 40 }}
                transition={{ duration: 350 }}
                style={styles.card}
              >
                <Text style={styles.formTitle}>Quên mật khẩu</Text>
                <Text style={styles.formSubtitle}>Nhập số điện thoại để nhận mã OTP</Text>

                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="phone-outline" size={22} color="#333" />
                  <TextInput
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={fpPhone}
                    onChangeText={setFpPhone}
                    style={styles.input}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, fpLoading && { opacity: 0.7 }]}
                  disabled={fpLoading}
                  onPress={handleSendOtp}
                >
                  {fpLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.loginButtonText}>Gửi mã OTP</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMode("login")} style={{ alignSelf: "center", marginTop: 16 }}>
                  <Text style={{ color: "#333", fontWeight: "600" }}>Quay lại đăng nhập</Text>
                </TouchableOpacity>
              </MotiView>
            )}

            {/* ================= REGISTER FORM (KEEP ORIGINAL) ================= */}
            {mode === "register" && (
              <MotiView
                key="registerForm"
                from={{ opacity: 0, translateY: 70 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 40 }}
                transition={{ duration: 350 }}
                style={styles.card}
              >
                <Text style={styles.title}>Đăng ký tài khoản</Text>
                <Text style={styles.subtitle}>Nhập thông tin của bạn bên dưới</Text>

                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Nhập họ tên"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Nhập email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                />

                <Text style={styles.label}>Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  value={rgPhone}
                  onChangeText={setRgPhone}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>Mật khẩu</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={rgPassword}
                  onChangeText={setRgPassword}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#999"
                />

                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && { opacity: 0.6 }]}
                  disabled={isLoading}
                  onPress={handleSignUp}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Đăng ký</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMode("login")} style={{ alignSelf: "center", marginTop: 15 }}>
                  <Text style={{ color: "#333", fontWeight: "600" }}>Quay lại đăng nhập</Text>
                </TouchableOpacity>
              </MotiView>
            )}

          </AnimatePresence>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    height: 280,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 50,
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#333", marginBottom: 10 },
  headerImage: { width: "88%", height: 160 },

  formArea: { marginTop: -50, paddingHorizontal: 20 },

  card: {
    backgroundColor: "#FFF",
    padding: 26,
    borderRadius: 26,
    marginBottom: 20,
    elevation: 3,
  },

  formTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222",
    textAlign: "center",
  },
  formSubtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 4,
    marginBottom: 20,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: "#222" },

  forgotBtn: { alignSelf: "flex-end", marginBottom: 16 },
  forgotText: { fontSize: 14, color: "#333", fontWeight: "600" },

  loginButton: {
    height: 52,
    backgroundColor: "#FFCC00",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: { color: "#000", fontSize: 17, fontWeight: "700" },

  orText: { textAlign: "center", color: "#777", marginBottom: 18 },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 22,
  },
  socialBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },

  /* REGISTER STYLES */
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", color: "#222" },
  subtitle: { textAlign: "center", color: "#666", marginTop: 4, marginBottom: 20 },
  label: { color: "#444", fontWeight: "600", marginBottom: 6 },

  signUpButton: {
    backgroundColor: "#FFCC00",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  signUpButtonText: { color: "#000", fontWeight: "700", fontSize: 16 },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: { color: "#555", marginRight: 6 },
  registerText: { color: "#000", fontWeight: "700" },
});
