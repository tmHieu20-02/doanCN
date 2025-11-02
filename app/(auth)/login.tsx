// app/(auth)/login.tsx

import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, ScrollView, Alert 
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Link, useRouter } from 'expo-router'; // <--- ĐÃ IMPORT useRouter

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const router = useRouter(); // <--- ĐÃ KHỞI TẠO router

  // Giả định dữ liệu demo để dễ kiểm tra
  const [email, setEmail] = useState('nguyenvana@gmail.com'); 
  const [password, setPassword] = useState('123456'); 

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    
    // Logic kiểm tra đăng nhập (sẽ được thay thế bằng API thật)
    if (email !== 'nguyenvana@gmail.com' || password !== '123456') {
        Alert.alert("Lỗi", "Thông tin đăng nhập không chính xác. (Sử dụng 'nguyenvana@gmail.com' và '123456' để đăng nhập mẫu)");
        return;
    }

    const success = await signIn(email, password);

    // XỬ LÝ ĐIỀU HƯỚNG
    if (success) {
      // NẾU THÀNH CÔNG, CHUYỂN HƯỚNG VÀO APP
      router.replace('/(tabs)'); 
    } else {
      // NẾU THẤT BẠI, HIỆN LỖI
      Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Chào mừng trở lại! 👋</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục sử dụng dịch vụ.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: nguyenvana@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={handleSignIn} 
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signInButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản?</Text>
            {/* Sửa link sang đường dẫn tuyệt đối */}
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                  <Text style={styles.linkText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 80,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  signInButton: {
    height: 54,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 4,
  },
  linkText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
});