import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { router } from "expo-router";

const BASE_URL = "https://phatdat.store/api/v1/auth";
const USER_KEY = "my-user-session";

interface UserSession {
  token: string;
  id: number;
  numberPhone: string;
  roleId: number;
  full_name?: string | null;
  gender?: string | null;
  avatar?: string | null;
  email?: string | null;
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
  signIn: (params: { numberPhone: string; password: string }) => Promise<AuthResponse>;
  signUp: (params: any) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<UserSession>) => Promise<void>;   // ⭐ giữ nguyên
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* ===============================
        LOAD USER LẦN ĐẦU
  =============================== */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await SecureStore.getItemAsync(USER_KEY);
        if (stored) setUser(JSON.parse(stored));
      } finally {
        setIsInitialized(true);
      }
    };
    loadUser();
  }, []);

  /* ===============================
        UPDATE USER (GIỮ LOGIC NGUYÊN)
  =============================== */
  const updateUser = async (data: Partial<UserSession>) => {
    // update thẳng vào React Context
    setUser((prev) => (prev ? { ...prev, ...data } : prev));

    // update SecureStore
    const stored = await SecureStore.getItemAsync(USER_KEY);
    if (stored) {
      const oldData = JSON.parse(stored);
      const newData = { ...oldData, ...data };
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newData));
    }

    // ❌ KHÔNG refreshUser() — vì nó sẽ load lại bản cũ và phá avatar mới
    // await refreshUser();  ← xoá hoàn toàn dòng này
  };

  /* ===============================
        SIGN IN
  =============================== */
  const signIn = async ({
    numberPhone,
    password,
  }: {
    numberPhone: string;
    password: string;
  }): Promise<AuthResponse> => {

    setIsLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/login`, {
        numberPhone,
        password,
      });

      const rawToken = res.data?.access_token;
      const token = rawToken?.replace("Bearer ", "");

      if (!token) return { success: false, message: "Không tìm thấy token." };

      const decoded: any = jwtDecode(token);
      const backendUser = res.data?.user || {};

      const session: UserSession = {
        token,
        id: decoded.id,
        numberPhone: decoded.numberPhone,
        roleId: Number(decoded.roleId),
        full_name: backendUser.full_name || null,
        gender: backendUser.gender || null,
        avatar: backendUser.avatar || null,
      };

      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session));
      setUser(session);

      if (session.roleId === 2) router.replace("/staff");
      else router.replace("/(tabs)");

      return { success: true, data: session };
    } catch (err) {
      const error = err as AxiosError;
      const msg =
        (error.response?.data as any)?.mes ||
        (error.response?.data as any)?.message ||
        "Đăng nhập thất bại.";
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
        SIGN UP
  =============================== */
  const signUp = async (data: any) => {
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
    } catch {
      return { success: false, message: "Lỗi kết nối server." };
    } finally {
      setIsLoading(false);
    }
  };

  /* ===============================
        SIGN OUT
  =============================== */
  const signOut = async () => {
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
    router.replace("/(auth)/login");
  };

  /* ===============================
        REFRESH USER
  =============================== */
  const refreshUser = async () => {
    const stored = await SecureStore.getItemAsync(USER_KEY);
    if (stored) setUser(JSON.parse(stored));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitialized,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
        updateUser,  // ⭐ giữ nguyên
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
