import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Heart,
  Calendar,
  Share2,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { colors, spacing } from "@/ui/theme";

const { width: screenWidth } = Dimensions.get("window");

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  /* =====================================================================
   * 1. LOAD DATA & ĐỒNG BỘ TRẠNG THÁI
   * ===================================================================== */
  const fetchData = async () => {
    try {
      setLoading(true);
      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;

      const [resService, resFav] = await Promise.all([
        fetch("https://phatdat.store/api/v1/service/get-all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://phatdat.store/api/v1/favorite/get-all", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const jsonService = await resService.json();
      const jsonFav = await resFav.json();

      const found = jsonService.data?.find((s: any) => Number(s.id) === Number(id));
      const isExistInFav = jsonFav.data?.some((f: any) => Number(f.service_id) === Number(id));

      if (found) {
        setService({
          ...found,
          image_list: [found.image || "https://picsum.photos/800/600", "https://picsum.photos/800/600?sig=1"],
          duration_text: `${found.duration_minutes || 30} phút`,
        });
        setIsFavorited(!!isExistInFav);
      }
    } catch (e) {
      console.log("LOAD DATA ERROR:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  /* =====================================================================
   * 2. TOGGLE FAVORITE (FIXED LOGIC DELETE)
   * ===================================================================== */
  const toggleFavorite = async () => {
    const previousState = isFavorited;
    setIsFavorited(!previousState); // Optimistic UI

    try {
      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;

      if (!token) {
        Alert.alert("Thông báo", "Vui lòng đăng nhập");
        setIsFavorited(previousState);
        return;
      }

      const isRemoving = previousState === true;
      const url = isRemoving 
        ? `https://phatdat.store/api/v1/favorite/delete/${id}` 
        : `https://phatdat.store/api/v1/favorite/create`;
      
      const res = await fetch(url, {
        method: isRemoving ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: isRemoving ? null : JSON.stringify({ service_id: id }),
      });

      // QUAN TRỌNG: Kiểm tra res.ok thay vì chỉ kiểm tra json.err
      if (!res.ok) {
         // Nếu không phải 200 hay 204 thì rollback
         throw new Error("API Error");
      }

    } catch (error) {
      setIsFavorited(previousState); // Hoàn tác nếu lỗi
      Alert.alert("Lỗi", "Không thể thực hiện thao tác này");
      console.log("TOGGLE ERROR:", error);
    }
  };

  if (loading) return (
    <View style={styles.loadingCenter}>
      <ActivityIndicator size="large" color="#FF6F00" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* FLOAT HEADER */}
      <View style={styles.floatHeader}>
        <TouchableOpacity style={styles.blurBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.blurBtn} onPress={toggleFavorite}>
            <Heart 
              size={22} 
              color={isFavorited ? "#FF4B4B" : "#FFF"} 
              fill={isFavorited ? "#FF4B4B" : "transparent"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.heroSection}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {service?.image_list.map((img: string, i: number) => (
              <Image key={i} source={{ uri: img }} style={styles.heroImage} />
            ))}
          </ScrollView>
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>DANH MỤC #{service?.category_id}</Text>
            </View>
            <Text style={styles.serviceTitle}>{service?.name}</Text>
          </View>
        </View>

        <View style={styles.contentCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Star size={20} color="#FFB100" fill="#FFB100" />
              <Text style={styles.statValue}>{service?.average_rating || 5.0}</Text>
              <Text style={styles.statLabel}>Xếp hạng</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Clock size={20} color="#FF6F00" />
              <Text style={styles.statValue}>{service?.duration_text}</Text>
              <Text style={styles.statLabel}>Thời gian</Text>
            </View>
            <View style={styles.statItem}>
              <MapPin size={20} color="#FF4B4B" />
              <Text style={styles.statValue}>0.5km</Text>
              <Text style={styles.statLabel}>Gần đây</Text>
            </View>
          </View>

          <Text style={styles.subSectionTitle}>Mô tả dịch vụ</Text>
          <Text style={styles.descriptionText}>{service?.description || "Đang cập nhật..."}</Text>
          
          <View style={styles.highlightBox}>
             <View style={styles.highlightItem}>
                <Text style={styles.highlightEmoji}>✨</Text>
                <Text style={styles.highlightText}>Chất lượng phục vụ 5 sao</Text>
             </View>
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Giá trọn gói</Text>
          <Text style={styles.priceValue}>{Number(service?.price).toLocaleString("vi-VN")}đ</Text>
        </View>
        <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => router.push({ pathname: "/booking/create", params: { serviceId: id?.toString() } })}
        >
          <LinearGradient colors={["#FFB100", "#FF6F00"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBtn}>
            <Calendar size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>Đặt lịch ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  floatHeader: { position: "absolute", top: 45, left: 0, right: 0, zIndex: 100, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 },
  headerRight: { flexDirection: 'row', gap: 12 },
  blurBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  heroSection: { height: 400, width: screenWidth },
  heroImage: { width: screenWidth, height: 400, resizeMode: "cover" },
  heroOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, height: 200 },
  heroContent: { position: "absolute", bottom: 40, left: 20, right: 20 },
  categoryBadge: { backgroundColor: "#FF6F00", alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 10 },
  categoryText: { color: "#FFF", fontSize: 10, fontWeight: "800" },
  serviceTitle: { fontSize: 32, fontWeight: "800", color: "#FFF" },
  contentCard: { marginTop: -30, backgroundColor: "#FFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  statItem: { flex: 1, alignItems: "center" },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#F0F0F0" },
  statValue: { fontSize: 16, fontWeight: "700", color: "#222", marginTop: 5 },
  statLabel: { fontSize: 12, color: "#999", marginTop: 2 },
  subSectionTitle: { fontSize: 18, fontWeight: "700", color: "#222", marginBottom: 12 },
  descriptionText: { fontSize: 15, lineHeight: 24, color: "#666", marginBottom: 20 },
  highlightBox: { backgroundColor: "#F9F9F9", padding: 16, borderRadius: 16, gap: 12 },
  highlightItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  highlightEmoji: { fontSize: 16 },
  highlightText: { fontSize: 14, color: "#444", fontWeight: '500' },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 15, paddingBottom: 35, borderTopWidth: 1, borderColor: "#F0F0F0", gap: 15 },
  priceContainer: { flex: 1 },
  priceLabel: { fontSize: 12, color: "#999", fontWeight: '600' },
  priceValue: { fontSize: 22, fontWeight: "800", color: "#FF6F00" },
  primaryBtn: { flex: 1.5, borderRadius: 16, overflow: 'hidden' },
  gradientBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 8 },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});