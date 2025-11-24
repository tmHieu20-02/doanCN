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

// THEME
import { colors, radius, shadow, spacing } from "@/ui/theme";

const { width: screenWidth } = Dimensions.get("window");

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  const fetchServiceDetail = async () => {
    try {
      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;

      const res = await fetch("https://phatdat.store/api/v1/service/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!json.data) return setLoading(false);

      const found = json.data.find((s: any) => s.id == Number(id));

      if (found) {
        setService({
          ...found,
          price: Number(found.price),
          image_list: [
            found.image || "https://picsum.photos/400",
            found.image || "https://picsum.photos/400?2",
          ],
          rating: 4.8,
          reviewCount: 100,
          features: ["Chất lượng cao", "Uy tín", "Nhanh chóng"],
          duration_text: `${found.duration_minutes} phút`,
        });
      }

      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetail();
  }, [id]);

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
      {/* Header */}
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
        {/* Image slider */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {service.image_list.map((img: string, i: number) => (
            <Image
              key={i}
              source={{ uri: img }}
              style={[styles.serviceImage, { width: screenWidth }]}
            />
          ))}
        </ScrollView>

        {/* Basic Info */}
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

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>
            {Number(service.price).toLocaleString("vi-VN")}đ
          </Text>
          <Text style={styles.priceNote}>Giá đã bao gồm VAT</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đặc điểm nổi bật</Text>

          {service.features.map((f: string, i: number) => (
            <View key={i} style={styles.featureItem}>
              <CheckCircle size={18} color={colors.success} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Button */}
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
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing(4),
  },

  iconCircle: {
    width: 42,
    height: 42,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...shadow.card,
  },

  serviceImage: {
    height: 250,
    resizeMode: "cover",
  },

  basicInfo: {
    padding: spacing(5),
  },

  serviceName: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },

  serviceCategory: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing(3),
  },

  rating: { marginLeft: 6, fontSize: 16, color: colors.text },
  reviewCount: { color: colors.textMuted, marginLeft: 4 },

  detailsRow: {
    flexDirection: "row",
    marginTop: spacing(3),
    justifyContent: "space-between",
    width: "65%",
  },

  detailItem: { flexDirection: "row", alignItems: "center" },
  detailText: { marginLeft: 4, color: colors.textMuted },

  priceSection: {
    padding: spacing(5),
    backgroundColor: colors.card,
    marginTop: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  currentPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primaryAlt,
    marginBottom: 4,
  },

  priceNote: { color: colors.textMuted, fontSize: 12 },

  section: {
    padding: spacing(5),
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing(2),
    color: colors.text,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing(2),
  },

  featureText: {
    fontSize: 15,
    marginLeft: 8,
    color: colors.text,
  },

  bottomAction: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: spacing(4),
    backgroundColor: colors.bg,
  },

  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing(4),
    borderRadius: radius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...shadow.card,
  },

  bookButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  notFoundTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: spacing(5),
  },
});
