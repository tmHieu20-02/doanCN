import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function CategoryList() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);

      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      const res = await axios.get("https://phatdat.store/api/v1/category/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(res.data?.data || []);
    } catch (err: any) {
      console.log("❌ Lỗi lấy category:", err?.response?.data || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories({ silent: true });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 8 }}>Đang tải danh mục…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh mục dịch vụ</Text>

      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => router.push("/staff/category/create")}
      >
        <Text style={styles.createText}>+ Thêm danh mục</Text>
      </TouchableOpacity>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
           onPress={() =>
  router.push({
    pathname: "/staff/category/[id]",
    params: { id: String(item.id) }
  })
}

          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Chưa có danh mục nào
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  createBtn: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  createText: { color: "#FFF", fontWeight: "600", textAlign: "center" },
  item: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  itemText: { fontSize: 16, fontWeight: "600" },
});
