import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const refreshUser = async () => {
  const stored = await SecureStore.getItemAsync("my-user-session");
  if (!stored) return null;

  const session = JSON.parse(stored);

  const res = await axios.post("https://phatdat.store/api/v1/auth/login", {
    numberPhone: session.numberPhone,
    password: session.password  // ⭐ Phải lưu password trước đó!
  });

  const newUser = res.data;

  await SecureStore.setItemAsync("my-user-session", JSON.stringify(newUser));

  return newUser;
};
