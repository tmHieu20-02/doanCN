import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export default function ServiceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<any>(null);

  // =============================
  // LOAD SERVICE BY ID
  // =============================
  const loadService = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const res = await axios.get(
        `https://phatdat.store/api/v1/service/get/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setService(res.data.data);
    } catch (err: any) {
      console.log("Lỗi load service:", err?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadService();
  }, [id]);

  // =============================
  // UPDATE SERVICE
  // =============================
  const updateService = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      await axios.put(
        `https://phatdat.store/api/v1/service/update/${id}`,
        {
          name: service.name,
          description: service.description,
          duration_minutes: Number(service.duration_minutes),
          price: Number(service.price),
          category_id: String(service.category_id),
          is_active: Boolean(service.is_active),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Thành công", "Cập nhật dịch vụ thành công!");

     router.push({
  pathname: "/staff/(stafftabs)/services",
  params: { reload: "1" },
});

    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không thể cập nhật dịch vụ"
      );
    }
  };

  // =============================
  // DELETE SERVICE
  // =============================
  const deleteService = () => {
    Alert.alert("Xóa dịch vụ", "Bạn có chắc muốn xóa?", [
      { text: "Không" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const stored = await SecureStore.getItemAsync("my-user-session");
            const token = JSON.parse(stored!).token;

            await axios.delete(
              `https://phatdat.store/api/v1/service/delete/${id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            Alert.alert("Đã xóa dịch vụ");
router.push({
  pathname: "/staff/(stafftabs)/services",
  params: { reload: "1" },
});

          } catch (err: any) {
            Alert.alert(
              "Lỗi",
              err?.response?.data?.message || "Không thể xóa dịch vụ"
            );
          }
        },
      },
    ]);
  };

  // =============================
  // LOADING UI
  // =============================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy dịch vụ</Text>
      </View>
    );
  }

  // =============================
  // UI
  // =============================
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa dịch vụ</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Tên dịch vụ</Text>
        <TextInput
          style={styles.input}
          value={service.name}
          onChangeText={(t) => setService({ ...service, name: t })}
        />

        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          value={service.description}
          onChangeText={(t) => setService({ ...service, description: t })}
        />

        <Text style={styles.label}>Thời gian (phút)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(service.duration_minutes)}
          onChangeText={(t) =>
            setService({ ...service, duration_minutes: Number(t) })
          }
        />

        <Text style={styles.label}>Giá dịch vụ</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(service.price)}
          onChangeText={(t) =>
            setService({ ...service, price: Number(t) })
          }
        />

        <Text style={styles.label}>ID danh mục</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={String(service.category_id)}
        onChangeText={(t) =>
  setService({ ...service, category_id: String(t) })
}

        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={updateService}>
        <Text style={styles.saveText}>Lưu</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={deleteService}>
        <Text style={styles.deleteText}>Xóa dịch vụ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F3F4F6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 14,
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  deleteBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  deleteText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
