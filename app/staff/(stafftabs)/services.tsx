import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";

export default function StaffServices() {
  const router = useRouter();
  const { reload } = useLocalSearchParams();

  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /** 🔵 LẤY CATEGORY */
  const fetchCategories = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      const res = await axios.get("https://phatdat.store/api/v1/category/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(res.data?.data || []);
   } catch (err) {
  console.log("Lỗi lấy category:", (err as any)?.response?.data || err);
}

  };

  /** 🔵 LẤY SERVICE */
  const fetchServices = async () => {
    try {
      setLoading(true);

      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const params: any = {};
      if (selectedCategory) params.categoryId = selectedCategory;

      const res = await axios.get("https://phatdat.store/api/v1/service/get-all", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setServices(res.data?.data || []);
    } catch (err: any) {
      console.log("Lỗi lấy dịch vụ:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  /** 🔵 LOAD LẦN ĐẦU */
  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  /** 🔵 RELOAD SAU CREATE/UPDATE */
  useEffect(() => {
    if (reload) fetchServices();
  }, [reload]);

  /** 🔵 RELOAD SAU KHI CHỌN CATEGORY */
  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFB300" />
        <Text style={{ marginTop: 12 }}>Đang tải dịch vụ...</Text>
      </View>
    );
  }

  /** 🔵 GIAO DIỆN 1 ITEM SERVICE */
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/staff/serviceId/${item.id}`)}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.desc}>{item.description}</Text>

      {/* category name */}
      {item.category?.name && (
        <Text style={styles.category}>Danh mục: {item.category.name}</Text>
      )}

      <View style={styles.row}>
        <Text style={styles.price}>{item.price.toLocaleString()} đ</Text>
        <Text style={styles.duration}>{item.duration_minutes} phút</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Danh sách dịch vụ</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/staff/serviceId/create")}
        >
          <Plus color="#fff" size={20} />
          <Text style={styles.addText}>Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* 🔵 FILTER CATEGORY */}
      <FlatList
        horizontal
        data={[{ id: null, name: "Tất cả" }, ...categories]}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterBtn,
              selectedCategory === item.id && styles.filterBtnActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === item.id && styles.filterTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
      />

      {/* LIST SERVICES */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={{ color: "#777" }}>Không có dịch vụ nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: "#F5F6F8" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: { fontSize: 22, fontWeight: "700" },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFB300",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },

  /* FILTER */
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  filterBtnActive: {
    backgroundColor: "#FFB300",
    borderColor: "#FFB300",
  },
  filterText: {
    fontSize: 13,
    color: "#444",
  },
  filterTextActive: {
    color: "#fff",
  },

  /* SERVICE CARD */
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  category: {
    fontSize: 13,
    color: "#1E88E5",
    fontWeight: "600",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  price: { fontWeight: "700", color: "#222" },
  duration: { color: "#777" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
