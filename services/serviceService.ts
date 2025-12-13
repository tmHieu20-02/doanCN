import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://phatdat.store/api/v1/service";

export const getMyServices = async () => {
  const stored = await SecureStore.getItemAsync("my-user-session");
  const token = JSON.parse(stored!).token;

  return axios.get(`${BASE_URL}/get-my-service`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
