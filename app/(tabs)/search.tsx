import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { Search, SlidersHorizontal, Clock, History, X, MapPin } from "lucide-react-native";
import { Link, useLocalSearchParams } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, shadow } from "@/ui/theme";

const API_BASE = "https://phatdat.store";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { category, q } = useLocalSearchParams<{ category: string; q: string }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (category) setSearchQuery(category);
    else if (q) setSearchQuery(q);
  }, [category, q]);

  const fetchAllServices = async () => {
    try {
      setLoading(true);
      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;
      const res = await axios.get(`${API_BASE}/api/v1/service/get-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = res.data?.data || [];
      const mapped = list.map((s: any) => ({
        id: s.id,
        name: s.name,
        categoryName: s.category?.name ?? "Dịch vụ",
        price: s.price,
        duration: `${s.duration_minutes} phút`,
        image: s.image || "https://picsum.photos/400",
      }));
      setAllServices(mapped);
    } catch (err) {
      console.log("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllServices(); }, []);

  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  };

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !showSuggestions) return [];
    const query = removeAccents(searchQuery);
    const matches = allServices
      .filter(s => removeAccents(s.name).includes(query))
      .map(s => s.name)
      .slice(0, 6);
    return [...new Set(matches)];
  }, [searchQuery, allServices, showSuggestions]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return allServices;
    const query = removeAccents(searchQuery);
    return allServices.filter((s) => 
      removeAccents(s.name).includes(query) || 
      removeAccents(s.categoryName).includes(query)
    );
  }, [searchQuery, allServices]);

  const handleSelectSuggestion = (item: string) => {
    setSearchQuery(item);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const renderItem = ({ item }: any) => (
    <Link href={{ pathname: "/booking", params: { serviceId: item.id.toString() } }} asChild>
      <TouchableOpacity style={styles.rowCard} activeOpacity={0.7}>
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardCategory}>{item.categoryName}</Text>
          
          <View style={styles.cardInfoRow}>
            <View style={styles.metaIcon}>
                <Clock size={12} color={colors.textMuted} />
                <Text style={styles.cardDuration}>{item.duration}</Text>
            </View>
            <View style={[styles.metaIcon, { marginLeft: 12 }]}>
                <MapPin size={12} color={colors.textMuted} />
                <Text style={styles.cardDuration}>0.5km</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>{Number(item.price).toLocaleString("vi-VN")}đ</Text>
            <View style={styles.bookBtn}>
                <Text style={styles.bookBtnText}>Đặt lịch</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      {/* HEADER: Gradient & Safe Area */}
      <LinearGradient 
        colors={["#FFE7C2", "#FFF9F0"]} 
        style={[styles.header, { paddingTop: insets.top + 5 }]}
      >
        <Text style={styles.headerTitle}>Tìm kiếm dịch vụ</Text>
        <Text style={styles.headerSubtitle}>
          {searchQuery ? `Tìm thấy ${filteredServices.length} kết quả` : "Lọc theo danh mục, từ khóa"}
        </Text>

        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Search size={18} color={colors.textMuted} />
            <TextInput
              value={searchQuery}
              onChangeText={(txt) => { setSearchQuery(txt); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Tìm salon, spa, gym..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={() => setShowSuggestions(false)}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <X size={16} color={colors.textMuted} />
                </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={20} color={colors.primaryAlt} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* SUGGESTIONS OVERLAY */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionBox, { top: insets.top + 115 }]}>
          {suggestions.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.suggestionItem} 
              onPress={() => handleSelectSuggestion(item)}
            >
              <History size={16} color="#A1A1AA" />
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primaryAlt} />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onScrollBeginDrag={() => {
            setShowSuggestions(false);
            Keyboard.dismiss();
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Image 
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/6134/6134065.png" }} 
                style={styles.emptyImg} 
              />
              <Text style={styles.emptyText}>Rất tiếc, chúng tôi không tìm thấy gì!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FBFBFB" },
  header: { 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    
  },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
  headerSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2, marginBottom: 15 },
  
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchInputWrapper: { 
    flex: 1, 
    backgroundColor: "#FFF", 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 12, 
    height: 48,
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: "#E5E7EB",
   
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: "#111827" },
  filterBtn: { 
    marginLeft: 12, 
    backgroundColor: "#FFF", 
    height: 48, 
    width: 48,
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: "#E5E7EB",
    
  },

  suggestionBox: { 
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: "#FFF", 
    borderRadius: 18, 
    elevation: 10, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 20,
    zIndex: 100,
    paddingVertical: 5
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderBottomColor: "#F3F4F6" },
  suggestionText: { marginLeft: 12, fontSize: 14, color: "#374151" },

  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 15 },
  rowCard: { 
    flexDirection: "row", 
    backgroundColor: "#FFF", 
    marginBottom: 16, 
    borderRadius: 20, 
    overflow: "hidden", 
    
    borderWidth: 1,
    borderColor: "#F3F4F6"
  },
  cardImage: { width: 105, height: 115 },
  cardBody: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardCategory: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  metaIcon: { flexDirection: 'row', alignItems: 'center' },
  cardDuration: { marginLeft: 4, color: "#6B7280", fontSize: 11 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  cardPrice: { fontSize: 16, fontWeight: "800", color: "#F59E0B" },
  bookBtn: { backgroundColor: "#FFE7C2", paddingHorizontal: 15, paddingVertical: 6, borderRadius: 10 },
  bookBtnText: { fontSize: 12, fontWeight: "700", color: "#B45309" },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyImg: { width: 120, height: 120, opacity: 0.5 },
  emptyText: { color: "#9CA3AF", fontSize: 14, marginTop: 15, fontWeight: "500" },
});