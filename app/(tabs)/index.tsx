import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Search, MapPin, Star, Clock, Filter } from "lucide-react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

// Hooks
import { useCategories, Category } from "../../hooks/useCategories";

// Theme
import { colors } from "@/ui/theme";

export type Service = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  duration?: string;
  categoryId: number;
  rating?: number;
  reviewCount?: number;
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  const { categories } = useCategories();

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);

        const session = await SecureStore.getItemAsync("my-user-session");
        const token = session ? JSON.parse(session).token : null;

        const res = await fetch("https://phatdat.store/api/v1/service/get-all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();

       const mapped = (json.data || [])
  .filter((s: any) => s && s.id) // lọc phần tử undefined
  .map((s: any) => ({
    id: s.id,
    name: s.name || "Dịch vụ",
    description: s.description || "",
    image: "https://picsum.photos/400",
    price: s.price || 0,
    duration: `${s.duration_minutes || 30} phút`,
    categoryId: s.category_id || 0,
    rating: 4.8,
    reviewCount: 100,
  }));


        setServices(mapped);
      } catch (e) {
        setServicesError("Không thể tải dịch vụ.");
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const loadUserInfo = async () => {
      const value = await SecureStore.getItemAsync("my-user-session");
      if (value) setUser(JSON.parse(value));
    };
    loadUserInfo();
  }, []);

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    router.push({ pathname: "/search", params: { q: searchQuery } });
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.serviceCard}
      onPress={() =>
        router.push({ pathname: "/service/[id]", params: { id: item.id } })
      }
    >
      <Image
        source={{ uri: item.image }}
        style={styles.serviceImage}
      />

      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.serviceCategory}>Danh mục #{item.categoryId}</Text>

        <View style={styles.serviceDetails}>
          <View style={styles.ratingContainer}>
            <Star size={14} color={colors.warning} fill={colors.warning} />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>

          <View style={styles.locationContainer}>
            <MapPin size={14} color="#9CA3AF" />
            <Text style={styles.distance}>0.5km</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
  {Number(String(item.price).replace(/\D/g, "")).toLocaleString("vi-VN")}đ
</Text>

          <View style={styles.durationContainer}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={styles.duration}>{item.duration}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        router.push({
          pathname: "/search",
          params: { category: item.name },
        })
      }
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryEmoji}>{item.icon ?? "⭐"}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const HeaderComponent = (
    <View>
      <LinearGradient
        colors={[colors.primary, colors.primaryAlt]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Xin chào 👋</Text>
            <Text style={styles.userName}>
              {user?.full_name ||
                user?.fullName ||
                user?.name ||
                user?.numberPhone ||
                "Khách hàng"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Image
              source={{
                uri: user?.avatar || "https://phatdat.store/default-avatar.png",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#A1A1AA" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm dịch vụ, spa, gym..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={handleSearchSubmit}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color={colors.primaryAlt} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.section, styles.sectionHeader]}>
        <Text style={styles.sectionTitle}>Dịch vụ nổi bật</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {servicesLoading && (
        <ActivityIndicator
          color={colors.primaryAlt}
          style={{ marginTop: 30 }}
        />
      )}

      {servicesError && (
        <Text style={[styles.errorText, { textAlign: "center" }]}>
          {servicesError}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={services}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.serviceRow}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={HeaderComponent}
        ListHeaderComponentStyle={{ marginBottom: 10 }}
      />
    </SafeAreaView>
  );
}

/* ------------------------ STYLES ------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingTop: 16,
    paddingBottom: 22,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  greeting: { fontSize: 14, color: "#FFFBE5" },
  userName: { fontSize: 22, color: "#FFFFFF", fontWeight: "700" },

  avatarContainer: {
    padding: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
  },
  avatar: { width: 42, height: 42, borderRadius: 21 },

  searchContainer: { marginTop: 8 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.text },
  filterButton: {
    padding: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  seeAllText: { fontSize: 13, fontWeight: "600", color: colors.primaryDark },

  serviceRow: {
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  serviceImage: { width: "100%", height: 120, resizeMode: "cover" },
  serviceInfo: { padding: 10 },

  serviceName: { fontSize: 14, fontWeight: "700", color: colors.text },
  serviceCategory: { fontSize: 12, color: colors.textMuted, marginTop: 3 },

  serviceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 11, fontWeight: "600", marginLeft: 3, color: colors.text },
  reviewCount: { fontSize: 11, color: colors.textMuted, marginLeft: 2 },
  locationContainer: { flexDirection: "row", alignItems: "center" },
  distance: { fontSize: 11, color: colors.textMuted, marginLeft: 3 },

  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
  },
  price: { fontSize: 15, fontWeight: "700", color: colors.primaryAlt },
  durationContainer: { flexDirection: "row", alignItems: "center" },
  duration: { fontSize: 11, color: colors.textMuted, marginLeft: 3 },

  errorText: {
    marginTop: 18,
    paddingHorizontal: 20,
    color: colors.danger,
    fontSize: 13,
  },

  /* ---------------- CATEGORY ---------------- */
  categoryItem: {
    alignItems: "center",
    marginRight: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    width: 86,
  },

  categoryIcon: {
    width: 46,
    height: 46,
    backgroundColor: colors.primaryLight,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  categoryEmoji: { fontSize: 22 },

  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },
});


