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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /* =======================================================================
        1. LOAD USER TỪ SECURESTORE + FETCH CURRENT USER SAU ĐĂNG NHẬP
  ======================================================================== */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await SecureStore.getItemAsync(USER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);

          // 🔥 QUAN TRỌNG: FETCH LẠI PROFILE ĐẦY ĐỦ
          await fetchCurrentUser(parsed.token);
        }
      } catch (err) {
        console.log(">>> [AUTH] Lỗi load user:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    loadUser();
  }, []);

  /* =======================================================================
        2. FETCH CURRENT PROFILE (TÊN + AVATAR + GENDER)
  ======================================================================== */
  const fetchCurrentUser = async (token: string) => {
    try {
      // Nếu backend chưa có API → bỏ qua (không gây crash)
      const res = await axios.get("https://phatdat.store/api/v1/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.data) {
        const updated = {
          ...user,
          ...res.data.data,
        };

        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated));
        setUser(updated);
      }
    } catch {
      // Không báo lỗi — backend chưa có API profile
    }
  };

  /* =======================================================================
        3. LOGIN
  ======================================================================== */
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

      if (!token)
        return { success: false, message: "Không tìm thấy token từ server." };

      const decoded: any = jwtDecode(token);

      const session: UserSession = {
        token,
        id: decoded.id,
        numberPhone: decoded.numberPhone,
        roleId: Number(decoded.roleId),
        full_name: decoded.full_name || null,
        gender: decoded.gender || null,
        avatar: decoded.avatar || null,
      };

      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(session));
      setUser(session);

      // 🔥 FETCH PROFILE SAU LOGIN (NẾU BACKEND CÓ)
      await fetchCurrentUser(token);

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

  /* =======================================================================
        4. REGISTER
  ======================================================================== */
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
      return {
        success: false,
        message: (error.response?.data as any)?.mes || "Lỗi kết nối server.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================================================================
        5. LOGOUT
  ======================================================================== */
  const signOut = async () => {
    await SecureStore.deleteItemAsync(USER_KEY);
    setUser(null);
    router.replace("/(auth)/login");
  };

  /* =======================================================================
        6. REFRESH USER
  ======================================================================== */
  const refreshUser = async () => {
    const stored = await SecureStore.getItemAsync(USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      // 🔥 FETCH PROFILE THẬT
      await fetchCurrentUser(parsed.token);
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
