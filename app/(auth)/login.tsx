import React, { useState, useRef, useEffect, Fragment } from "react";
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
  Platform,
  KeyboardAvoidingView,
  Animated,
} from "react-native";

import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/api";
import Toast from "react-native-toast-message";

import { useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AxiosError } from "axios";
import { getExpoPushToken } from "@/utils/pushToken";
import { registerDeviceToken } from "@/utils/registerDeviceToken";

// THAY THẾ MOTIVIEW và AnimatePresence BẰNG VIEW VÀ FRAGMENT
const MotiView = View;
const AnimatePresence = Fragment;

interface AuthParams {
  mode?: "login" | "forgot" | "register" | "verify" | "verify-reset" | "reset";
}

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, isLoading } = useAuth();

  const params: AuthParams = useLocalSearchParams() as AuthParams;
  const [mode, setMode] = useState<AuthParams['mode']>(params?.mode || "login");

  /* LOGIN STATES */
  const [numberPhone, setNumberPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /* FORGOT PASSWORD (inline) */
  const [fpPhone, setFpPhone] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  /* Shared for verify flows */
  const [verifyNumberPhone, setVerifyNumberPhone] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // For reset flow
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetOtp, setResetOtp] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Helper để kiểm tra độ mạnh mật khẩu
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { label: '', color: '#888' };
    if (pw.length < 6) return { label: 'Yếu', color: '#E53935' };
    if (pw.length < 10) return { label: 'Trung bình', color: '#FB8C00' };
    return { label: 'Mạnh', color: '#2E7D32' };
  };

  /* REGISTER */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [rgPhone, setRgPhone] = useState("");
  const [rgPassword, setRgPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const registerInputRefs = useRef<Array<TextInput | null>>([]);
  const [registerOtp, setRegisterOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [counterRegister, setCounterRegister] = useState(30);
  const [canResendRegister, setCanResendRegister] = useState(false);
  const [resendLoadingRegister, setResendLoadingRegister] = useState(false);
  const registerShakeAnim = useRef(new Animated.Value(0)).current;

  // Resend / timer states for reset OTP
  const [counterReset, setCounterReset] = useState(30);
  const [canResendReset, setCanResendReset] = useState(false);
  const [resendLoadingReset, setResendLoadingReset] = useState(false);
  const resetShakeAnim = useRef(new Animated.Value(0)).current;

  const handleSignIn = async () => {
  console.log("🔐 [LOGIN] START");

  if (!numberPhone || !password) {
    Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
    return;
  }
  if (!/^[0-9]{10}$/.test(numberPhone.trim())) {
    Alert.alert("Lỗi", "Số điện thoại phải gồm đúng 10 số.");
    return;
  }
  if (password.length < 6) {
    Alert.alert("Lỗi", "Mật khẩu quá ngắn.");
    return;
  }

  setLoginLoading(true);

  try {
    console.log("🔐 [LOGIN] CALL signIn()", {
      numberPhone: numberPhone.trim(),
    });

    const result = await signIn({
      numberPhone: numberPhone.trim(),
      password: password.trim(),
    });

    console.log("🔐 [LOGIN] signIn RESULT:", result);

    if (!result.success || !result.data) {
      console.log("❌ [LOGIN] FAILED:", result.message);
      Alert.alert(
        "Đăng nhập thất bại",
        result.message || "Kiểm tra lại thông tin."
      );
      return;
    }

    // ================= JWT LOG =================
    const accessToken = result.data.token;

    console.log("🟢 [LOGIN] SUCCESS");
    console.log("🟢 [LOGIN] USER ID:", result.data.id);
    console.log("🟢 [LOGIN] ROLE ID:", result.data.roleId);
    console.log("🟢 [LOGIN] JWT:", accessToken);

    if (!accessToken) {
      console.log("❌ [LOGIN] JWT IS NULL");
      return;
    }

    // ================= REGISTER DEVICE TOKEN =================
    try {
      console.log("📲 [PUSH] REGISTER DEVICE TOKEN START");

      await registerDeviceToken(accessToken);

      console.log("✅ [PUSH] REGISTER DEVICE TOKEN DONE");
    } catch (e: any) {
      console.log(
        "❌ [PUSH] REGISTER DEVICE TOKEN ERROR:",
        e?.response?.data || e.message
      );
    }
    // =========================================================

  } catch (err: any) {
    console.log("❌ [LOGIN] SYSTEM ERROR:", err?.message || err);
    Alert.alert("Lỗi", "Có lỗi hệ thống xảy ra.");
  } finally {
    setLoginLoading(false);
    console.log("🔐 [LOGIN] END");
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
        const tokenFromBody = res.data.reset_token ?? res.data.resetToken ?? res.data.token;
        if (!tokenFromBody) {
          Alert.alert('Lỗi', 'Server đã gửi OTP nhưng không trả về mã xác thực (reset token). Vui lòng thử lại.');
          return;
        }
        setResetToken(String(tokenFromBody));
        setVerifyNumberPhone(fpPhone.trim());
        setResetOtp("");
        setCounterReset(30);
        setCanResendReset(false);
        setMode("verify-reset");
      } else {
        Alert.alert("Lỗi", res.data.mes);
      }
    } catch (e) {
      const err = e as AxiosError;
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
    if (rgPassword !== confirmPassword) {
      Toast.show({ type: "error", text1: "Mật khẩu không khớp" });
      return;
    }

    setVerifyLoading(true);
    try {
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
        setVerifyNumberPhone(rgPhone.trim());
        setRegisterOtp(["", "", "", "", "", ""]);
        setCounterRegister(30);
        setCanResendRegister(false);
        setMode("verify");
      } else {
        Toast.show({ type: "error", text1: "Đăng ký thất bại", text2: response.message });
      }
    } catch (e) {
      Alert.alert("Lỗi hệ thống", "Đăng ký không thành công. Vui lòng thử lại.");
    } finally {
      setVerifyLoading(false);
    }
  };

  /* ====================== TIMER EFFECTS ====================== */
  useEffect(() => {
    let t: ReturnType<typeof setInterval> | undefined;
    if (mode === "verify" && !canResendRegister && counterRegister > 0) {
      t = setInterval(() => {
        setCounterRegister((prev) => {
          if (prev <= 1) {
            setCanResendRegister(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [mode, canResendRegister, counterRegister]);

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | undefined;
    if (mode === "verify-reset" && !canResendReset && counterReset > 0) {
      t = setInterval(() => {
        setCounterReset((prev) => {
          if (prev <= 1) {
            setCanResendReset(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [mode, canResendReset, counterReset]);

  // ====================== SHAKE HELPERS ======================
  const triggerShake = (shakeAnim: Animated.Value) => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Tối ưu hóa: Hàm chung xử lý input OTP
  const handleRegisterOtpChange = (text: string, idx: number) => {
    if (!/^[0-9]*$/.test(text)) return;
    const arr = [...registerOtp];
    arr[idx] = text.slice(-1);
    setRegisterOtp(arr);

    if (text) {
      if (idx < 5) registerInputRefs.current[idx + 1]?.focus();
    } else {
      if (idx > 0) registerInputRefs.current[idx - 1]?.focus();
    }
  };

  // Tối ưu hóa: Hàm xử lý xác minh OTP (Register)
  const handleVerifyRegister = async () => {
    const code = registerOtp.join('');
    if (code.length !== 6) { Alert.alert('Lỗi', 'OTP phải gồm 6 số'); triggerShake(registerShakeAnim); return; }
    setVerifyLoading(true);
    try {
      const res = await api.post('/auth/verify', { numberPhone: verifyNumberPhone, otp: code });

      if ((res.status >= 200 && res.status < 300) && (res.data?.err === 0 || res.data?.success === true || !res.data?.err)) {
        Toast.show({ type: 'success', text1: 'Xác minh OTP thành công' });
        setRegisterOtp(["", "", "", "", "", ""]);
        registerInputRefs.current = [];
        setTimeout(() => setMode('login'), 600);
      } else {
        triggerShake(registerShakeAnim);
        const message = res.data?.mes || res.data?.message || JSON.stringify(res.data) || 'Xác minh thất bại';
        Alert.alert('Xác minh OTP thất bại', String(message));
      }
    } catch (err: any) {
      triggerShake(registerShakeAnim);
      Alert.alert('Lỗi khi xác minh', 'Không thể xác minh OTP');
    } finally { setVerifyLoading(false); }
  };

  // Tối ưu hóa: Hàm xử lý xác minh OTP (Reset Password)
  const handleVerifyReset = async () => {
    if (!resetToken) {
      Alert.alert('Lỗi', 'Mã xác thực nội bộ (reset token) không tồn tại. Hãy gửi lại mã OTP hoặc bắt đầu lại luồng Quên mật khẩu.');
      setMode('forgot');
      return;
    }
    if (resetOtp.length !== 6) {
      Alert.alert('Lỗi', 'OTP phải gồm 6 số');
      triggerShake(resetShakeAnim);
      return;
    }
    setResetLoading(true);

    const verificationBody = { otp: resetOtp };
    const verificationHeaders = { Authorization: `Bearer ${resetToken}` };

    try {
      const r = await api.post('/auth/verify-reset-otp', verificationBody, { headers: verificationHeaders });

      if ((r.status >= 200 && r.status < 300) && (r.data?.err === 0 || r.data?.success === true || !r.data?.err)) {
        Toast.show({ type: 'success', text1: 'Xác minh OTP thành công' });
        setTimeout(() => setMode('reset'), 300);
        return;
      } else {
        throw new Error(r.data?.mes || r.data?.message || 'Xác minh thất bại');
      }
    } catch (e: any) {
      try {
        const rBody = await api.post('/auth/verify-reset-otp', { ...verificationBody, reset_token: resetToken });
        if ((rBody.status >= 200 && rBody.status < 300) && (rBody.data?.err === 0 || rBody.data?.success === true || !rBody.data?.err)) {
          Toast.show({ type: 'success', text1: 'Xác minh OTP thành công' });
          setTimeout(() => setMode('reset'), 300);
          return;
        }
        throw new Error(rBody.data?.mes || rBody.data?.message || 'Xác minh thất bại');
      } catch (eBody: any) {
        triggerShake(resetShakeAnim);
        const message = eBody?.response?.data?.mes || eBody?.response?.data?.message || eBody?.message || 'Xác minh thất bại';
        Alert.alert('Xác minh OTP thất bại', String(message));
      }
    } finally { setResetLoading(false); }
  };

  // Tối ưu hóa: Hàm xử lý đổi mật khẩu
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (newPassword !== confirmNewPassword) { Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp'); return; }

    setResetPasswordLoading(true);

    try {
      const res = await api.post('/auth/reset-password', { newPassword }, { headers: { Authorization: `Bearer ${resetToken}` } });

      if (res.data?.err === 0) {
        Toast.show({ type: 'success', text1: 'Đổi mật khẩu thành công' });
        setNewPassword('');
        setConfirmNewPassword('');
        setResetToken(null);
        setVerifyNumberPhone('');
        setMode('login');
      } else {
        Alert.alert('Lỗi', res.data?.mes || 'Không thể đổi mật khẩu');
      }
    } catch (e: any) {
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu');
    } finally { setResetPasswordLoading(false); }
  };


  /* ============================= RENDER ============================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <LinearGradient colors={["#FFE9A3", "#FFE29B", "#FFD98A"]} style={styles.header}>
              <Text style={styles.headerTitle}>
                {mode === "login" && "Đăng nhập để tiếp tục"}
                {mode === "forgot" && "Quên mật khẩu"}
                {mode === "register" && "Tạo tài khoản mới"}
                {(mode === "verify" || mode === "verify-reset") && "Xác minh tài khoản"}
                {mode === "reset" && "Đặt mật khẩu mới"}
              </Text>

              <Image
                source={require("../../assets/images/Login-rafiki.png")}
                style={styles.headerImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </View>

          {/* ================== CONTENT ================== */}
          <View style={styles.formArea}>
            <AnimatePresence>

              {/* ================= LOGIN FORM ================= */}
              {mode === "login" && (
                <MotiView
                  key="loginForm"
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
  <View style={styles.socialBtn}><AntDesign name={"apple1" as any} size={24} color="#000" /></View>
  <View style={styles.socialBtn}><AntDesign name="google" size={24} color="#DB4437" /></View>
  <View style={styles.socialBtn}><AntDesign name={"facebook-square" as any} size={24} color="#4267B2" /></View>
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

              {/* ================= REGISTER FORM ================= */}
              {mode === "register" && (
                <MotiView
                  key="registerForm"
                  style={styles.card}
                >
                  <Text style={styles.title}>Đăng ký tài khoản</Text>
                  <Text style={styles.subtitle}>Nhập thông tin của bạn bên dưới</Text>

                  <Text style={styles.label}>Họ và tên</Text>
                  <TextInput
                    style={[styles.inputWrapper, { paddingHorizontal: 14, marginBottom: 10 }]}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Nhập họ tên"
                    placeholderTextColor="#999"
                  />

                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[styles.inputWrapper, { paddingHorizontal: 14, marginBottom: 10 }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Nhập email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                  />

                  <Text style={styles.label}>Số điện thoại</Text>
                  <TextInput
                    style={[styles.inputWrapper, { paddingHorizontal: 14, marginBottom: 10 }]}
                    value={rgPhone}
                    onChangeText={setRgPhone}
                    placeholder="Nhập số điện thoại"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.label}>Mật khẩu</Text>
                  <TextInput
                    style={[styles.inputWrapper, { paddingHorizontal: 14, marginBottom: 10 }]}
                    secureTextEntry
                    value={rgPassword}
                    onChangeText={setRgPassword}
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#999"
                  />

                  <Text style={styles.label}>Xác nhận mật khẩu</Text>
                  <TextInput
                    style={[styles.inputWrapper, { paddingHorizontal: 14, marginBottom: 10 }]}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#999"
                  />

                  <TouchableOpacity
                    style={[styles.signUpButton, verifyLoading && { opacity: 0.6 }]}
                    disabled={verifyLoading}
                    onPress={handleSignUp}
                  >
                    {verifyLoading ? (
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

              {/* ================= VERIFY (REGISTER) ================= */}
              {mode === "verify" && (
                <MotiView
                  key="verifyForm"
                  style={styles.card}
                >
                  <Text style={styles.formTitle}>Xác minh OTP</Text>
                  <Text style={styles.formSubtitle}>Mã OTP đã được gửi tới {verifyNumberPhone}</Text>

                  <Animated.View style={[styles.otpContainer, { transform: [{ translateX: registerShakeAnim }] }]}>
                    {registerOtp.map((val, idx) => (
                      <TextInput
                        key={idx}
                        ref={(ref) => { registerInputRefs.current[idx] = ref as TextInput; }}
                        style={styles.otpBox}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={val}
                        onChangeText={(text) => handleRegisterOtpChange(text, idx)}
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === 'Backspace' && !registerOtp[idx] && idx > 0) {
                            registerInputRefs.current[idx - 1]?.focus();
                          }
                        }}
                      />
                    ))}
                  </Animated.View>

                  <TouchableOpacity style={[styles.loginButton, verifyLoading && { opacity: 0.6 }]} onPress={handleVerifyRegister}>
                    <Text style={styles.loginButtonText}>{verifyLoading ? 'Đang xác minh...' : 'Xác minh'}</Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 10, alignItems: 'center' }}>
                    <TouchableOpacity disabled={!canResendRegister || resendLoadingRegister} onPress={async () => {
                      Alert.alert('Thông báo', 'Hệ thống chưa hỗ trợ gửi lại mã OTP cho đăng ký. Vui lòng thử lại sau 30s.');
                      setCounterRegister(30);
                      setCanResendRegister(false);
                      setResendLoadingRegister(false);
                    }} style={{ padding: 6 }}>
                      <Text style={{ color: canResendRegister ? '#000' : '#aaa', fontWeight: '700' }}>{resendLoadingRegister ? 'Đang gửi...' : (canResendRegister ? 'Gửi lại mã OTP' : `Gửi lại sau ${counterRegister}s`)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { setMode('register'); }} style={{ alignSelf: 'center' }}>
                      <Text style={{ color: '#333', fontWeight: '600' }}>Quay lại Đăng ký</Text>
                    </TouchableOpacity>
                  </View>
                </MotiView>
              )}

              {/* ================= VERIFY RESET (FORGOT) ================= */}
              {mode === 'verify-reset' && (
                <MotiView
                  key="verifyReset"
                  style={styles.card}
                >
                  <Text style={styles.formTitle}>Xác minh OTP</Text>
                  <Text style={styles.formSubtitle}>Mã OTP đã được gửi tới {verifyNumberPhone}</Text>

                  <Animated.View style={{ marginTop: 12, transform: [{ translateX: resetShakeAnim }] }}>
                    <TextInput
                      placeholder="Nhập OTP (6 số)"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={resetOtp}
                      onChangeText={setResetOtp}
                      style={styles.inputWrapper}
                    />

                    <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#666' }}>{canResendReset ? 'Bạn có thể gửi lại mã OTP' : `Gửi lại sau ${counterReset}s`}</Text>
                      <TouchableOpacity disabled={!canResendReset || resendLoadingReset} onPress={async () => {
                        if (!canResendReset) return;
                        setResendLoadingReset(true);
                        try {
                          const res = await api.post('/auth/forgot-password', { numberPhone: verifyNumberPhone });
                          if (res.data?.err === 0) {
                            const tokenFromBody = res.data.reset_token ?? res.data.resetToken ?? res.data.token;
                            if (!tokenFromBody) {
                              Alert.alert('Lỗi', 'Server đã xác nhận nhưng không trả về mã xác thực. Vui lòng thử lại sau.');
                              return;
                            }
                            setResetToken(String(tokenFromBody));
                            setResetOtp('');
                            setCounterReset(30);
                            setCanResendReset(false);
                            Toast.show({ type: 'success', text1: 'Mã OTP đã được gửi lại' });
                          } else {
                            Alert.alert('Lỗi', res.data?.mes || 'Không thể gửi lại OTP');
                          }
                        } catch (err) {
                          Alert.alert('Lỗi', 'Không thể gửi lại mã OTP');
                        } finally { setResendLoadingReset(false); }
                      }}>
                        <Text style={{ color: canResendReset ? '#000' : '#aaa', fontWeight: '700' }}>{resendLoadingReset ? 'Đang gửi...' : 'Gửi lại'}</Text>
                      </TouchableOpacity>
                    </View>
                  </Animated.View>

                  <TouchableOpacity style={[styles.loginButton, resetLoading && { opacity: 0.6 }]} onPress={handleVerifyReset}>
                    <Text style={styles.loginButtonText}>{resetLoading ? 'Đang xác minh...' : 'Xác minh'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setMode('forgot')} style={{ alignSelf: 'center', marginTop: 12 }}>
                    <Text style={{ color: '#333', fontWeight: '600' }}>Quay lại Quên mật khẩu</Text>
                  </TouchableOpacity>
                </MotiView>
              )}

              {/* ================= RESET PASSWORD (INLINE) ================= */}
              {mode === 'reset' && (
                <MotiView
                  key="resetForm"
                  style={styles.card}
                >
                  <Text style={styles.formTitle}>Đặt mật khẩu mới</Text>
                  <Text style={styles.formSubtitle}>Tạo mật khẩu mới cho tài khoản của bạn</Text>

                  <Text style={styles.label}>Mật khẩu mới</Text>
                  <View style={[styles.inputWrapper]}>
                    <TextInput
                      placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                      placeholderTextColor="#999"
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      style={[styles.input, { marginLeft: 0 }]}
                    />
                    <TouchableOpacity onPress={() => setShowNewPassword((s) => !s)} style={{ paddingHorizontal: 6 }}>
                      <MaterialCommunityIcons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.label, { marginTop: 8 }]}>Xác nhận mật khẩu</Text>
                  <View style={[styles.inputWrapper]}>
                    <TextInput
                      placeholder="Nhập lại mật khẩu"
                      placeholderTextColor="#999"
                      secureTextEntry={!showNewPassword}
                      value={confirmNewPassword}
                      onChangeText={setConfirmNewPassword}
                      style={[styles.input, { marginLeft: 0 }]}
                    />
                  </View>

                  {/* password strength */}
                  {newPassword ? (
                    <Text style={{ marginTop: 6, marginBottom: 6, fontWeight: '700', color: getPasswordStrength(newPassword).color }}>
                      Độ mạnh mật khẩu: {getPasswordStrength(newPassword).label}
                    </Text>
                  ) : null}

                  <TouchableOpacity style={[styles.loginButton, resetPasswordLoading && { opacity: 0.6 }]} onPress={handleResetPassword}>
                    <Text style={styles.loginButtonText}>{resetPasswordLoading ? 'Đang cập nhật...' : 'Xác nhận'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setMode('login')} style={{ alignSelf: 'center', marginTop: 12 }}>
                    <Text style={{ color: '#333', fontWeight: '600' }}>Quay lại Đăng nhập</Text>
                  </TouchableOpacity>
                </MotiView>
              )}

            </AnimatePresence>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  headerContainer: { position: 'relative', overflow: 'hidden' },
  header: {
    height: 280,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 50,
    alignItems: "center",
    overflow: 'hidden',
    position: 'relative',
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  otpBox: {
    width: 48,
    height: 56,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E3D8A5',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#2A2A2A',
  },

});