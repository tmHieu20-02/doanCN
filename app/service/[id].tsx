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
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Heart,
  Calendar,
  CheckCircle,
} from "lucide-react-native";
import * as SecureStore from "expo-secure-store";

import { colors, radius, shadow, spacing } from "@/ui/theme";

const { width: screenWidth } = Dimensions.get("window");

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  /** =====================================================================
   *  FETCH SERVICE DETAIL – GIỮ NGUYÊN LOGIC GỐC CỦA BẠN
   *  ===================================================================== */
  const fetchServiceDetail = async () => {
    try {
      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;

      const res = await fetch("https://phatdat.store/api/v1/service/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!json?.data) {
        setLoading(false);
        return;
      }

      console.log("DEBUG LIST SERVICE:", json.data.map((s: any) => s.id));
      console.log("DEBUG ID NHẬN ĐƯỢC:", id);

      /** 
       *  FIX DUY NHẤT: đảm bảo so sánh ID đúng dạng số,
       *  không đổi bất kỳ logic nào khác.
       */
      const found = json.data.find(
        (s: any) => Number(s.id) === Number(id?.toString().trim())
      );

      if (found) {
        setService({
          ...found,
          image_list: [
            found.image || "https://picsum.photos/400",
            found.image || "https://picsum.photos/400?2",
          ],
          duration_text: `${found.duration_minutes} phút`,
          rating: found.rating || 0,
          reviewCount: found.reviewCount || 0,
        });
      }

      setLoading(false);
    } catch (e) {
      console.log("LOAD SERVICE ERROR:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetail();
  }, [id]);

  /** =====================================================================
   *  UI – KHÔNG ĐỔI BẤT KỲ GÌ
   *  ===================================================================== */

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      </SafeAreaView>
    );
  }

  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: spacing(5) }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 16 }}>← Quay lại</Text>
          </TouchableOpacity>

          <Text style={styles.notFoundTitle}>Dịch vụ không tồn tại</Text>
          <Text style={{ marginTop: 10 }}>Không tìm thấy dịch vụ ID: {id}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => setIsFavorited(!isFavorited)}
        >
          <Heart
            size={24}
            color={isFavorited ? colors.danger : colors.textMuted}
            fill={isFavorited ? colors.danger : "none"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* IMAGE SLIDER */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {service.image_list.map((img: string, i: number) => (
            <Image
              key={i}
              source={{ uri: img }}
              style={[styles.serviceImage, { width: screenWidth }]}
            />
          ))}
        </ScrollView>

        {/* BASIC INFO */}
        <View style={styles.basicInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceCategory}>Danh mục #{service.category_id}</Text>

          <View style={styles.ratingRow}>
            <Star size={18} color={colors.warning} fill={colors.warning} />
            <Text style={styles.rating}>{service.rating}</Text>
            <Text style={styles.reviewCount}>({service.reviewCount} đánh giá)</Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MapPin size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>0.5km</Text>
            </View>

            <View style={styles.detailItem}>
              <Clock size={16} color={colors.textMuted} />
              <Text style={styles.detailText}>{service.duration_text}</Text>
            </View>
          </View>
        </View>

        {/* PRICE */}
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>
            {Number(service.price).toLocaleString("vi-VN")}đ
          </Text>
          <Text style={styles.priceNote}>Giá đã bao gồm VAT</Text>
        </View>

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BUTTON */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            router.push({
              pathname: "/booking/create",
              params: { serviceId: id?.toString() },
            })
          }
        >
          <Calendar size={20} color={colors.text} />
          <Text style={styles.bookButtonText}>Đặt lịch ngay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },

  /* HEADER */
  header: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconCircle: {
    width: 42,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  /* IMAGE */
  serviceImage: {
    height: 330,
    width: screenWidth,
    resizeMode: "cover",
  },

  /* CONTENT BLOCK */
  basicInfo: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    borderBottomWidth: 1,
    borderColor: "#EFEFEF",
  },

  serviceName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#222",
  },

  serviceCategory: {
    fontSize: 14,
    marginTop: 4,
    color: "#777",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  rating: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },

  reviewCount: {
    marginLeft: 6,
    fontSize: 13,
    color: "#888",
  },

  detailsRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 30,
  },

  detailItem: { flexDirection: "row", alignItems: "center" },
  detailText: { marginLeft: 6, color: "#777", fontSize: 14 },

  /* PRICE BLOCK — PHẲNG VÀ GỌN */
  priceSection: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  currentPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primaryAlt,
  },

  priceNote: {
    marginTop: 4,
    color: "#999",
    fontSize: 12,
  },

  /* DESCRIPTION BLOCK */
  section: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    color: "#222",
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#666",
  },

  /* BOTTOM BUTTON */
  bottomAction: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "transparent",
  },

  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  bookButtonText: {
    color: "#222",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  notFoundTitle: {
  fontSize: 22,
  fontWeight: "700",
  marginTop: spacing(5),
  textAlign: "center",
  color: colors.text,
},

});
