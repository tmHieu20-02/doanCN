import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const updateUser = async (payload: any) => {
  try {
    const stored = await SecureStore.getItemAsync("my-user-session");
    const session = stored ? JSON.parse(stored) : null;

    console.log("SESSION:", session);

    if (!session?.token || !session?.id) {
      return { err: 1, mes: "Missing token or user id" };
    }

 const url = `https://phatdat.store/api/v1/user/update-user`;



    const tokenToSend = session.token.startsWith("Bearer ")
      ? session.token
      : `Bearer ${session.token}`;
      console.log(">>> FINAL REQUEST:", {
  url,
  headers: {
    Authorization: tokenToSend,
    "Content-Type": "application/json",
  },
  payload,
});


    const res = await axios.put(url, payload, {
      headers: {
        "Content-Type": "application/json",

        // FIX QUAN TRỌNG:
        Authorization: tokenToSend,
      },
    });

    return res.data;
  } catch (error: any) {
    console.log(">>> UPDATE ERROR: ", error.response?.data || error);
    return { err: 1, mes: "Update thất bại" };
  }
};
