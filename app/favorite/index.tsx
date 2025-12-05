import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Star, Heart } from "lucide-react-native";

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;

      const res = await fetch("https://phatdat.store/api/v1/favorite/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (json.err === 0) {
        setFavorites(json.data);
      }
    } catch (error) {
      console.log("LOAD FAVORITE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // DELETE FAVORITE 
  const removeFavorite = async (service_id: number) => {
    const session = await SecureStore.getItemAsync("my-user-session");
    const token = session ? JSON.parse(session).token : null;

    const res = await fetch(
      `https://phatdat.store/api/v1/favorite/delete/${service_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return await res.json();
  };

  /* ======================================
       CARD
  ====================================== */
  const renderItem = ({ item }: any) => {
    const s = item.service;
    if (!s) return null;

    return (
      <View style={styles.card}>
        
        {/* HEART BUTTON – xoá yêu thích */}
        <TouchableOpacity
          style={styles.heart}
          onPress={async () => {
            const res = await removeFavorite(s.id);
            if (res.err === 0) {
              setFavorites((prev) => prev.filter((f) => f.service_id !== s.id));
            }
          }}
        >
          <Heart size={20} color="#FF3B30" fill="#FF3B30" />
        </TouchableOpacity>

        {/* CARD CLICK */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push({ pathname: "/service/[id]", params: { id: s.id } })
          }
        >
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri: s.image || "https://via.placeholder.com/300?text=No+Image",
              }}
              style={styles.image}
            />

            {/* TAG */}
            <View style={styles.tag}>
              <Text style={styles.tagText}>Yêu thích</Text>
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {s.name}
            </Text>

            <View style={styles.ratingRow}>
              <Star size={14} color="#FFB100" fill="#FFB100" />
              <Text style={styles.rating}>4.8</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.time}>Nhanh 15–20'</Text>
            </View>

            <Text style={styles.price}>
              {Number(s.price).toLocaleString("vi-VN")} đ
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  /* ====================================== */

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Dịch vụ yêu thích</Text>

      {loading && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color="#FF6F00" />
        </View>
      )}

      {!loading && favorites.length === 0 && (
        <Text style={styles.empty}>Bạn chưa yêu thích dịch vụ nào.</Text>
      )}

      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={(item) =>
          (item.service_id || item.id || Math.random()).toString()
        }
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 60 }}
      />
    </SafeAreaView>
  );
}

/* ======================================
      STYLE
====================================== */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#FAFAFA" },

  header: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 14,
    color: "#222",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#999",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    position: "relative",
  },

  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 6,
    borderRadius: 20,
    zIndex: 99,
  },

  imageWrapper: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },

  image: { width: "100%", height: "100%" },

  tag: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "#FF6F00",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  tagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  info: { padding: 10 },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: "#222",
    fontWeight: "600",
  },

  dot: { marginHorizontal: 4, fontSize: 12, color: "#666" },

  time: { fontSize: 12, color: "#666" },

  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FF6F00",
    marginTop: 4,
  },
});
