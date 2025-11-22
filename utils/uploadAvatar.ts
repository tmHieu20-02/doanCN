import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const uploadAvatar = async (imageUri: string) => {
  try {
    const stored = await SecureStore.getItemAsync("my-user-session");
    const session = stored ? JSON.parse(stored) : null;

    if (!session?.token) {
      console.log(">>> NO TOKEN FOUND");
      return { err: 1, mes: "Missing token" };
    }

    const token = session.token;
    console.log(">>> TOKEN SEND:", token);

    const formData = new FormData();
    formData.append("avatar", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    } as any);

    const res = await axios.put(
      "https://phatdat.store/api/v1/user/upload",
      formData,
      {
        headers: {
          Accept: "application/json",              // ⭐ BẮT BUỘC
          "Content-Type": "multipart/form-data",
         Authorization: `Bearer ${token}`,
             // ⭐ BE cần đúng key này
        },
      }
    );

    console.log(">>> UPLOAD RESPONSE RAW:", res.data);
    return res.data;
  } catch (error: any) {
    console.log("UPLOAD ERROR:", error.response?.data || error);
    return { err: 1, mes: "Upload thất bại" };
  }
};
