import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";

import { useRouter } from "expo-router";
import { colors, spacing, radius, shadow } from "@/ui/theme";
import { ArrowLeft, Save, User, Phone, UserCircle2 } from "lucide-react-native";

import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "../../utils/updateUser";
import * as SecureStore from "expo-secure-store";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");

  
  const [avatar, setAvatar] = useState("https://i.ibb.co/Mff2W3V/default-avatar.png");

  /* ============================================
        LOAD USER + SYNC AVATAR TỪ SECURESTORE
  ============================================= */
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setGender(user.gender || "");
      setPhone(user.numberPhone || "");
    }

    const loadAvatar = async () => {
      const stored = await SecureStore.getItemAsync("my-user-session");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.avatar) setAvatar(data.avatar);
      }
    };

    loadAvatar();
  }, [user]);

  /* ============================
          HANDLE SAVE
  ============================ */
  const handleSave = async () => {
    const payload = {
      full_name: fullName,
      gender: gender,
    };

    const res = await updateUser(payload);
    console.log("UPDATE RESULT:", res);

    if (res?.err === 1) {
      alert("Lỗi cập nhật: " + res.mes);
      return;
    }

    // ⭐ Lưu session local
    const stored = await SecureStore.getItemAsync("my-user-session");
    if (stored) {
      const session = JSON.parse(stored);
      session.full_name = fullName;
      session.gender = gender;
      if (session.avatar) setAvatar(session.avatar);

      await SecureStore.setItemAsync("my-user-session", JSON.stringify(session));
    }

    alert("Cập nhật thành công!");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing(8) }}
      >
        {/* BANNER */}
        <View style={styles.banner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.bannerTitle}>Chỉnh sửa hồ sơ</Text>

          <Image
            source={{ uri: "https://i.ibb.co/CMVXLQH/profile-banner.png" }}
            style={styles.bannerImg}
            resizeMode="contain"
          />
        </View>

        {/* AVATAR FLOATING */}
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: avatar }}
            style={styles.avatar}
          />
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          {/* FULL NAME */}
          <View style={styles.inputGroup}>
            <User size={20} color={colors.primaryDark} style={{ marginRight: 10 }} />
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Họ và tên"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          {/* PHONE */}
          <View style={styles.inputGroup}>
            <Phone size={20} color={colors.primaryDark} style={{ marginRight: 10 }} />
            <TextInput
              value={phone}
              editable={false}
              style={[styles.input, { opacity: 0.6 }]}
              placeholder="Số điện thoại (không chỉnh sửa)"
            />
          </View>

          {/* GENDER */}
          <View style={[styles.inputGroup, { flexDirection: "column" }]}>
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              <UserCircle2 size={20} color={colors.primaryDark} style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
                Giới tính
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 14 }}>
              {/* Male */}
              <TouchableOpacity
                onPress={() => setGender("male")}
                style={[
                  styles.genderOption,
                  gender === "male" && styles.genderOptionActive
                ]}
              >
                <Text style={{ color: gender === "male" ? "#000" : colors.textMuted }}>
                  Nam
                </Text>
              </TouchableOpacity>

              {/* Female */}
              <TouchableOpacity
                onPress={() => setGender("female")}
                style={[
                  styles.genderOption,
                  gender === "female" && styles.genderOptionActive
                ]}
              >
                <Text style={{ color: gender === "female" ? "#000" : colors.textMuted }}>
                  Nữ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Save size={22} color="#fff" />
            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================
          STYLES
============================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  banner: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing(4),
    paddingTop: spacing(4),
    paddingBottom: spacing(10),
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    position: "relative",
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginTop: spacing(3),
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImg: {
    width: "100%",
    height: 110,
    marginTop: spacing(1),
    opacity: 0.9,
  },
  avatarWrapper: {
    position: "absolute",
    top: 130,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 95,
    height: 95,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "#fff",
    ...shadow.card,
  },
  form: {
    marginTop: spacing(16),
    paddingHorizontal: spacing(4),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing(4),
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing(4),
    backgroundColor: "#fff",
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  saveBtn: {
    backgroundColor: colors.primaryDark,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing(4),
    marginTop: spacing(5),
    borderRadius: radius.lg,
    ...shadow.card,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: spacing(2),
  },

  /* Gender Select */
  genderOption: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
  },
  genderOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
});
