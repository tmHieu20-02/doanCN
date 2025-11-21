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

    } catch (err: any) {
      Alert.alert("Lỗi server", "Không thể tạo dịch vụ.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tạo dịch vụ mới</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Tên dịch vụ</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên dịch vụ"
          style={styles.input}
        />

        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Mô tả chi tiết"
          multiline
          style={[styles.input, { height: 90 }]}
        />

        <Text style={styles.label}>Thời gian (phút)</Text>
        <TextInput
          value={duration}
          onChangeText={setDuration}
          placeholder="Ví dụ: 60"
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>Giá dịch vụ</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="Ví dụ: 1200000"
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>ID danh mục</Text>
        <TextInput
          value={categoryId}
          onChangeText={setCategoryId}
          placeholder="Nhập category_id"
          keyboardType="numeric"
          style={styles.input}
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Trạng thái</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>
      </View>

      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createText}>Tạo dịch vụ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#F3F4F6",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 18,
    color: "#1F2937",
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  label: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    fontSize: 15,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  createButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",

    // hiệu ứng hiện đại
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  createText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
