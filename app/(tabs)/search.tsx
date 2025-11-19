import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Search, MapPin, Star, SlidersHorizontal } from "lucide-react-native";
import { Link, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import axios from "axios";

const API_BASE = "https://phatdat.store";

const AppHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={styles.appHeader}>
    <Text style={styles.appHeaderTitle}>{title}</Text>
    {subtitle && <Text style={styles.appHeaderSubtitle}>{subtitle}</Text>}
  </View>
);

export default function SearchScreen() {
  const { category, q } = useLocalSearchParams<{ category: string; q: string }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (category) setSearchQuery(category);
    else if (q) setSearchQuery(q);
  }, [category, q]);

  // ===========================
  // CALL API LẤY DỮ LIỆU SEARCH
  // ===========================
  const fetchServices = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/services`, {
        params: { search: searchQuery },
      });

      setServices(res.data?.data || []);
    } catch (err) {
      Alert.alert("Lỗi", "Không thể tải dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchQuery]);

  // =======================
  // LẤY VỊ TRÍ NGƯỜI DÙNG
  // =======================
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Quyền truy cập vị trí bị từ chối");
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  // ======================
  // RENDER KẾT QUẢ SEARCH
  // ======================
  const renderServiceItem = ({ item }: any) => (
    <Link href={`/service/${item.id}`} asChild>
      <TouchableOpacity style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.resultInfo}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultCategory}>{item.categoryName}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[styles.statusDot, { backgroundColor: item.isOpen ? "#10B981" : "#EF4444" }]}
            />
            <Text
              style={[
                styles.statusText,
                { color: item.isOpen ? "#10B981" : "#EF4444" },
              ]}
            >
              {item.isOpen ? "Đang mở cửa" : "Đóng cửa"}
            </Text>
          </View>
        </View>

        <View style={styles.resultDetails}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{item.rating || 0}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount || 0} đánh giá)</Text>
          </View>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#9CA3AF" />
            <Text style={styles.distance}>{item.distance || "-- km"}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceRange}>{item.priceRange || "Liên hệ"}</Text>

          {/* Dùng booking page chính */}
          <Link
            href={{
              pathname: "/booking",
              params: { serviceId: item.id.toString() },
            }}
            asChild
          >
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Đặt lịch</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Tìm kiếm dịch vụ" subtitle="Lọc theo vị trí, đánh giá, giá" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm salon, spa, gym..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          style={styles.advancedFilterButton}
          onPress={() => {}}
        >
          <SlidersHorizontal size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#4F46E5"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  appHeader: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  appHeaderTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  appHeaderSubtitle: { fontSize: 14, color: "#6B7280" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },

  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: "#374151" },
  advancedFilterButton: {
    padding: 12,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  resultInfo: { flex: 1 },
  resultName: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 4 },
  resultCategory: { fontSize: 14, color: "#6B7280" },

  statusContainer: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "600" },

  resultDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  ratingContainer: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 14, fontWeight: "600", color: "#111827", marginLeft: 4 },
  reviewCount: { fontSize: 12, color: "#6B7280", marginLeft: 4 },

  locationContainer: { flexDirection: "row", alignItems: "center" },
  distance: { fontSize: 12, color: "#6B7280", marginLeft: 4 },

  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priceRange: { fontSize: 16, fontWeight: "700", color: "#4F46E5" },

  bookButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },

  bookButtonText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});
