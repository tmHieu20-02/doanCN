import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
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
              { headers: { Authorization: `Bearer ${token}` } }
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
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Chỉnh sửa dịch vụ</Text>

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
            value={String(service.duration_minutes)}
            onChangeText={(t) =>
              setService({ ...service, duration_minutes: t })
            }
            keyboardType="numeric"
          />

          <Text style={styles.label}>Giá dịch vụ</Text>
          <TextInput
            style={styles.input}
            value={String(service.price)}
            onChangeText={(t) => setService({ ...service, price: t })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>ID danh mục</Text>
          <TextInput
            style={styles.input}
            value={String(service.category_id)}
            onChangeText={(t) => setService({ ...service, category_id: t })}
            keyboardType="numeric"
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Trạng thái</Text>
            <Switch
              value={service.is_active}
              onValueChange={() =>
                setService({ ...service, is_active: !service.is_active })
              }
            />
          </View>
        </View>
      </ScrollView>

      {/* FOOTER CỐ ĐỊNH */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.updateBtn} onPress={updateService}>
          <Text style={styles.updateText}>Cập nhật</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={deleteService}>
          <Text style={styles.deleteText}>Xóa dịch vụ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 18,
    color: "#1F2937",
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  footer: {
    paddingHorizontal: 16,
    paddingBottom: 22,
    paddingTop: 10,
    backgroundColor: "#F3F4F6",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },

  updateBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  updateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  deleteBtn: {
    backgroundColor: "#DC2626",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
