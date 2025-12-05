import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";

import { useRouter } from "expo-router";
import { Calendar, List, User, ChevronRight, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/useAuth";
import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

export default function StaffHome() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    completed: 0,
    rating: 0,
  });

  const [loading, setLoading] = useState(true);

  const [avatarVersion, setAvatarVersion] = useState(0);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarVersion((v) => v + 1);
    }
  }, [user?.avatar]);

  const getToken = async () => {
    const stored = await SecureStore.getItemAsync("my-user-session");
    return JSON.parse(stored || "{}")?.token;
  };

  const getTodayCount = async () => {
    const token = await getToken();
    const today = new Date().toISOString().slice(0, 10);

    const url = `/booking/get-all?date=${today}&staff_id=${user?.id}`;
    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return (res.data?.bookings || []).length;
  };

  const getPendingCount = async () => {
    const token = await getToken();
    const url = `/booking/get-all?status=pending&staff_id=${user?.id}`;

    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return (res.data?.bookings || []).length;
  };

  const getCompletedCount = async () => {
    const token = await getToken();
    const url = `/booking/get-all?status=completed&staff_id=${user?.id}`;

    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return (res.data?.bookings || []).length;
  };

  const getStaffRating = async () => {
    const token = await getToken();
    const url = `/rating/get-staff`;

    const res = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const ratings =
      res.data?.date?.rows ||
      res.data?.ratings ||
      res.data?.rating ||
      res.data?.data ||
      [];

    if (!Array.isArray(ratings) || ratings.length === 0) return 0;

    const total = ratings.reduce(
      (sum: number, r: any) => sum + (r.rating || r.rate || 0),
      0
    );

    return Number((total / ratings.length).toFixed(1));
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [today, pending, completed, rating] = await Promise.all([
        getTodayCount(),
        getPendingCount(),
        getCompletedCount(),
        getStaffRating(),
      ]);

      setStats({ today, pending, completed, rating });
    } catch (err) {
      console.log("❌ DASHBOARD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 36 }}
    >
      <LinearGradient
        colors={["#4F46E5", "#7C3AED"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.headerTitleWhite}>Trang nhân viên</Text>
            <Text style={styles.headerSubWhite}>
              Xin chào, {user?.full_name || user?.numberPhone}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.avatarWrap,
              pressed && styles.avatarPressed,
            ]}
            onPress={() => router.push("/staff/(stafftabs)/profile")}
          >
            <Image
              key={avatarVersion}
              source={{
                uri: user?.avatar || "https://phatdat.store/default-avatar.png",
              }}
              style={styles.avatar}
            />
          </Pressable>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push("/staff/(stafftabs)/bookings")}
          >
            <Calendar color="#fff" size={16} />
            <Text style={styles.quickBtnText}>Lịch</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push("/staff/(stafftabs)/services")}
          >
            <List color="#fff" size={16} />
            <Text style={styles.quickBtnText}>Dịch vụ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => router.push("/staff/(stafftabs)/profile")}
          >
            <User color="#fff" size={16} />
            <Text style={styles.quickBtnText}>Hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 30 }}
          size="large"
          color="#7C3AED"
        />
      ) : (
        <>
          {/* ROW 1 */}
          <View style={styles.statsRowLarge}>
            {/* Today */}
            <TouchableOpacity
              style={{ width: "48%" }}
              activeOpacity={0.8}
              onPress={() => router.push("/staff/(stafftabs)/bookings")}
            >
              <LinearGradient
                colors={["#FFB347", "#FFD27F"]}
                style={[styles.statCardLarge, styles.cardElev]}
              >
                <View style={styles.statCardTop}>
                  <Calendar color="#1F2937" size={18} />
                </View>
                <Text style={styles.statNumberLarge}>{stats.today}</Text>
                <Text style={styles.statLabelLarge}>Lịch hẹn hôm nay</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Pending */}
            <TouchableOpacity
              style={{ width: "48%" }}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/staff/(stafftabs)/bookings",
                  params: { tab: "pending" },
                })
              }
            >
              <LinearGradient
                colors={["#FF9A9E", "#FFB48A"]}
                style={[styles.statCardLarge, styles.cardElev]}
              >
                <View style={styles.statCardTop}>
                  <List color="#1F2937" size={18} />
                </View>
                <Text style={styles.statNumberLarge}>{stats.pending}</Text>
                <Text style={styles.statLabelLarge}>Đang chờ</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ROW 2 */}
          <View style={styles.statsRowLarge}>
            {/* Completed */}
            <TouchableOpacity
              style={{ width: "48%" }}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/staff/(stafftabs)/bookings",
                  params: { tab: "completed" },
                })
              }
            >
              <LinearGradient
                colors={["#86E3CE", "#A0E7E5"]}
                style={[styles.statCardLarge, styles.cardElev]}
              >
                <View style={styles.statCardTop}>
                  <ChevronRight color="#1F2937" size={18} />
                </View>
                <Text style={styles.statNumberLarge}>{stats.completed}</Text>
                <Text style={styles.statLabelLarge}>Hoàn thành</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Rating */}
            <TouchableOpacity
              style={{ width: "48%" }}
              activeOpacity={0.8}
              onPress={() => router.push("/staff/(stafftabs)/rating")}
            >
              <LinearGradient
                colors={["#C4B5FD", "#A78BFA"]}
                style={[styles.statCardLarge, styles.cardElev]}
              >
                <View style={styles.statCardTop}>
                  <Star color="#1F2937" size={18} />
                </View>
                <Text style={styles.statNumberLarge}>{stats.rating} ★</Text>
                <Text style={styles.statLabelLarge}>Đánh giá</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

/* ============================
        STYLES
============================ */
const styles = StyleSheet.create({
  container: { backgroundColor: "#F7F7F7", flex: 1 },
  headerGradient: {
    paddingTop: 36,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleWhite: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  headerSubWhite: { marginTop: 6, color: "rgba(255,255,255,0.9)" },
  avatarWrap: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.16)",
  },
  avatarPressed: { opacity: 0.8 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    gap: 8,
  },
  quickBtnText: { color: "#FFF", marginLeft: 6, fontWeight: "600", fontSize: 13 },
  statsRowLarge: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 18,
  },
  statCardLarge: {
    width: "100%",
    padding: 18,
    borderRadius: 14,
    minHeight: 110,
  },
  statCardTop: {
    position: "absolute",
    top: 12,
    right: 12,
    opacity: 0.9,
  },
  statNumberLarge: { fontSize: 28, fontWeight: "900", color: "#1F2937" },
  statLabelLarge: { marginTop: 8, fontSize: 13, color: "#334155" },
  cardElev: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
});
