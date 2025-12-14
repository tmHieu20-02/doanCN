import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

import { colors, shadow, radius, spacing } from "../../../ui/theme";

export default function StaffRatings() {
  const router = useRouter();

  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      const res = await axios.get(
        "https://phatdat.store/api/v1/rating/get-staff",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("STAFF RATING RAW:", res.data);

      const data = res.data?.date?.rows || [];      // ⭐ FIXED
      setRatings(data);
      setLoading(false);
    } catch (err) {
      console.log("GET STAFF RATINGS ERROR:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const avgRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        ).toFixed(1)
      : "0.0";

  return (
    <ScrollView style={styles.container}>
      {/* BACK (ADDED) */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.replace("/staff/(stafftabs)")}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Đánh giá</Text>
      </View>

      {/* Tổng quan */}
      <View style={styles.summaryCard}>
        <Text style={styles.avgRating}>{avgRating}</Text>
        <Text style={styles.starText}>⭐</Text>
        <Text style={styles.countText}>{ratings.length} đánh giá</Text>
      </View>

      {/* Danh sách đánh giá */}
      {ratings.length === 0 ? (
        <Text
          style={{
            textAlign: "center",
            marginTop: 40,
            color: colors.textMuted,
          }}
        >
          Chưa có đánh giá nào
        </Text>
      ) : (
        ratings.map((item, index) => (
          <View key={index} style={styles.ratingItem}>
            {/* Header */}
            <View style={styles.headerRow}>
              {item.customer?.avatar ? (
                <Image
                  source={{ uri: item.customer.avatar }}
                  style={styles.avatar}
                />
              ) : null}

              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>
                  {item.customer?.full_name || "Khách hàng"}   {/* ⭐ FIXED */}
                </Text>
                <Text style={styles.timeText}>
                  {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </Text>
              </View>

              <Text style={styles.ratingNumber}>⭐ {item.rating}</Text>
            </View>

            {/* Nội dung đánh giá */}
            <Text style={styles.commentText}>{item.comment}</Text>

            {/* Gợi ý thông tin dịch vụ */}
            <Text style={styles.serviceText}>
              Dịch vụ: {item.service?.name}
            </Text>
            <Text style={styles.serviceText}>
              Ngày thực hiện:{" "}
              {new Date(item.booking?.booking_date).toLocaleDateString("vi-VN")}
            </Text>
          </View>
        ))
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing(4),
    backgroundColor: colors.bg,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },

  // BACK (ADDED)
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing(4),
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
  },
  backText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },

  summaryCard: {
    backgroundColor: colors.card,
    padding: spacing(5),
    borderRadius: radius.lg,
    alignItems: "center",
    marginBottom: spacing(6),
    ...shadow.card,
  },

  avgRating: {
    fontSize: 48,
    fontWeight: "800",
    color: colors.primary,
  },

  starText: {
    fontSize: 28,
    marginTop: -10,
  },

  countText: {
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing(1),
  },

  ratingItem: {
    backgroundColor: colors.card,
    padding: spacing(4),
    borderRadius: radius.md,
    marginBottom: spacing(4),
    ...shadow.card,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing(2),
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing(3),
  },

  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  timeText: {
    fontSize: 13,
    color: colors.textMuted,
  },

  ratingNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },

  commentText: {
    marginTop: spacing(1),
    fontSize: 15,
    color: colors.text,
  },

  serviceText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
  },
});
