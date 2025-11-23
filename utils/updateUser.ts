import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const updateUser = async (payload: any) => {
  try {
    const stored = await SecureStore.getItemAsync("my-user-session");
    const session = stored ? JSON.parse(stored) : null;

    console.log("SESSION:", session);

    if (!session?.token) {
      return { err: 1, mes: "Missing token" };
    }

    const url = `https://phatdat.store/api/v1/user/update-user`;

    const tokenToSend = session.token.startsWith("Bearer ")
      ? session.token
      : `Bearer ${session.token}`;

    const res = await axios.put(url, payload, {
      headers: {
        Authorization: tokenToSend,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error: any) {
    console.log(">>> UPDATE ERROR: ", error.response?.data || error);
    return { err: 1, mes: "Update thất bại" };
  }
};
