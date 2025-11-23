import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

// THEME
const colors = {
  primary: "#FFCC00",
  primaryDark: "#F4B000",
  bg: "#FFFDF5",
  card: "#FFFFFF",
  text: "#1F2937",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  danger: "#EF4444",
};

const radius = {
  lg: 20,
  xl: 26,
  md: 14,
};

export default function CreateService() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleCreate = async () => {
    if (!name || !description || !duration || !price || !categoryId) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập đầy đủ các trường.");
      return;
    }

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const body = {
        name,
        description,
        duration_minutes: Number(duration),
        price: Number(price),
        category_id: Number(categoryId),
        is_active: isActive,
      };

      const res = await axios.post(
        "https://phatdat.store/api/v1/service/create",
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        Alert.alert("Thành công", "Tạo dịch vụ thành công!");
        router.push("/staff/(tabs)/services?reload=1");
        return;
      }

      Alert.alert("Lỗi", res.data?.message || "Không tạo được dịch vụ.");
    } catch (err) {
      Alert.alert("Lỗi server", "Không thể tạo dịch vụ.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Tạo dịch vụ mới</Text>

      <View style={styles.card}>
        {/* TÊN DỊCH VỤ */}
        <Text style={styles.label}>Tên dịch vụ</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên dịch vụ"
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />

        {/* MÔ TẢ */}
        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Mô tả chi tiết"
          placeholderTextColor={colors.textMuted}
          multiline
          style={[styles.input, styles.textArea]}
        />

        {/* THỜI GIAN */}
        <Text style={styles.label}>Thời gian (phút)</Text>
        <TextInput
          value={duration}
          onChangeText={setDuration}
          placeholder="Ví dụ: 60"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* GIÁ */}
        <Text style={styles.label}>Giá dịch vụ</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="Ví dụ: 1200000"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* DANH MỤC */}
        <Text style={styles.label}>ID danh mục</Text>
        <TextInput
          value={categoryId}
          onChangeText={setCategoryId}
          placeholder="Nhập category_id"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* SWITCH */}
        <View style={styles.switchRow}>
          <Text style={styles.label}>Trạng thái</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>
      </View>

      {/* BUTTON */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createText}>Tạo dịch vụ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ===========================================
              STYLES VIP
=========================================== */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.bg,
    flex: 1,
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 20,
  },

  card: {
    backgroundColor: colors.card,
    padding: 22,
    borderRadius: radius.xl,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: radius.md,
    fontSize: 15,
    color: colors.text,
    marginBottom: 16,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: "center",

    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  createText: {
    fontSize: 17,
    color: "#000",
    fontWeight: "700",
  },
});
