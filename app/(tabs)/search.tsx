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
// ✅ BƯỚC 1: Import thêm `useLocalSearchParams`
import { Link, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";

// Component header đẹp, tái sử dụng
const AppHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <View style={styles.appHeader}>
    <Text style={styles.appHeaderTitle}>{title}</Text>
    {subtitle ? <Text style={styles.appHeaderSubtitle}>{subtitle}</Text> : null}
  </View>
);

const filters = [
  { id: 1, name: "Tất cả" },
  { id: 2, name: "Gần nhất" },
  { id: 3, name: "Đánh giá cao" },
  { id: 4, name: "Giá tốt" },
  { id: 5, name: "Mở cửa" },
];

// Dữ liệu mẫu (chúng ta sẽ lọc dựa trên 'category' của mảng này)
const searchResults = [
  {
    id: 1,
    name: "Beauty Salon Luxury",
    category: "Cắt tóc, Làm nail", // Lọc 'Cắt tóc' hoặc 'Làm nail' sẽ thấy
    rating: 4.8,
    reviewCount: 145,
    distance: "0.3km",
    price: "150.000đ - 500.000đ",
    status: "Đang mở cửa",
    statusColor: "#10B981",
  },
  {
    id: 2,
    name: "Zen Spa & Wellness",
    category: "Spa, Massage", // Lọc 'Spa & Massage' sẽ thấy
    rating: 4.9,
    reviewCount: 98,
    distance: "0.7km",
    price: "200.000đ - 800.000đ",
    status: "Đang mở cửa",
    statusColor: "#10B981",
  },
  {
    id: 3,
    name: "Elite Fitness Center",
    category: "Gym, Yoga", // Lọc 'Gym & Fitness' sẽ thấy
    rating: 4.7,
    reviewCount: 223,
    distance: "1.2km",
    price: "80.000đ - 200.000đ",
    status: "Đóng cửa",
    statusColor: "#EF4444",
  },
];

export default function SearchScreen() {
  // ✅ BƯỚC 2: Lấy tham số `category` (từ click icon) hoặc `q` (từ search bar)
  const { category, q } = useLocalSearchParams<{ category: string, q: string }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(1);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ BƯỚC 3: Thêm useEffect để cập nhật searchQuery từ tham số
  useEffect(() => {
    // Nếu có tham số 'category' (vd: "Gym & Fitness")
    if (category) {
      setSearchQuery(category);
    } 
    // Nếu có tham số 'q' (từ text search trang chủ)
    else if (q) {
      setSearchQuery(q);
    }
  }, [category, q]); // Chạy lại khi tham số thay đổi

  // useEffect này để lấy vị trí (giữ nguyên)
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Quyền truy cập vị trí bị từ chối");
        Alert.alert("Lỗi", "Quyền truy cập vị trí bị từ chối");
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const renderFilterButton = ({ item }: { item: { id: number; name: string } }) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === item.id && styles.filterButtonActive]}
      onPress={() => setActiveFilter(item.id)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === item.id && styles.filterButtonTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderSearchResult = ({
    item,
  }: {
    item: {
      id: number;
      name: string;
      category: string;
      rating: number;
      reviewCount: number;
      distance: string;
      price: string;
      status: string;
      statusColor: string;
    };
  }) => (
    <Link href={`/service/${item.id}`} asChild>
      <TouchableOpacity style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.resultInfo}>
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultCategory}>{item.category}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
            <Text style={[styles.statusText, { color: item.statusColor }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.resultDetails}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount} đánh giá)</Text>
          </View>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#9CA3AF" />
            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceRange}>{item.price}</Text>
          <Link
            href={{
              pathname: "/booking/new",
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
      {/* Header */}
      <AppHeader title="Tìm kiếm dịch vụ" subtitle="Lọc theo vị trí, đánh giá, giá" />

      {/* Ô tìm kiếm */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm salon, spa, gym..."
            value={searchQuery} // <-- Value này được control bởi state
            onChangeText={setSearchQuery} // <-- Người dùng vẫn có thể tự thay đổi
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity
          style={styles.advancedFilterButton}
          onPress={() => setShowAdvancedFilter(!showAdvancedFilter)}
        >
          <SlidersHorizontal size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Danh sách kết quả */}
      <FlatList
        // 💡 LOGIC LỌC NẰM Ở ĐÂY:
        // Nó sẽ lọc data dựa trên `searchQuery`.
        // Vì `useEffect` đã set `searchQuery` thành "Gym & Fitness",
        // logic filter này sẽ hoạt động chính xác.
        data={searchResults.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            {/* Bộ lọc nhanh */}
            <View style={styles.filtersContainer}>
              <FlatList
                data={filters}
                renderItem={renderFilterButton}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersList}
              />
            </View>

            {/* Bản đồ */}
            <View style={styles.mapHeaderContainer}>
              <Text style={styles.mapTitle}>Vị trí của bạn</Text>
              <View style={styles.mapContainer}>
                {errorMsg ? <Text>{String(errorMsg)}</Text> : null}
                {!location && !errorMsg && (
                  <ActivityIndicator size="large" color="#4F46E5" />
                )}
                {location && (
                  <MapView
                    style={styles.map}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={{
                      latitude: location.coords.latitude,
                      longitude: location.coords.longitude,
                      latitudeDelta: 0.02,
                      longitudeDelta: 0.01,
                    }}
                    showsUserLocation
                    scrollEnabled={false}
                  />
                )}
              </View>
            </View>

            {/* Bộ lọc nâng cao (giữ nguyên) */}
            {showAdvancedFilter && (
              <View style={styles.advancedFilters}>
                {/* ... code bộ lọc nâng cao ... */}
              </View>
            )}

            {/* Tiêu đề kết quả */}
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>
                Kết quả tìm kiếm 
                {/* Bạn có thể muốn cập nhật count này dựa trên list đã lọc */}
                {/* ({searchResults.length}) */} 
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ... Styles (giữ nguyên)
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
  appHeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  appHeaderSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
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
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filtersList: { paddingHorizontal: 20 },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonActive: { backgroundColor: "#4F46E5" },
  filterButtonText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  filterButtonTextActive: { color: "#FFFFFF" },
  mapHeaderContainer: { paddingHorizontal: 20, marginTop: 24 },
  mapTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 16 },
  mapContainer: {
    height: 200,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  map: { ...StyleSheet.absoluteFillObject },
  advancedFilters: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  advancedFiltersTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  filterGroup: { marginBottom: 20 },
  filterGroupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  filterOptions: { flexDirection: "row", flexWrap: "wrap" },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 8,
  },
  filterOptionCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 8,
  },
  filterOptionText: { fontSize: 14, color: "#6B7280" },
  resultsContainer: { padding: 20 },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
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