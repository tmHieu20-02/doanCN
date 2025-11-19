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
      Toast.show({
        type: "error",
        text1: "Thiếu thông tin",
        text2: "Vui lòng nhập đầy đủ tất cả các trường.",
      });
      return;
    }

    if (fullName.length < 3) {
      Toast.show({
        type: "error",
        text1: "Tên không hợp lệ",
        text2: "Tên phải có ít nhất 3 ký tự.",
      });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      Toast.show({
        type: "error",
        text1: "Email sai định dạng",
        text2: "Vui lòng nhập email hợp lệ.",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(numberPhone)) {
      Toast.show({
        type: "error",
        text1: "Số điện thoại không hợp lệ",
        text2: "Số điện thoại phải gồm đúng 10 chữ số.",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu yếu",
        text2: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Xác nhận mật khẩu sai",
        text2: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    const response = await signUp({
      full_name: fullName.trim(),
      email: email.trim(),
      numberPhone: numberPhone.trim(),
      password: password.trim(),
    });

    console.log("REGISTER RESPONSE FRONT:", response);

    if (response.success) {
      Toast.show({
        type: "success",
        text1: "🎉 Đăng ký thành công",
        text2: "Hãy kiểm tra email để lấy mã OTP.",
        position: "top",
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
        position: "top",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tạo tài khoản</Text>
        </View>

        <View style={styles.form}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: "#FFFDF5" },
  header: { marginTop: 50, marginBottom: 30 },
  title: { fontSize: 32, fontWeight: "800", color: "#2A2A2A" },
  form: { paddingBottom: 40 },
  label: { marginTop: 16, marginBottom: 5, fontSize: 15, color: "#6B6B6B", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#E3D8A5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    color: "#2A2A2A",
  },
  signUpButton: {
    backgroundColor: "#FFCC00",
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  signUpButtonText: {
    color: "#222222",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { marginRight: 5, color: "#6B6B6B" },
  linkText: { color: "#FF9800", fontWeight: "700" },
});
