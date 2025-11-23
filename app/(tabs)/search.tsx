import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Search, SlidersHorizontal, Clock } from "lucide-react-native";
import { Link, useLocalSearchParams } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Theme
import { colors, radius, shadow } from "@/ui/theme";

const API_BASE = "https://phatdat.store";

export default function SearchScreen() {
  const { category, q } = useLocalSearchParams<{ category: string; q: string }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* ------------------------------------------
        SET DEFAULT SEARCH (CATEGORY or q)
  ------------------------------------------- */
  useEffect(() => {
    if (category) setSearchQuery(category);
    else if (q) setSearchQuery(q);
  }, [category, q]);

  /* ------------------------------------------
        FETCH SERVICES (SEARCH)
  ------------------------------------------- */
  const fetchServices = async () => {
    try {
      setLoading(true);

      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;

      const res = await axios.get(`${API_BASE}/api/v1/service/get-all`, {
        params: { search: searchQuery },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      const data = res.data?.data || [];

      const mapped = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        categoryName: s.category?.name ?? "Không có danh mục",
        price: s.price,
        duration: `${s.duration_minutes} phút`,
      }));

      setServices(mapped);
    } catch (err: any) {
      console.log("Search error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchQuery]);

  /* ------------------------------------------
        RENDER CARD
  ------------------------------------------- */
  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.categoryText}>{item.categoryName}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.price}>{item.price}đ</Text>

        <View style={styles.durationRow}>
          <Clock size={14} color={colors.textMuted} />
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>

      {/* Booking link */}
      <Link
        href={{
          pathname: "/booking",
          query: { serviceId: item.id.toString() },
        }}
        asChild
      >
        <TouchableOpacity style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>Đặt lịch</Text>
        </TouchableOpacity>
      </Link>
    </View>
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
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </SafeAreaView>
  );
}

/* ------------------------------------------
        STYLES – VIP PREMIUM
------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 18,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },

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

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: colors.text,
  },

  filterBtn: {
    marginLeft: 12,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryDark,
  },

  card: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },

  serviceName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },

  categoryText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryAlt,
  },

  durationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    marginLeft: 6,
    color: colors.textMuted,
  },

  bookBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.lg,
  },
  bookBtnText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
    color: "#000",
  },
});
