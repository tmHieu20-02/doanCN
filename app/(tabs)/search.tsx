import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { Search, SlidersHorizontal, MapPin, Clock } from "lucide-react-native";
import { Link, useLocalSearchParams } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { colors, radius, shadow } from "@/ui/theme";

const API_BASE = "https://phatdat.store";

export default function SearchScreen() {
  const { category, q } =
    useLocalSearchParams<{ category: string; q: string }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) setSearchQuery(category);
    else if (q) setSearchQuery(q);
  }, [category, q]);

  /* ================================
          CALL API SEARCH
  ================================= */
  const fetchServices = async () => {
    try {
      setLoading(true);

      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;

      const res = await axios.get(`${API_BASE}/api/v1/service/get-all`, {
        params: { search: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || [];

      const mapped = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        categoryName: s.category?.name ?? "Không có danh mục",
        price: s.price,
        duration: `${s.duration_minutes} phút`,
        image: s.image || "https://picsum.photos/300", // tránh lỗi null image
      }));

      setServices(mapped);
    } catch (err) {
      console.log("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchQuery]);

  /* ===================================
          RENDER ITEM (GIỐNG CHỢ TỐT)
  ====================================*/
  const renderItem = ({ item }: any) => (
    <Link
      href={{
        pathname: "/booking",
        params: { serviceId: item.id.toString() },
      }}
      asChild
    >
      <TouchableOpacity style={styles.rowCard}>
        {/* ==== IMAGE LEFT ==== */}
        <Image source={{ uri: item.image }} style={styles.cardImage} />

        {/* ==== CONTENT RIGHT ==== */}
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.cardCategory}>{item.categoryName}</Text>

          <Text style={styles.cardPrice}>{item.price}đ</Text>

          <View style={styles.cardMeta}>
            <Clock size={14} color={colors.textMuted} />
            <Text style={styles.cardDuration}>{item.duration}</Text>
          </View>

          {/* BUTTON */}
          <TouchableOpacity style={styles.cardButton}>
            <Text style={styles.cardButtonText}>Đặt lịch</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm dịch vụ</Text>
        <Text style={styles.headerSubtitle}>Lọc theo danh mục, từ khóa</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm salon, spa, gym..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity style={styles.filterBtn}>
          <SlidersHorizontal size={20} color={colors.primaryAlt} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryAlt}
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 50, paddingTop: 10 }}
        />
      )}
    </SafeAreaView>
  );
}

/* =====================================
          STYLES - CHỢ TỐT STYLE
===================================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 18,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "#000" },
  headerSubtitle: { fontSize: 14, color: "#4B5563", marginTop: 4 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 18,
  },
  searchInputWrapper: {
    flex: 1,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.text },
  filterBtn: {
    marginLeft: 12,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },

  /* === CHỢ TỐT CARD === */
  rowCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    ...shadow.card,
  },
  cardImage: {
    width: 110,
    height: 110,
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  cardCategory: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryAlt,
    marginTop: 6,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  cardDuration: {
    marginLeft: 6,
    color: colors.textMuted,
    fontSize: 12,
  },

  cardButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginTop: 10,
  },
  cardButtonText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
});
