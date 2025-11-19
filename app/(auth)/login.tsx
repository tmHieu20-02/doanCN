import React, { useState } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';

import { useAuth } from '@/hooks/useAuth'; // Kiểm tra lại đường dẫn import này nếu cần
import { Link, useRouter } from 'expo-router';
import { MotiView, MotiImage } from 'moti';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  
  // ✅ FIX 1: Chỉ lấy hàm signIn, tự tạo state loading riêng
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [numberPhone, setNumberPhone] = useState('');
  const [password, setPassword] = useState('');

  /* ===============================================================
                     LOGIN HANDLE (FINAL)
  ================================================================ */
  const handleSignIn = async () => {
    if (!numberPhone || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    // Validate số điện thoại
    if (!/^[0-9]{10}$/.test(numberPhone)) {
      Alert.alert('Lỗi', 'Số điện thoại phải gồm đúng 10 số.');
      return;
    }

    // Validate mật khẩu đơn giản
    if (password.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu quá ngắn.');
        return;
    }

    // Bắt đầu loading
    setIsLoading(true);

    try {
        // GỌI API LOGIN
        const result = await signIn({
            numberPhone: numberPhone.trim(),
            password: password.trim(),
        });

        if (result.success) {
            console.log("✅ Đăng nhập thành công! Đợi _layout chuyển trang...");
            
            // ✅ FIX 2: KHÔNG gọi router.replace ở đây.
            // Lý do: File _layout.tsx sẽ tự phát hiện User mới và chuyển vào Tabs.
            // Nếu gọi ở đây sẽ bị xung đột (Race Condition).
        } else {
            Alert.alert("Đăng nhập thất bại", result.message || "Kiểm tra lại thông tin.");
        }
    } catch (error) {
        Alert.alert("Lỗi", "Có lỗi hệ thống xảy ra.");
    } finally {
        // Tắt loading dù thành công hay thất bại
        setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>

          {/* HERO IMAGE */}
          <MotiView
            style={styles.heroWrapper}
            from={{ opacity: 0, translateY: -40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
          >
            {/* Lưu ý: Đảm bảo đường dẫn ảnh đúng */}
            <MotiImage
              source={require('../../assets/images/Login-rafiki.png')} 
              style={styles.heroImage}
              from={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ type: 'timing', duration: 800 }}
            />
          </MotiView>

          {/* TITLE */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100, duration: 500 }}
            style={styles.titleWrapper}
          >
            <Text style={styles.title}>Chào mừng trở lại!</Text>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
          </MotiView>

          {/* FORM */}
          <MotiView
            style={styles.card}
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 550, delay: 150 }}
          >
            {/* PHONE */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="phone-outline" size={22} color="#A88800" />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                placeholderTextColor="#9C8C4A"
                keyboardType="phone-pad"
                value={numberPhone}
                onChangeText={setNumberPhone}
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={22} color="#A88800" />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#9C8C4A"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity style={styles.forgotButton}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* LOGIN BUTTON */}
            <MotiView
              from={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 14, stiffness: 180, delay: 220 }}
            >
              <TouchableOpacity
                style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Đăng nhập</Text>
                )}
              </TouchableOpacity>
            </MotiView>
          </MotiView>

          {/* SOCIAL + FOOTER */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, duration: 500 }}
          >
            <Text style={styles.orText}>Hoặc tiếp tục với</Text>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <AntDesign name="facebook-square" size={26} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <AntDesign name="google" size={26} color="#DB4437" />
              </TouchableOpacity>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Chưa có tài khoản?</Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerText}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </MotiView>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =========================== STYLES =========================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  heroWrapper: {
    height: 250,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#FFE9A3',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  titleWrapper: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2A2A2A',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#6B6B6B',
  },
  card: {
    marginTop: 24,
    marginHorizontal: 24,
    padding: 22,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3D8A5',
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#2A2A2A',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
  },
  loginButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFCC00',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  loginButtonText: {
    color: '#222222',
    fontSize: 17,
    fontWeight: '700',
  },
  orText: {
    marginTop: 22,
    textAlign: 'center',
    color: '#7A7A7A',
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 26,
    gap: 20,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8D89A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  footerText: {
    color: '#7A7A7A',
    marginRight: 4,
    fontSize: 14,
  },
  registerText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '700',
  },
});