import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Heart, MapPin, Clock, Star } from "lucide-react-native";
import { colors } from "@/ui/theme";
import { router } from "expo-router";

type Service = {
  id: number | string;
  name: string;
  image: string;
  price: number;
  categoryId: number;
  duration: string;
  rating: number;
  reviewCount: number;
};

export default function FavoriteServices() {
  // có thể là number hoặc string, normalize sau
  const [favoriteIds, setFavoriteIds] = useState<(number | string)[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  /* ========== LOAD FAVORITE IDS ========== */
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const saved = await SecureStore.getItemAsync("favorite-services");
        const parsed = saved ? JSON.parse(saved) : [];
        // đảm bảo là array
        const arr = Array.isArray(parsed) ? parsed : [];
        setFavoriteIds(arr);
      } catch (e) {
        console.log("Lỗi đọc favorite-services:", e);
        setFavoriteIds([]);
      }
    };

    loadFavorites();
  }, []);

  /* ========== LOAD SERVICES TỪ API CHUNG ========== */
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setErrorText("");

        const res = await fetch("https://phatdat.store/api/v1/service/get-all");
        const json = await res.json();

        const servicesArr = Array.isArray(json.data) ? json.data : [];

        const mapped: Service[] = servicesArr
          .filter((s: any) => s && s.id)
          .map((s: any) => ({
            id: s.id, // giữ nguyên, normalize khi so sánh
            name: s.name || "Dịch vụ",
            image: "https://picsum.photos/400",
            price: s.price || 0,
            categoryId: s.category_id || 0,
            duration: `${s.duration_minutes || 30} phút`,
            rating: 4.8,
            reviewCount: 100,
          }));

        setServices(mapped);
      } catch (e) {
        console.log("Lỗi load service:", e);
        setErrorText("Không thể tải danh sách dịch vụ.");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  /* ========== NORMALIZE & FILTER ========== */

  // Set id yêu thích dạng string để so sánh ổn định
  const favoriteIdSet = useMemo(() => {
    return new Set(favoriteIds.map((v) => String(v)));
  }, [favoriteIds]);

  const filtered = useMemo(
    () => services.filter((s) => favoriteIdSet.has(String(s.id))),
    [services, favoriteIdSet]
  );

  /* ========== REMOVE FAVORITE ========== */
  const removeFavorite = async (id: number | string) => {
    try {
      const idStr = String(id);
      const updated = favoriteIds.filter((f) => String(f) !== idStr);

      setFavoriteIds(updated);
      await SecureStore.setItemAsync(
        "favorite-services",
        JSON.stringify(updated)
      );
    } catch (e) {
      console.log("Lỗi remove favorite:", e);
    }
  };

  /* ========== RENDER CARD ========== */
  const Card = ({ item }: { item: Service }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: "/service/[id]", params: { id: item.id } })
      }
      style={styles.card}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.image} />

      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => removeFavorite(item.id)}
      >
        <Heart size={20} color="#EF4444" fill="#EF4444" />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.row}>
          <Star size={13} color={colors.warning} fill={colors.warning} />
          <Text style={styles.text}>4.8</Text>
          <Text style={styles.muted}>({item.reviewCount})</Text>
        </View>

        <View style={styles.row}>
          <MapPin size={13} color="#9CA3AF" />
          <Text style={styles.muted}>0.5km</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.price}>
            {Number(item.price).toLocaleString("vi-VN")}đ
          </Text>

          <View style={styles.row}>
            <Clock size={13} color="#9CA3AF" />
            <Text style={styles.muted}>{item.duration}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  /* ========== UI ========== */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" color={colors.primaryAlt} />
        <Text style={{ marginTop: 10, color: "#555" }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.title}>Dịch vụ yêu thích</Text>

      {errorText ? (
        <Text style={[styles.empty, { color: colors.danger }]}>{errorText}</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>Bạn chưa lưu dịch vụ nào.</Text>
      ) : (
        <FlatList
          data={filtered}
          renderItem={Card}
          keyExtractor={(i) => String(i.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 20 },
  empty: { marginTop: 50, textAlign: "center", fontSize: 15, color: "#777" },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 18,
    overflow: "hidden",
    elevation: 2,
  },
  image: { width: "100%", height: 135 },

  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 6,
    borderRadius: 30,
  },

  info: { padding: 12 },
  name: { fontSize: 16, fontWeight: "700", marginBottom: 4 },

  row: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  text: { marginLeft: 4, fontSize: 12 },
  muted: { marginLeft: 4, fontSize: 12, color: "#999" },

  price: { fontSize: 16, fontWeight: "700", color: colors.primaryAlt },
});
