import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "https://phatdat.store/api/v1",
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const stored = await SecureStore.getItemAsync("my-user-session");
  if (stored) {
    const session = JSON.parse(stored);
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  }
  return config;
});

export default api;
