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

  /** 🔵 FETCH CATEGORY */
  const fetchCategories = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      const res = await axios.get("https://phatdat.store/api/v1/category/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(res.data?.data || []);
    } catch (err: any) {
  console.log("Lỗi lấy category:", err?.response?.data || err);
}

  };

  /** 🔵 FETCH SERVICES */
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

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    if (reload) fetchServices();
  }, [reload]);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  /** 🔵 SERVICE CARD */
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/staff/serviceId/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardRow}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDuration}>{item.duration_minutes} phút</Text>
      </View>

      {item.category?.name && (
        <Text style={styles.cardCategory}>{item.category.name}</Text>
      )}

      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>{item.price.toLocaleString()} đ</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#FFB300" />
        <Text style={{ marginTop: 14, color: "#444" }}>Đang tải dịch vụ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Quản lý dịch vụ</Text>
          <Text style={styles.headerSubtitle}>Danh sách dịch vụ hiện có</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/staff/serviceId/create")}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.addButtonText}>Tạo mới</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY FILTER */}
      <FlatList
        horizontal
        data={[{ id: null, name: "Tất cả" }, ...categories]}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterItem,
              selectedCategory === item.id && styles.filterItemActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            <Text
              style={[
                styles.filterItemText,
                selectedCategory === item.id && styles.filterItemTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* SERVICE LIST */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Không có dịch vụ nào</Text>
          </View>
        }
      />
    </View>
  );
}

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8",
    padding: 16,
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFB300",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },

  /* FILTER */
  filterList: {
    paddingVertical: 4,
    marginBottom: 16,
  },
  filterItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  filterItemActive: {
    backgroundColor: "#FFB300",
    borderColor: "#FFB300",
  },
  filterItemText: {
    fontSize: 13,
    color: "#444",
  },
  filterItemTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  /* SERVICE CARD */
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    flex: 1,
    marginRight: 10,
  },
  cardDuration: {
    fontSize: 13,
    color: "#888",
  },
  cardCategory: {
    fontSize: 13,
    color: "#1E88E5",
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  /* EMPTY */
  emptyBox: {
    alignItems: "center",
    marginTop: 30,
  },
  emptyText: {
    color: "#777",
    fontSize: 14,
  },

  /* LOADING */
  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
});
