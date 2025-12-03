import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Image,
  Pressable,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

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
  function ServiceCard({ item }: { item: any }) {
    const [imgFailed, setImgFailed] = useState(false);
    const placeholder = require("../../../assets/images/01.png");
    const source = !imgFailed && item?.image ? { uri: item.image } : placeholder;

    return (
      <TouchableOpacity
        style={styles.card}
        // ✔ FIX ROUTER — chỉ thay dòng này, không đổi logic
        onPress={() =>
          router.push({
            pathname: "../serviceId/[id]",  // MOVE OUT OF (stafftabs)
            params: { id: item.id },
          })
        }
        activeOpacity={0.88}
      >
        <View style={styles.cardInner}>
          <View style={styles.thumbWrap}>
            <Image
              source={source}
              style={styles.thumb}
              onError={() => setImgFailed(true)}
            />

            {item?.image && !imgFailed ? (
              <LinearGradient
                colors={["rgba(255,255,255,0.06)", "rgba(0,0,0,0.16)"]}
                style={styles.featuredBadge}
              >
                <Text style={styles.featuredText}>Featured</Text>
              </LinearGradient>
            ) : null}
          </View>

          <View style={styles.contentWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.durationPill}>
                <Text style={styles.durationText}>{item.duration_minutes} phút</Text>
              </View>
            </View>

            {item.category?.name ? (
              <Text style={styles.cardCategory}>{item.category.name}</Text>
            ) : null}

            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.cardPrice}>
                {item.price?.toLocaleString?.() ?? item.price} đ
              </Text>

              <TouchableOpacity
                style={styles.editLink}
                onPress={(e: any) => {
                  try {
                    e?.stopPropagation?.();
                  } catch {}
                  // ✔ ALSO FIX THIS ROUTE — same logic
                  router.push({
                    pathname: "../serviceId/[id]",
                    params: { id: item.id },
                  });
                }}
              >
                <Text style={styles.editText}>Chỉnh sửa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const renderItem = ({ item }: any) => <ServiceCard item={item} />;

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
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Quản lý dịch vụ</Text>
          <Text style={styles.headerSubtitle}>Danh sách dịch vụ hiện có — chất lượng VIP</Text>
          <Text style={styles.headerStat}>{services.length} dịch vụ</Text>
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
            activeOpacity={0.8}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  headerCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginRight: 12,
  },
  headerStat: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
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

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  cardInner: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  thumbWrap: {
    width: 92,
    height: 92,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  thumb: { width: "100%", height: "100%", resizeMode: "cover" },
  contentWrap: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  durationPill: {
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  durationText: { color: "#1E3A8A", fontSize: 12, fontWeight: "700" },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },

  cardCategory: {
    fontSize: 12,
    color: "#0ea5e9",
    fontWeight: "700",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  editLink: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  editText: { color: "#1E3A8A", fontWeight: "700" },

  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  emptyBox: {
    alignItems: "center",
    marginTop: 30,
  },
  emptyText: {
    color: "#777",
    fontSize: 14,
  },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
});
