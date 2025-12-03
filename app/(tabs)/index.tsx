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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Search, MapPin, Star, Clock, Filter, Heart } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router"; // ⭐ THÊM
import * as SecureStore from "expo-secure-store";
import { useCategories } from "../../hooks/useCategories";
import { colors } from "@/ui/theme";

// Skeleton
import HomeSkeleton from "../../components/common/skeletons/HomeSkeleton";

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

  const [favoriteServices, setFavoriteServices] = useState<number[]>([]);

  /* --------------- LOAD SERVICES --------------- */
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
          .filter((s: any) => s && s.id)
          .map((s: any) => ({
            id: s.id,
            name: s.name || "Dịch vụ",
            description: s.description || "",
            image: s.image || "https://picsum.photos/400",
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
        setTimeout(() => {
          setServicesLoading(false);
        }, 800);
      }
    };

    fetchServices();
  }, []);

  /* --------------- LOAD USER ONCE --------------- */
  useEffect(() => {
    const loadUserInfo = async () => {
      const value = await SecureStore.getItemAsync("my-user-session");
      if (value) setUser(JSON.parse(value));
    };
    loadUserInfo();
  }, []);

  /* --------------- AUTO REFRESH USER WHEN HOME FOCUSED --------------- */
  useFocusEffect(
    React.useCallback(() => {
      const reload = async () => {
        const value = await SecureStore.getItemAsync("my-user-session");
        if (value) {
          const parsed = JSON.parse(value);
          setUser(parsed); // ⭐ UPDATE AVATAR REALTIME
        }
      };
      reload();
    }, [])
  );

  /* --------------- LOAD FAVORITES --------------- */
  useEffect(() => {
    const loadFavorites = async () => {
      const saved = await SecureStore.getItemAsync("favorite-services");
      setFavoriteServices(saved ? JSON.parse(saved) : []);
    };
    loadFavorites();
  }, []);

  /* --------------- TOGGLE FAVORITE --------------- */
  const toggleFavorite = async (id: number) => {
    const saved = await SecureStore.getItemAsync("favorite-services");
    const current: number[] = saved ? JSON.parse(saved) : [];

    const updated = current.includes(id)
      ? current.filter((f) => f !== id)
      : [...current, id];

    setFavoriteServices(updated);
    await SecureStore.setItemAsync("favorite-services", JSON.stringify(updated));
  };

  /* --------------- SEARCH --------------- */
  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    router.push({ pathname: "/search", params: { q: searchQuery } });
  };

  /* --------------- RENDER SERVICE CARD --------------- */
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
            <Text style={styles.serviceCategory}>
              Danh mục #{item.categoryId}
            </Text>

            <View style={styles.serviceDetails}>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#FBBF24" fill="#FBBF24" />
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
                {Number(String(item.price).replace(/\D/g, "")).toLocaleString(
                  "vi-VN"
                )}
                đ
              </Text>

              <View style={styles.durationContainer}>
                <Clock size={14} color="#9CA3AF" />
                <Text style={styles.duration}>{item.duration}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

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

  /* --------------- HEADER COMPONENT --------------- */
  const HeaderComponent = (
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
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color={colors.primaryAlt} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ICON GRID */}
        <View style={styles.iconSection}>
          {[
            { icon: "🔥", label: "Deals" },
            { icon: "🏬", label: "DashMart" },
            { icon: "🍽", label: "Dining Out" },
            { icon: "🛒", label: "Grocery" },
            { icon: "🌮", label: "Mexican" },
            { icon: "🍔", label: "Fast Food" },
            { icon: "🍕", label: "Pizza" },
            { icon: "🥣", label: "Soup" },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.iconTile}>
              <View style={styles.iconGlass}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
              </View>
              <Text style={styles.iconLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <View style={[styles.section, styles.sectionHeader]}>
        <Text style={styles.sectionTitle}>Dịch vụ nổi bật</Text>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {servicesError && (
        <Text style={[styles.errorText, { textAlign: "center" }]}>
          {servicesError}
        </Text>
      )}
    </View>
  );

  if (servicesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

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

/* ========== STYLES ========== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },

  header: {
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

  greeting: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },

  userName: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: "#111827",
  },

  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  searchContainer: { marginTop: 4 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
  },

  filterButton: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: "#FFF4D0",
  },

  iconSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 22,
    paddingHorizontal: 10,
    paddingBottom: 6,
  },

  iconTile: {
    width: "23%",
    alignItems: "center",
    marginBottom: 22,
  },

  iconGlass: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  iconEmoji: {
    fontSize: 28,
  },

  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
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

  serviceCardWrapper: {
    width: "48%",
    position: "relative",
  },

  serviceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  serviceImage: {
    width: "100%",
    height: 130,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  serviceInfo: { padding: 12 },

  serviceName: { fontSize: 14, fontWeight: "700", color: colors.text },

  serviceCategory: { fontSize: 12, color: colors.textMuted, marginTop: 4 },

  serviceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  rating: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 3,
    color: colors.text,
  },

  reviewCount: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 2,
  },

  locationContainer: { flexDirection: "row", alignItems: "center" },

  distance: { fontSize: 11, color: "#6B7280", marginLeft: 3 },

  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#F59E0B",
  },

  durationContainer: { flexDirection: "row", alignItems: "center" },

  duration: { fontSize: 11, color: "#6B7280", marginLeft: 4 },

  favoriteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  errorText: {
    marginTop: 18,
    paddingHorizontal: 20,
    color: colors.danger,
    fontSize: 13,
  },
});
