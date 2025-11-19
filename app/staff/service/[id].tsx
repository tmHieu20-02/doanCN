import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ServiceDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [service, setService] = useState<any>(null);

  const fetchDetail = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const res = await axios.get(`https://phatdat.store/api/v1/service/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const found = res.data.data.find((s: any) => s.id == id);
      setService(found);
    } catch (err: any) {
      console.log("Lỗi:", err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

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
          category_id: Number(service.category_id),
          is_active: Boolean(service.is_active),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Thành công", "Cập nhật dịch vụ!");
      router.replace("/staff/services?reload=1");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.message || "Không thể cập nhật.");
    }
  };

  const deleteService = async () => {
    Alert.alert("Xóa dịch vụ", "Bạn có chắc chắn muốn xóa?", [
      { text: "Hủy" },
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

            Alert.alert("Đã xóa");
            router.replace("/staff/services?reload=1");
          } catch (err: any) {
            Alert.alert("Lỗi", err?.response?.data?.message || "Không thể xóa.");
          }
        },
      },
    ]);
  };

  if (!service) {
    return (
      <View style={styles.center}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Chỉnh sửa dịch vụ</Text>

      <TextInput
        style={styles.input}
        value={service.name}
        onChangeText={(t) => setService({ ...service, name: t })}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        value={service.description}
        multiline
        onChangeText={(t) => setService({ ...service, description: t })}
      />

      <TextInput
        style={styles.input}
        value={String(service.duration_minutes)}
        onChangeText={(t) => setService({ ...service, duration_minutes: t })}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        value={String(service.price)}
        onChangeText={(t) => setService({ ...service, price: t })}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        value={String(service.category_id)}
        onChangeText={(t) => setService({ ...service, category_id: t })}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={[
          styles.activeBtn,
          { backgroundColor: service.is_active ? "#8BC34A" : "#B0BEC5" },
        ]}
        onPress={() =>
          setService({ ...service, is_active: !service.is_active })
        }
      >
        <Text style={styles.activeText}>
          {service.is_active ? "Đang bật (Active)" : "Đang tắt (Inactive)"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={updateService}>
        <Text style={styles.submitText}>Cập nhật</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={deleteService}>
        <Text style={styles.deleteText}>Xóa dịch vụ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: "#FFF" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { fontSize: 22, fontWeight: "700", marginBottom: 20 },

  input: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  activeBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  activeText: { fontWeight: "600", color: "#fff" },

  submitBtn: {
    backgroundColor: "#FFB300",
    padding: 16,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 12,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  deleteBtn: {
    backgroundColor: "#E53935",
    padding: 16,
    alignItems: "center",
    borderRadius: 10,
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
