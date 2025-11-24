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
  ImageBackground,
} from "react-native";

import { useAuth } from "../../hooks/useAuth";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [numberPhone, setNumberPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = async () => {
    if (!fullName || !email || !numberPhone || !password || !confirmPassword) {
      Toast.show({ type: "error", text1: "Thiếu thông tin", text2: "Vui lòng nhập đầy đủ tất cả các trường." });
      return;
    }

    if (fullName.length < 3) {
      Toast.show({ type: "error", text1: "Tên không hợp lệ", text2: "Tên phải có ít nhất 3 ký tự." });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Toast.show({ type: "error", text1: "Email sai định dạng", text2: "Vui lòng nhập email hợp lệ." });
      return;
    }

    if (!/^[0-9]{10}$/.test(numberPhone)) {
      Toast.show({ type: "error", text1: "Số điện thoại không hợp lệ", text2: "Số điện thoại phải gồm đúng 10 chữ số." });
      return;
    }

    if (password.length < 6) {
      Toast.show({ type: "error", text1: "Mật khẩu yếu", text2: "Mật khẩu phải có ít nhất 6 ký tự." });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Xác nhận mật khẩu sai", text2: "Mật khẩu xác nhận không khớp." });
      return;
    }

    const response = await signUp({
      full_name: fullName.trim(),
      email: email.trim(),
      numberPhone: numberPhone.trim(),
      password: password.trim(),
    });

    if (response.success) {
      Toast.show({
        type: "success",
        text1: "🎉 Đăng ký thành công",
        text2: "Hãy kiểm tra email để lấy mã OTP.",
      });

      setTimeout(() => {
        router.push({
          pathname: "/(auth)/verify-otp",
          params: { numberPhone: numberPhone.trim() },
        });
      }, 900);
    } else {
      Toast.show({
        type: "error",
        text1: "Đăng ký thất bại",
        text2: response.message,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Nền illustration */}
      <ImageBackground
        source={require("../../assets/images/bg-blur.png")}
        style={styles.bg}
        resizeMode="contain"
        imageStyle={{ opacity: 0.15 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* FORM CARD */}
          <View style={styles.card}>
            <Text style={styles.title}>Đăng ký tài khoản</Text>

            <Text style={styles.label}>Họ và tên</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={numberPhone}
              onChangeText={setNumberPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.signUpButtonText}>Đăng ký</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản?</Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Đăng nhập</Text>
                </TouchableOpacity>
              </Link>
            </View>

          </View>

        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },

  bg: { flex: 1, paddingHorizontal: 22, paddingTop: 60 },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 26,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 60,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 22,
    color: "#222",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#444",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DCDCDC",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
    marginBottom: 14,
  },

  signUpButton: {
    backgroundColor: "#FFD600",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },

  signUpButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
  },

  footerText: { color: "#666" },

  linkText: {
    marginLeft: 5,
    color: "#FF8A00",
    fontWeight: "700",
  },
});
