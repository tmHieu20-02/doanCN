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
import { LogOut, Pencil } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StaffProfile() {
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar || "https://phatdat.store/default-avatar.png"
  );

  /* --------------------------------------------
        SYNC AVATAR KHI MỞ MÀN
  -------------------------------------------- */
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

  /* --------------------------------------------
        PICK AVATAR
  -------------------------------------------- */
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

    const uri = result.assets[0].uri;

    // Update UI trước
    setAvatarUrl(uri);

    // Update local session
    const stored = await SecureStore.getItemAsync("my-user-session");
    if (stored) {
      const session = JSON.parse(stored);
      session.avatar = uri;
      await SecureStore.setItemAsync("my-user-session", JSON.stringify(session));
    }

    // Update context
    await updateUser({ avatar: uri });

    // Upload BE ngầm
    uploadAvatar(uri).catch(() => {});
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored || "{}")?.token;

      const form = new FormData();
      form.append("avatar", {
        uri,
        name: "avatar.jpg",
        type: "image/jpeg",
      } as any);

      const res = await api.put("/user/upload", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.data?.avatar) {
        setAvatarUrl(res.data.data.avatar);
        updateUser({ avatar: res.data.data.avatar });
      }
    } catch (e) {
      console.log("Upload avatar error:", e);
    }
  };

  /* --------------------------------------------
          LOGOUT
  -------------------------------------------- */
  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hồ sơ nhân viên</Text>

      {/* AVATAR */}
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />

        {/* ICON CÂY BÚT */}
        <TouchableOpacity style={styles.editAvatarBtn} onPress={handlePickAvatar}>
          <Pencil size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.name}>{user?.full_name}</Text>
      <Text style={styles.phone}>{user?.numberPhone}</Text>

      <View style={styles.roleTag}>
        <Text style={styles.roleText}>Staff</Text>
      </View>

      {/* INFO BOX */}
      <View style={styles.infoBox}>
        <Text style={styles.infoItem}>
          <Text style={styles.label}>ID:</Text> {user?.id}
        </Text>

        <Text style={styles.infoItem}>
          <Text style={styles.label}>Số điện thoại:</Text> {user?.numberPhone}
        </Text>

        <Text style={styles.infoItem}>
          <Text style={styles.label}>Vai trò:</Text> Nhân viên (Staff)
        </Text>

        {/* BUTTON EDIT PROFILE */}
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => router.push("/staff/profile/edit")} // FIX ROUTER 100%
        >
          <Text style={styles.editProfileText}>Chỉnh sửa thông tin salon</Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

/* =============================================
      STYLE FINAL – GỌN – ĐẸP – TINH TẾ
============================================= */
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

  avatarWrapper: {
    width: 130,
    height: 130,
    alignSelf: "center",
    marginTop: 10,
  },

  avatarImg: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#ddd",
  },

  editAvatarBtn: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },

  phone: {
    textAlign: "center",
    color: "#666",
    marginTop: 4,
  },

  roleTag: {
    alignSelf: "center",
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 8,
  },

  roleText: { color: "#444", fontWeight: "600" },

  infoBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  infoItem: { fontSize: 15, marginBottom: 10 },

  label: { fontWeight: "700", color: "#333" },

  editProfileBtn: {
    backgroundColor: "#E6EEFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
  },

  editProfileText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 14,
  },

  logoutBtn: {
    marginTop: 25,
    paddingVertical: 14,
    backgroundColor: "#E53935",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
});
