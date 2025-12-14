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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /** FETCH SERVICES */
  const fetchServices = async () => {
    try {
      setLoading(true);
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      const res = await axios.get("https://phatdat.store/api/v1/service/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setServices(res.data?.data || []);
    } catch (err) {
      console.log("Lỗi lấy dịch vụ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (reload) fetchServices();
  }, [reload]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices();
    setRefreshing(false);
  };

  /** SERVICE CARD */
  function ServiceCard({ item }: { item: any }) {
    const [imgFailed, setImgFailed] = useState(false);
    const placeholder = require("../../../assets/images/01.png");
    const source = !imgFailed && item?.image ? { uri: item.image } : placeholder;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() =>
          router.push({
            pathname: "../serviceId/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.cardInner}>
          <View style={styles.thumbWrap}>
            <Image
              source={source}
              style={styles.thumb}
              onError={() => setImgFailed(true)}
            />

            {item.image && !imgFailed && (
              <LinearGradient
                colors={["rgba(255,255,255,0.05)", "rgba(0,0,0,0.2)"]}
                style={styles.featuredBadge}
              >
                <Text style={styles.featuredText}>Featured</Text>
              </LinearGradient>
            )}
          </View>

          <View style={styles.contentWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>

              <View style={styles.durationPill}>
                <Text style={styles.durationText}>
                  {item.duration_minutes} phút
                </Text>
              </View>
            </View>

            {item.category?.name && (
              <Text style={styles.cardCategory}>{item.category.name}</Text>
            )}

            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.cardPrice}>
                {item.price?.toLocaleString?.() ?? item.price} đ
              </Text>

              <TouchableOpacity
                style={styles.editLink}
                onPress={(e) => {
                  e.stopPropagation?.();
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
        {/* BACK (ADDED) */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/staff/(stafftabs)")}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Quản lý dịch vụ</Text>
          <Text style={styles.headerSubtitle}>
            {services.length} dịch vụ đang hoạt động
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/staff/serviceId/create")}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.addButtonText}>Tạo mới</Text>
        </TouchableOpacity>
      </View>

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

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F3F7",
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 6,
  },

  // BACK (ADDED)
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  backText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 13,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  cardInner: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },

  thumbWrap: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },

  thumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  featuredBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  featuredText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  contentWrap: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    flex: 1,
  },

  durationPill: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  durationText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "700",
  },

  cardCategory: {
    fontSize: 12,
    color: "#2563EB",
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
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },

  editLink: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },

  editText: {
    color: "#2563EB",
    fontWeight: "700",
  },

  emptyBox: {
    marginTop: 30,
    alignItems: "center",
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 15,
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
