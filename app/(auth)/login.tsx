import React, { useState, useRef, useEffect } from "react";
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

import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, AnimatePresence } from "moti";
import { Animated } from 'react-native';
import { AxiosError } from "axios";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signUp, isLoading } = useAuth();

  // Nếu có query param mode=register từ welcome screen, bật form register
  const params: any = useLocalSearchParams();
  const [mode, setMode] = useState(params?.mode ? String(params.mode) : "login"); // login | forgot | register

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
  const registerInputRefs = useRef<any[]>([]);
  const [registerOtp, setRegisterOtp] = useState<string[]>(["", "", "", "", "", ""]);
  // Resend / timer states for registration OTP
  const [counterRegister, setCounterRegister] = useState(30);
  const [canResendRegister, setCanResendRegister] = useState(false);
  const [resendLoadingRegister, setResendLoadingRegister] = useState(false);
  const registerShakeAnim = useRef(new Animated.Value(0)).current;

  // Resend / timer states for reset OTP
  const [counterReset, setCounterReset] = useState(30);
  const [canResendReset, setCanResendReset] = useState(false);
  const [resendLoadingReset, setResendLoadingReset] = useState(false);
  const resetShakeAnim = useRef(new Animated.Value(0)).current;

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

      console.log('FORGOT-PW RESP:', res.status, res.data);

      if (res.data.err === 0) {
        // server can return either reset_token or resetToken
        const tokenFromBody = res.data.reset_token ?? res.data.resetToken ?? res.data.resetToken;
        if (!tokenFromBody) {
          console.warn('No reset token in response (reset_token or resetToken)', res.data);
          Alert.alert('Lỗi', 'Server đã gửi OTP nhưng không trả về mã xác thực (reset token). Vui lòng thử lại.');
          return;
        }
        // keep the reset flow inline inside this screen
        setResetToken(String(tokenFromBody));
        setVerifyNumberPhone(fpPhone.trim());
        setResetOtp("");
        setMode("verify-reset");
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

      // Mở màn xác minh OTP ngay trong login (inline)
      setVerifyNumberPhone(rgPhone.trim());
      setRegisterOtp(["", "", "", "", "", ""]);
      setMode("verify");
    } else {
      Toast.show({ type: "error", text1: "Đăng ký thất bại", text2: response.message });
    }
  };

  // ====================== TIMER EFFECTS ======================
  useEffect(() => {
    let t: ReturnType<typeof setInterval> | undefined;
    if (mode === "verify" && !canResendRegister) {
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
  }, [mode, canResendRegister]);

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | undefined;
    if (mode === "verify-reset" && !canResendReset) {
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
  }, [mode, canResendReset]);

  // ====================== SHAKE HELPERS ======================
  const triggerShakeRegister = () => {
    Animated.sequence([
      Animated.timing(registerShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(registerShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(registerShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(registerShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const triggerShakeReset = () => {
    Animated.sequence([
      Animated.timing(resetShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(resetShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(resetShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(resetShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  /* ============================= RENDER ============================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <LinearGradient colors={["#FFE9A3", "#FFE29B", "#FFD98A"]} style={styles.header}>
            {/* Animated Decorative Shapes */}
            {/* keep header simple with title + image */}

            {/* Main Content */}
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
        </View>

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

            {/* ================= VERIFY (REGISTER) ================= */}
            {mode === "verify" && (
              <MotiView
                key="verifyForm"
                from={{ opacity: 0, translateY: 40 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -40 }}
                transition={{ duration: 300 }}
                style={styles.card}
              >
                <Text style={styles.formTitle}>Xác minh OTP</Text>
                <Text style={styles.formSubtitle}>Mã OTP đã được gửi tới {verifyNumberPhone}</Text>

                <Animated.View style={[styles.otpContainer, { transform: [{ translateX: registerShakeAnim }] }]}> 
                  {registerOtp.map((val, idx) => (
                    <TextInput
                      key={idx}
                      ref={(ref) => { if (ref) registerInputRefs.current[idx] = ref; }}
                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={val}
                      onChangeText={(text) => {
                        if (!/^[0-9]*$/.test(text)) return;
                        const arr = [...registerOtp];
                        arr[idx] = text;
                        setRegisterOtp(arr);
                        if (text && idx < 5) registerInputRefs.current[idx + 1]?.focus();
                        if (!text && idx > 0) registerInputRefs.current[idx - 1]?.focus();
                      }}
                    />
                  ))}
                </Animated.View>

                <TouchableOpacity style={[styles.loginButton, verifyLoading && { opacity: 0.6 }]} onPress={async () => {
                  const code = registerOtp.join('');
                  if (code.length !== 6) { Alert.alert('Lỗi', 'OTP phải gồm 6 số'); return; }
                  setVerifyLoading(true);
                  try {
                    const res = await api.post('/auth/verify', { numberPhone: verifyNumberPhone, otp: code });
                    console.log('VERIFY RESP:', res.status, res.data);

                    // handle success strictly using response codes and error fields
                    if ((res.status >= 200 && res.status < 300) && (res.data?.err === 0 || res.data?.success === true || !res.data?.err)) {
                      Toast.show({ type: 'success', text1: 'Xác minh OTP thành công' });
                      setRegisterOtp(["", "", "", "", "", ""]);
                      registerInputRefs.current = [];
                      setTimeout(() => setMode('login'), 600);
                    } else {
                      triggerShakeRegister();
                      const message = res.data?.mes || res.data?.message || JSON.stringify(res.data) || 'Xác minh thất bại';
                      console.warn('VERIFY FAIL:', res.status, res.data);
                      Alert.alert('Xác minh OTP thất bại', String(message));
                    }
                  } catch (err: any) {
                    // better diagnostics in catch
                    const resp = err?.response?.data;
                    console.error('VERIFY ERROR (catch):', err?.response ?? err);
                    triggerShakeRegister();
                    const friendly = resp?.mes || resp?.message || JSON.stringify(resp) || (err?.message || 'Không thể xác minh OTP');
                    Alert.alert('Lỗi khi xác minh', String(friendly));
                  } finally { setVerifyLoading(false); }
                }}>
                  <Text style={styles.loginButtonText}>{verifyLoading ? 'Đang xác minh...' : 'Xác minh'}</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12, gap: 10, alignItems: 'center' }}>
                  <TouchableOpacity disabled={!canResendRegister || resendLoadingRegister} onPress={async () => {
                    if (!canResendRegister) return;
                    setResendLoadingRegister(true);
                    try {
                      // backend doesn't support resend for register in this project (keeps original behavior)
                      Alert.alert('Thông báo', 'Backend chưa hỗ trợ gửi lại mã OTP cho đăng ký.');
                    } catch (err) {
                      Alert.alert('Lỗi', 'Không thể gửi lại OTP.');
                    } finally {
                      setResendLoadingRegister(false);
                      setCounterRegister(30);
                      setCanResendRegister(false);
                    }
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
                from={{ opacity: 0, translateY: 40 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -40 }}
                transition={{ duration: 300 }}
                style={styles.card}
              >
                <Text style={styles.formTitle}>Xác minh OTP</Text>
                <Text style={styles.formSubtitle}>Mã OTP đã được gửi tới {verifyNumberPhone}</Text>

                <Animated.View style={{ marginTop: 12, transform: [{ translateX: resetShakeAnim }] }}>
                  <TextInput
                    placeholder="Nhập OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={resetOtp}
                    onChangeText={setResetOtp}
                    style={styles.input}
                  />

                  <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#666' }}>{canResendReset ? 'Bạn có thể gửi lại mã OTP' : `Gửi lại sau ${counterReset}s`}</Text>
                    <TouchableOpacity disabled={!canResendReset || resendLoadingReset} onPress={async () => {
                      if (!canResendReset) return;
                      setResendLoadingReset(true);
                      try {
                        const res = await api.post('/auth/forgot-password', { numberPhone: verifyNumberPhone });
                        if (res.data?.err === 0) {
                          const tokenFromBody = res.data.reset_token ?? res.data.resetToken ?? res.data.resetToken;
                          if (!tokenFromBody) {
                            console.warn('RESEND RESET: server returned err===0 but no reset token', res.data);
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
                        console.log('RESEND RESET ERR', err);
                        Alert.alert('Lỗi', 'Không thể gửi lại mã OTP');
                      } finally { setResendLoadingReset(false); }
                    }}>
                      <Text style={{ color: canResendReset ? '#000' : '#aaa', fontWeight: '700' }}>{resendLoadingReset ? 'Đang gửi...' : 'Gửi lại'}</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>

                <TouchableOpacity style={[styles.loginButton, resetLoading && { opacity: 0.6 }]} onPress={async () => {
                  if (!resetToken) { Alert.alert('Lỗi', 'Mã xác thực nội bộ (reset token) không tồn tại. Hãy gửi lại mã OTP hoặc bắt đầu lại luồng Quên mật khẩu.'); setMode('forgot'); return; }
                  if (resetOtp.length !== 6) { Alert.alert('Lỗi', 'OTP phải gồm 6 số'); return; }
                  setResetLoading(true);
                  try {
                    // Try different token key names in case backend is inconsistent
                    const candidateKeys = ["reset_token", "resetToken", "token"];
                    let lastResp: any = null;
                    let ok = false;
                    for (const key of candidateKeys) {
                      try {
                        const body: any = { otp: resetOtp };
                        body[key] = resetToken;
                        const r = await api.post('/auth/verify-reset-otp', body);
                        console.log('VERIFY-RESET ATTEMPT:', key, r.status, r.data);
                        lastResp = r;
                        if ((r.status >= 200 && r.status < 300) && (r.data?.err === 0 || r.data?.success === true || !r.data?.err)) {
                          ok = true;
                          break;
                        }
                        // if server rejected field specifically, check message and continue
                      } catch (eAttempt: any) {
                        console.log('ATTEMPT ERROR for key', key, eAttempt?.response?.data ?? eAttempt?.message ?? eAttempt);
                        lastResp = eAttempt?.response ?? eAttempt;
                        // continue trying next key
                      }
                    }

                    if (ok) {
                      Toast.show({ type: 'success', text1: 'Xác minh OTP thành công' });
                      setTimeout(() => setMode('reset'), 300);
                    } else {
                      // final attempt: try sending token as Bearer Authorization header
                      try {
                        const r = await api.post('/auth/verify-reset-otp', { otp: resetOtp }, { headers: { Authorization: `Bearer ${resetToken}` } });
                        console.log('VERIFY-RESET ATTEMPT with Authorization header:', r.status, r.data);
                        if ((r.status >= 200 && r.status < 300) && (r.data?.err === 0 || r.data?.success === true || !r.data?.err)) {
                          Toast.show({ type: 'success', text1: 'Xác minh OTP thành công' });
                          setTimeout(() => setMode('reset'), 300);
                          setResetLoading(false);
                          return;
                        }
                        lastResp = r;
                      } catch (hdrErr: any) {
                        console.log('Header attempt failed', hdrErr?.response?.data ?? hdrErr?.message ?? hdrErr);
                        lastResp = hdrErr?.response ?? hdrErr;
                      }
                      triggerShakeReset();
                      const message = lastResp?.data?.mes || lastResp?.data?.message || JSON.stringify(lastResp?.data || lastResp) || 'Xác minh thất bại';
                      console.warn('VERIFY-RESET ALL ATTEMPTS FAILED:', lastResp);
                      Alert.alert('Xác minh OTP thất bại', String(message));
                    }
                  } finally { setResetLoading(false); }
                }}>
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
                from={{ opacity: 0, translateY: 40 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -40 }}
                transition={{ duration: 300 }}
                style={styles.card}
              >
                <Text style={styles.formTitle}>Đặt mật khẩu mới</Text>
                <Text style={styles.formSubtitle}>Tạo mật khẩu mới cho tài khoản của bạn</Text>

                <Text style={styles.label}>Mật khẩu mới</Text>
                <View style={[styles.inputWrapper, { paddingHorizontal: 12 }] }>
                  <TextInput
                    placeholder="Mật khẩu mới"
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
                <View style={[styles.inputWrapper, { paddingHorizontal: 12 }] }>
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

                <TouchableOpacity style={[styles.loginButton, resetPasswordLoading && { opacity: 0.6 }]} onPress={async () => {
                  if (!newPassword || newPassword.length < 6) { Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự'); return; }
                  if (newPassword !== confirmNewPassword) { Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp'); return; }
                  setResetPasswordLoading(true);
                  try {
                    const res = await api.post('/auth/reset-password', { newPassword }, { headers: { Authorization: `Bearer ${resetToken}` } });
                    if (res.data?.err === 0) {
                      Toast.show({ type: 'success', text1: 'Đổi mật khẩu thành công' });
                      // clear state and return to login
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setResetToken(null);
                      setVerifyNumberPhone('');
                      setMode('login');
                    } else {
                      Alert.alert('Lỗi', res.data?.mes || 'Không thể đổi mật khẩu');
                    }
                  } catch (e: any) {
                    console.log('RESET PASSWORD ERROR:', e.response?.data || e);
                    Alert.alert('Lỗi', 'Không thể đổi mật khẩu');
                  } finally { setResetPasswordLoading(false); }
                }}>
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
