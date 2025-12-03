import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

export default function StaffProfile() {
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar || "https://phatdat.store/default-avatar.png"
  );

  /* ================================
        SYNC SESSION KHI MỞ MÀN
  ================================= */
  useEffect(() => {
    const syncSession = async () => {
      const stored = await SecureStore.getItemAsync("my-user-session");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.avatar) setAvatarUrl(data.avatar);
      }
    };
    syncSession();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  /* ================================
        PICK + UPDATE UI NGAY
  ================================= */
  const handlePickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert("Quyền bị từ chối", "Bạn phải cho phép truy cập ảnh.");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;

    // ⚡ 1. Update UI ngay lập tức
    setAvatarUrl(imageUri);

    // ⚡ 2. Update session local
    const stored = await SecureStore.getItemAsync("my-user-session");
    if (stored) {
      const session = JSON.parse(stored);
      session.avatar = imageUri;
      await SecureStore.setItemAsync("my-user-session", JSON.stringify(session));
    }

    // ⭐ 3. Update AuthContext → STAFF HOME cập nhật ngay lập tức
    await updateUser({ avatar: imageUri });

    Alert.alert("Thành công", "Cập nhật ảnh đại diện thành công!");

    // ⚙ 4. Upload background
    uploadAvatar(imageUri).catch(() => {});
  };

  /* ================================
        UPLOAD BACKEND (ASYNC)
  ================================= */
  const uploadAvatar = async (imageUri: string) => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored || "{}")?.token;

      let form = new FormData();
      form.append("avatar", {
        uri: imageUri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      const res = await api.put("/user/upload", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("UPLOAD RES:", res.data);

      // Backend trả URL thật
      if (res.data?.data?.avatar) {
        const realUrl = res.data.data.avatar;

        setAvatarUrl(realUrl);
        await updateUser({ avatar: realUrl });

        const updated = JSON.stringify({
          ...JSON.parse(stored || "{}"),
          avatar: realUrl,
        });

        await SecureStore.setItemAsync("my-user-session", updated);
      }
    } catch (err) {
      console.log("Upload error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hồ sơ nhân viên</Text>

      {/* AVATAR + INFO */}
      <View style={styles.profileBox}>
        <TouchableOpacity onPress={handlePickAvatar}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
        </TouchableOpacity>

        <Text style={styles.name}>{user?.full_name || `Nhân viên #${user?.id}`}</Text>
        <Text style={styles.phone}>{user?.numberPhone}</Text>

        <View style={styles.roleTag}>
          <Text style={styles.roleText}>Staff</Text>
        </View>

        <TouchableOpacity style={styles.uploadBtn} onPress={handlePickAvatar}>
          <Text style={styles.uploadText}>Đổi ảnh đại diện</Text>
        </TouchableOpacity>
      </View>

      {/* INFO */}
      <View style={styles.infoBox}>
        <Text style={styles.infoItem}>
          <Text style={styles.label}>ID: </Text>
          {user?.id}
        </Text>

        <Text style={styles.infoItem}>
          <Text style={styles.label}>Số điện thoại: </Text>
          {user?.numberPhone}
        </Text>

        <Text style={styles.infoItem}>
          <Text style={styles.label}>Vai trò: </Text>
          Nhân viên (Staff)
        </Text>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================================
      CSS
================================ */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F7F7F7",
    flex: 1,
  },

  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  profileBox: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ddd",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },

  phone: {
    color: "#666",
    fontSize: 15,
    marginTop: 4,
  },

  roleTag: {
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },

  roleText: {
    color: "#444",
    fontWeight: "600",
  },

  uploadBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#7C3AED",
    borderRadius: 8,
  },

  uploadText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  infoBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },

  infoItem: {
    fontSize: 15,
    marginBottom: 10,
  },

  label: {
    fontWeight: "700",
    color: "#333",
  },

  logoutBtn: {
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: "#E53935",
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
});
