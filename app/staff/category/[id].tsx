import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default function EditCategory() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState("");

  const fetchDetail = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      const res = await axios.get("https://phatdat.store/api/v1/category/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data?.data || [];
      const category = list.find((c: any) => c.id == id);
      if (category) setName(category.name);
    } catch (err) {
      console.log("LỖI:", err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, []);

  const handleUpdate = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      await axios.put(
        `https://phatdat.store/api/v1/category/update/${id}`,
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Thành công", "Cập nhật danh mục thành công");
      router.back();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật danh mục");
    }
  };

  const handleDelete = () => {
    Alert.alert("Xác nhận xoá", "Bạn có chắc muốn xoá danh mục này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            const stored = await SecureStore.getItemAsync("my-user-session");
            const token = stored ? JSON.parse(stored).token : null;

            await axios.delete(
              `https://phatdat.store/api/v1/category/delete/${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            Alert.alert("Đã xoá");
            router.back();
          } catch {
            Alert.alert("Lỗi", "Không thể xoá danh mục");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa danh mục</Text>

      <Text style={styles.label}>Tên danh mục</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nhập tên danh mục"
        style={styles.input}
      />

      <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
        <Text style={styles.updateText}>Lưu thay đổi</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteText}>Xoá danh mục</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFF" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 8,
  },
  updateBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
  },
  updateText: { color: "#FFF", textAlign: "center", fontWeight: "700" },
  deleteBtn: {
    marginTop: 20,
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 10,
  },
  deleteText: { color: "#FFF", textAlign: "center", fontWeight: "700" },
});
