import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

// Cấu hình chung
const BASE_URL = "https://phatdat.store/api/v1/auth";
const USER_KEY = "my-user-session";

// Kiểu dữ liệu User
interface UserSession {
  token: string;
  id: number;
  numberPhone: string;
  roleId: string | number;
  [key: string]: any;
}

interface AuthResponse {
  success: boolean;
  data?: UserSession;
  message?: string;
}

interface AuthContextData {
  user: UserSession | null;
  isInitialized: boolean;
  isLoading: boolean; // ← BẮT BUỘC CÓ
  signIn: (params: { numberPhone: string; password: string }) => Promise<AuthResponse>;
  signUp: (params: { full_name: string; email: string; numberPhone: string; password: string }) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // ← ADD STATE

  // Load user từ SecureStore
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await SecureStore.getItemAsync(USER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log(">>> [AUTH] Khôi phục user:", parsed);
          setUser(parsed);
        }
      } catch (err) {
        console.log(">>> [AUTH] Lỗi load user:", err);
      } finally {
        setIsInitialized(true);
      }
    };
    loadUser();
  }, []);

  // LOGIN (ĐÃ FIX)
  const signIn = async ({ numberPhone, password }: { numberPhone: string; password: string }): Promise<AuthResponse> => {
    setIsLoading(true); // ← bật loading

    try {
      console.log(`>>> [AUTH] Đang login: ${BASE_URL}/login`);
      const res = await axios.post(`${BASE_URL}/login`, { numberPhone, password });

      console.log(">>> [AUTH] Server trả về:", res.data);

      // Lấy token
      let token = res.data?.access_token;
      if (!token) {
        return { success: false, message: "Không tìm thấy token từ server." };
      }

      // Loại chữ Bearer
      token = token.replace("Bearer ", "").trim();

      // Decode token
      const decoded: any = jwtDecode(token);
      console.log(">>> [AUTH] Token decode:", decoded);

      if (!decoded?.id || !decoded?.numberPhone) {
        return { success: false, message: "Token không chứa đủ thông tin người dùng." };
      }

      // Tạo session từ token
      const session: UserSession = {
        token,
        id: decoded.id,
        numberPhone: decoded.numberPhone,
        roleId: decoded.roleId,
      };

      // Lưu lại
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session));
      setUser(session);

      return { success: true, data: session };

    } catch (err) {
      const error = err as AxiosError;
      const msg =
        (error.response?.data as any)?.mes ||
        (error.response?.data as any)?.message ||
        "Đăng nhập thất bại.";

      console.log(">>> [AUTH] Lỗi login:", msg);
      return { success: false, message: msg };

    } finally {
      setIsLoading(false); // ← tắt loading
    }
  };

  // REGISTER
  const signUp = async (data: { full_name: string; email: string; numberPhone: string; password: string }) => {
    setIsLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/register`, data);
      const ok = res.data?.err === 0 || res.data?.success === true;

      return {
        success: ok,
        message: res.data?.mes || res.data?.message || (ok ? "Đăng ký thành công" : "Đăng ký thất bại"),
      };

    } catch (err) {
      const error = err as AxiosError;
      const msg = (error.response?.data as any)?.mes || "Lỗi kết nối server.";
      return { success: false, message: msg };

    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const signOut = async () => {
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitialized,
        isLoading,     // ← BẮT BUỘC TRUYỀN VÀO
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
