import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import * as SecureStore from 'expo-secure-store';

const USER_KEY = 'my-user-session'; // Key để lưu trữ

// 1. Định nghĩa data mà Context sẽ cung cấp
interface AuthContextData {
  user: any;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (params: {
    name: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  signOut: () => Promise<void>;
}

// 2. Tạo Context
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// 3. Tạo Provider (Component "gói" toàn bộ ứng dụng)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  // Bắt đầu với isLoading = true để chờ kiểm tra storage
  const [isLoading, setIsLoading] = useState(true);

  // 4. Thêm useEffect để tải user từ SecureStore khi app khởi động
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Lấy user (dưới dạng JSON string) từ storage
        const userJson = await SecureStore.getItemAsync(USER_KEY);
        if (userJson) {
          setUser(JSON.parse(userJson)); // Chuyển JSON string về object
        }
      } catch (e) {
        console.error('Không thể tải user từ storage', e);
      } finally {
        // Dù thành công hay thất bại, cũng phải dừng loading
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // 5. Cập nhật các hàm của bạn (loại bỏ router.replace)

  // ✅ Đăng nhập
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (email === 'nguyenvana@gmail.com' && password === '123456') {
        const loggedInUser = { email };
        setUser(loggedInUser);
        // Lưu user vào SecureStore
        await SecureStore.setItemAsync(
          USER_KEY,
          JSON.stringify(loggedInUser)
        );
        // XÓA router.replace() - _layout.tsx sẽ tự động làm
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Đăng ký
  const signUp = async ({ name, email, password }: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      console.log('Đăng ký:', name, email);
      const newUser = { name, email };
      setUser(newUser);
      // Lưu user vào SecureStore
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
      // XÓA router.replace() - _layout.tsx sẽ tự động làm
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Đăng xuất
  const signOut = async () => {
    setUser(null);
    // Xóa user khỏi SecureStore
    await SecureStore.deleteItemAsync(USER_KEY);
    // XÓA router.replace() - _layout.tsx sẽ tự động làm
  };

  // 6. Cung cấp các giá trị cho toàn bộ app
  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 7. Tạo hook (giống hệt hook cũ của bạn, nhưng dùng Context)
// Các component con sẽ dùng hook này để lấy data
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
}