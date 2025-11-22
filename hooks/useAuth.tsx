import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { router } from "expo-router";

// =============================
// CONFIG
// =============================
const BASE_URL = "https://phatdat.store/api/v1/auth";
const USER_KEY = "my-user-session";

// =============================
// TYPES
// =============================
interface UserSession {
  token: string;          // luôn dạng "Bearer eyxxxx"
  id: number;
  numberPhone: string;
  roleId: number;
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
  isLoading: boolean;

  signIn: (params: {
    numberPhone: string;
    password: string;
  }) => Promise<AuthResponse>;

  signUp: (params: {
    full_name: string;
    email: string;
    numberPhone: string;
    password: string;
  }) => Promise<{ success: boolean; message: string }>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// =============================
// PROVIDER
// =============================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load user đã lưu trong SecureStore
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

  // =============================
  // LOGIN
  // =============================
  const signIn = async ({
    numberPhone,
    password,
  }: {
    numberPhone: string;
    password: string;
  }): Promise<AuthResponse> => {
    setIsLoading(true);

    try {
      console.log(`>>> [AUTH] Đang login: ${BASE_URL}/login`);
      const res = await axios.post(`${BASE_URL}/login`, { numberPhone, password });

      console.log(">>> [AUTH] Server trả về:", res.data);

      // BE trả: access_token = "Bearer eyJhbGciOi..."
      const token = res.data?.access_token;
      if (!token) return { success: false, message: "Không tìm thấy token từ server." };

      console.log(">>> TOKEN NHẬN TỪ SERVER:", token);

      // Decode: bỏ chữ Bearer
      const decoded: any = jwtDecode(token.replace("Bearer ", ""));
      console.log(">>> [AUTH] Token decode:", decoded);

      if (!decoded?.id || !decoded?.numberPhone)
        return { success: false, message: "Token không chứa đủ thông tin." };

      const roleIdNumber = Number(decoded.roleId);

      // Lưu session đầy đủ
      const session: UserSession = {
        token,  // giữ nguyên Bearer
        id: decoded.id,
        numberPhone: decoded.numberPhone,
        roleId: roleIdNumber,
      };

      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session));
      setUser(session);

      console.log(">>> TOKEN SAU LƯU:", session.token);

      // Điều hướng
      if (roleIdNumber === 2) router.replace("/staff" as never);
      else if (roleIdNumber === 3) router.replace("/(tabs)" as never);
      else if (roleIdNumber === 1) console.log(">>> Admin – login tại web");

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
      setIsLoading(false);
    }
  };

  // =============================
  // REGISTER
  // =============================
  const signUp = async (data: {
    full_name: string;
    email: string;
    numberPhone: string;
    password: string;
  }) => {
    setIsLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/register`, data);

      const ok = res.data?.err === 0 || res.data?.success === true;

      return {
        success: ok,
        message:
          res.data?.mes ||
          res.data?.message ||
          (ok ? "Đăng ký thành công" : "Đăng ký thất bại"),
      };
    } catch (err) {
      const error = err as AxiosError;
      const msg = (error.response?.data as any)?.mes || "Lỗi kết nối server.";
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  // =============================
  // LOGOUT
  // =============================
  const signOut = async () => {
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
  };

  // =============================
  // RETURN CONTEXT
  // =============================
  return (
    <AuthContext.Provider
      value={{
        user,
        isInitialized,
        isLoading,
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
