import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  // LOẠI BỎ SafeAreaView ở đây
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Search, MapPin, Star, Clock, Filter, Heart } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { useCategories } from "../../hooks/useCategories";
import { colors } from "@/ui/theme";
import HomeSkeleton from "../../components/common/skeletons/HomeSkeleton";

export type Service = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  duration: string;
  categoryId: number;
  categoryName: string;
  rating: number;
  reviewCount: number;
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  const { categories } = useCategories();
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // 👉 CHỈ LƯU service_id
  const [favoriteServices, setFavoriteServices] = useState<number[]>([]);

  /* ============================================
     LOAD SERVICES
  ============================================ */
  useEffect(() => {
    const loadServices = async () => {
      try {
        const session = await SecureStore.getItemAsync("my-user-session");
        const token = session ? JSON.parse(session).token : null;

        const res = await fetch(
          "https://phatdat.store/api/v1/service/get-all",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const json = await res.json();

        const mapped = (json.data || []).map((s: any) => ({
          id: s.id,
          name: s.name || "Dịch vụ",
          description: s.description || "",
          image: s.image || "https://picsum.photos/400",
          price: Number(s.price || 0),
          duration: `${s.duration_minutes ?? 30} phút`,
          categoryId: s.category?.id ?? 0,
          categoryName: s.category?.name ?? "Danh mục",
          rating: Number(s.average_rating ?? 5),
          reviewCount: Number(s.rating_count ?? 0),
        }));

        setServices(mapped);
      } finally {
        setTimeout(() => setServicesLoading(false), 600);
      }
    };

    loadServices();
  }, []);

  /* ============================================
     LOAD USER
  ============================================ */
  useEffect(() => {
    const loadUserInfo = async () => {
      const value = await SecureStore.getItemAsync("my-user-session");
      if (value) setUser(JSON.parse(value));
    };
    loadUserInfo();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const reload = async () => {
        const value = await SecureStore.getItemAsync("my-user-session");
        if (value) setUser(JSON.parse(value));
      };
      reload();
    }, [])
  );

  /* ============================================
     LOAD FAVORITES
  ============================================ */
  const loadFavorites = async () => {
    try {
      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;

      const res = await fetch(
        "https://phatdat.store/api/v1/favorite/get-all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await res.json();

      if (json.err === 0) {
        setFavoriteServices(json.data.map((f: any) => f.service_id));
      }
    } catch (err) {
      console.log("LOAD FAVORITES ERROR:", err);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  /* ============================================
     FAVORITE API
  ============================================ */
  const addFavorite = async (service_id: number) => {
    const session = await SecureStore.getItemAsync("my-user-session");
    const token = session ? JSON.parse(session).token : null;

    const res = await fetch(
      "https://phatdat.store/api/v1/favorite/create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ service_id }),
      }
    );

    return await res.json();
  };

  // 🔥 FIX DUY NHẤT – DELETE PHẢI GỬI BODY
  const removeFavorite = async (service_id: number) => {
    const session = await SecureStore.getItemAsync("my-user-session");
    const token = session ? JSON.parse(session).token : null;

    const res = await fetch(
      "https://phatdat.store/api/v1/favorite/delete",
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ service_id }),
      }
    );

    return await res.json();
  };

  /* ============================================
     TOGGLE FAVORITE (GIỮ NGUYÊN LOGIC)
  ============================================ */
  const toggleFavorite = async (id: number) => {
    const isFav = favoriteServices.includes(id);

    // Optimistic UI
    setFavoriteServices((prev) =>
      isFav ? prev.filter((x) => x !== id) : [...prev, id]
    );

    let res;
    if (isFav) res = await removeFavorite(id);
    else res = await addFavorite(id);

    // Rollback nếu BE fail
    if (res.err !== 0) {
      setFavoriteServices((prev) =>
        isFav ? [...prev, id] : prev.filter((x) => x !== id)
      );
    }
  };

  /* ============================================
     SEARCH
  ============================================ */
  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    router.push({ pathname: "/search", params: { q: searchQuery } });
  };

  /* ============================================
     SERVICE CARD
  ============================================ */
  const renderServiceCard = ({ item }: { item: Service }) => {
    const isFav = favoriteServices.includes(item.id);

    return (
      <View style={styles.serviceCardWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.serviceCard}
          onPress={() =>
            router.push({ pathname: "/service/[id]", params: { id: item.id } })
          }
        >
          <Image source={{ uri: item.image }} style={styles.serviceImage} />

          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {item.name}
            </Text>

            <Text style={styles.serviceCategory}>{item.categoryName}</Text>

            <View style={styles.serviceDetails}>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.rating}>{item.rating}</Text>
                <Text style={styles.reviewCount}>
                  ({item.reviewCount})
                </Text>
              </View>

              <View style={styles.locationContainer}>
                <MapPin size={14} color="#9CA3AF" />
                <Text style={styles.distance}>0.5km</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {item.price.toLocaleString("vi-VN")} đ
              </Text>

              <View style={styles.durationContainer}>
                <Clock size={14} color="#9CA3AF" />
                <Text style={styles.duration}>{item.duration}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ❤️ FAVORITE */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item.id)}
        >
          <Heart
            size={22}
            color={isFav ? "#EF4444" : "#F97316"}
            fill={isFav ? "#EF4444" : "transparent"}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (servicesLoading) {
    return (
      // Dùng View thường thay vì SafeAreaView
      <View style={styles.container}> 
        <HomeSkeleton />
      </View>
    );
  }

  return (
    // FIX: Thay SafeAreaView bằng View thường
    <View style={styles.container}> 
      <FlatList
        data={services}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.serviceRow}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <Header
            user={user}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchSubmit={handleSearchSubmit}
          />
        }
      />
    </View>
  );
}

/* ============================
   HEADER
============================ */
function Header({ user, searchQuery, setSearchQuery, handleSearchSubmit }: any) {
  return (
    <View>
      <LinearGradient colors={["#FFE7C2", "#FFD08A"]} style={styles.header}>
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
                uri:
                  user?.avatar ||
                  "https://phatdat.store/default-avatar.png",
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
              onSubmitEditing={handleSearchSubmit}
              placeholderTextColor="#9CA3AF"
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
    </View>
  );
}

/* ============================
   STYLES
============================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    // FIX: Tăng paddingTop lên để nội dung Header không bị Status Bar che
    paddingTop: 50, 
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  userName: { fontSize: 26, fontWeight: "800", color: "#111827" },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  searchContainer: { marginTop: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 6,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  filterButton: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: "#FFF4D0",
  },
  section: { paddingHorizontal: 20, marginTop: 18 },
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
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  serviceCardWrapper: { width: "48%", position: "relative" },
  serviceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    overflow: "hidden",
    elevation: 4,
  },
  serviceImage: {
    width: "100%",
    height: 130,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  serviceInfo: { padding: 12 },
  serviceName: { fontSize: 14, fontWeight: "700" },
  serviceCategory: { fontSize: 12, marginTop: 4 },
  serviceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: { fontSize: 11, fontWeight: "600" },
  reviewCount: { fontSize: 11, marginLeft: 2 },
  locationContainer: { flexDirection: "row", alignItems: "center" },
  distance: { fontSize: 11, marginLeft: 3 },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  price: { fontSize: 15, fontWeight: "800", color: "#F59E0B" },
  durationContainer: { flexDirection: "row", alignItems: "center" },
  duration: { fontSize: 11, marginLeft: 4 },
  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    elevation: 5,
  },
});