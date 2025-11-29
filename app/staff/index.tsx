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
import api from "@/utils/api"; // axios instance

import { useEffect, useState } from "react";
 
interface Booking {
  _id: string;
  status: string;
  date?: string;
  bookingDate?: string;
  time?: string;
  serviceId?: string;
  staffId?: string;
  // thêm field nào backend bạn có
}

export default function StaffHome() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    completed: 0,
    rating: 4.9, // tạm mock, nếu có API rating thì thay sau
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Nếu api.js đã set baseURL = "/api/v1" thì dùng "/booking/get-all"
      // Nếu chưa, dùng "/api/v1/booking/get-all"
      const res = await api.get("/booking/get-all");

      // Tuỳ backend:
      //  - Nếu trả về { data: [...] } thì bookings = res.data.data
      //  - Nếu trả về [ ... ] thì bookings = res.data
      const bookings = Array.isArray(res.data) ? res.data : res.data.data || [];

      const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    const todayBookings = bookings.filter((b: Booking) => {
  const dateStr =
    (b.date && String(b.date).slice(0, 10)) ||
    (b.bookingDate && String(b.bookingDate).slice(0, 10));

  return dateStr === todayStr && b.status !== "cancelled";
});

const pendingBookings = bookings.filter(
  (b: Booking) => b.status === "pending" || b.status === "waiting"
);

const completedBookings = bookings.filter(
  (b: Booking) => b.status === "completed" || b.status === "done"
);


      setStats({
        today: todayBookings.length,
        pending: pendingBookings.length,
        completed: completedBookings.length,
        rating: 4.9, // nếu sau này có API rating thì set từ res khác
      });
    } catch (error) {
      console.log("Lỗi lấy thống kê:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 36 }}>
      {/* HEADER */}
      <LinearGradient
        colors={["#4F46E5", "#7C3AED"]}
        style={styles.headerGradient}
      >
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.headerTitleWhite}>Trang nhân viên</Text>
            <Text style={styles.headerSubWhite}>Xin chào, {user?.full_name || user?.numberPhone}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.avatarWrap, pressed && styles.avatarPressed]}
            onPress={() => router.push('/staff/(stafftabs)/profile')}
          >
            <Image
              source={{ uri: user?.avatar || 'https://phatdat.store/default-avatar.png' }}
              style={styles.avatar}
            />
          </Pressable>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/staff/(stafftabs)/bookings')}>
            <Calendar color="#fff" size={16} />
            <Text style={styles.quickBtnText}>Lịch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/staff/(stafftabs)/services')}>
            <List color="#fff" size={16} />
            <Text style={styles.quickBtnText}>Dịch vụ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/staff/(stafftabs)/profile')}>
            <User color="#fff" size={16} />
            <Text style={styles.quickBtnText}>Hồ sơ</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <ActivityIndicator style={{ marginTop: 10 }} size="large" color="#7C3AED" />

          {/* skeleton-ish cards while loading */}
          <View style={styles.skeletonRow}>
            <View style={[styles.skeletonCard, { height: 110 }]} />
            <View style={[styles.skeletonCard, { height: 110 }]} />
          </View>

          <View style={styles.skeletonRow}>
            <View style={[styles.skeletonCard, { height: 110 }]} />
            <View style={[styles.skeletonCard, { height: 110 }]} />
          </View>
        </View>
      ) : (
        <>
          {/* THỐNG KÊ NHANH */}
          <View style={styles.statsRowLarge}>
            <LinearGradient colors={["#FFB347", "#FFD27F"]} style={[styles.statCardLarge, styles.cardElev]}>
              <View style={styles.statCardTop}><Calendar color="#1F2937" size={18} /></View>
              <Text style={styles.statNumberLarge}>{stats.today}</Text>
              <Text style={styles.statLabelLarge}>Lịch hẹn hôm nay</Text>
            </LinearGradient>

            <LinearGradient colors={["#FF9A9E", "#FFB48A"]} style={[styles.statCardLarge, styles.cardElev] }>
              <View style={styles.statCardTop}><List color="#1F2937" size={18} /></View>
              <Text style={styles.statNumberLarge}>{stats.pending}</Text>
              <Text style={styles.statLabelLarge}>Đang chờ</Text>
            </LinearGradient>
          </View>

          <View style={styles.statsRowLarge}>
            <LinearGradient colors={["#86E3CE", "#A0E7E5"]} style={[styles.statCardLarge, styles.cardElev]}>
              <View style={styles.statCardTop}><ChevronRight color="#1F2937" size={18} /></View>
              <Text style={styles.statNumberLarge}>{stats.completed}</Text>
              <Text style={styles.statLabelLarge}>Hoàn thành</Text>
            </LinearGradient>

            <LinearGradient colors={["#C4B5FD", "#A78BFA"]} style={[styles.statCardLarge, styles.cardElev]}>
              <View style={styles.statCardTop}><Star color="#1F2937" size={18} /></View>
              <Text style={styles.statNumberLarge}>{stats.rating} ★</Text>
              <Text style={styles.statLabelLarge}>Đánh giá</Text>
            </LinearGradient>
          </View>
        </>
      )}

      {/* QUICK ACTIONS (no duplication with tabbar) */}
      <Text style={styles.sectionTitle}>Tạo nhanh</Text>

      <View style={styles.quickActionsRow}>
        <TouchableOpacity style={[styles.quickActionCard, styles.cardElev]} onPress={() => router.push('/booking/create')}>
          <View style={[styles.quickIcon, { backgroundColor: '#FFB347' }]}>
            <Calendar color="#fff" size={18} />
          </View>
          <Text style={styles.quickActionTitle}>Tạo lịch mới</Text>
          <Text style={styles.quickActionSub}>Tạo lịch nhanh cho khách</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionCard, styles.cardElev]} onPress={() => router.push('/staff/serviceId/create')}>
          <View style={[styles.quickIcon, { backgroundColor: '#7C3AED' }]}>
            <List color="#fff" size={18} />
          </View>
          <Text style={styles.quickActionTitle}>Thêm dịch vụ</Text>
          <Text style={styles.quickActionSub}>Tạo dịch vụ mới cho shop</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActionsRow}>
        <TouchableOpacity style={[styles.quickActionCard, styles.cardElev]} onPress={() => router.push('/staff/category/create')}>
          <View style={[styles.quickIcon, { backgroundColor: '#06B6D4' }]}>
            <User color="#fff" size={18} />
          </View>
          <Text style={styles.quickActionTitle}>Thêm danh mục</Text>
          <Text style={styles.quickActionSub}>Tổ chức dịch vụ theo danh mục</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { flex: 1 }]} onPress={() => router.push('/staff/(stafftabs)/bookings')}>
          <View style={[styles.menuIconWrap, { backgroundColor: '#111827' }]}><Calendar color="#fff" size={18} /></View>
          <Text style={styles.menuLabel}>Xem tất cả lịch</Text>
          <ChevronRight color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F7F7",
    flex: 1,
  },

  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerGradient: {
    paddingTop: 36,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitleWhite: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSubWhite: { marginTop: 6, color: 'rgba(255,255,255,0.9)' },
  avatarWrap: { borderRadius: 28, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.16)' },
  avatarPressed: { opacity: 0.8 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  headerActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, gap: 8 },
  quickBtnText: { color: '#FFF', marginLeft: 6, fontWeight: '600', fontSize: 13 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSub: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 18,
  },
  statsRowLarge: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 18 },
  statCardLarge: { width: '48%', padding: 18, borderRadius: 14, minHeight: 110 },
  statCardTop: { position: 'absolute', top: 12, right: 12, opacity: 0.9 },
  statNumberLarge: { fontSize: 28, fontWeight: '900', color: '#1F2937' },
  statLabelLarge: { marginTop: 8, fontSize: 13, color: '#334155' },
  cardElev: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 10 },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 6,
    color: "#444",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 26,
    marginBottom: 10,
    paddingHorizontal: 16,
  },

  skeletonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  skeletonCard: { width: '48%', borderRadius: 14, backgroundColor: '#F1F5F9' },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 12 },
  quickActionCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 14, padding: 14 },
  quickIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionTitle: { fontWeight: '700', fontSize: 15, color: '#1F2937' },
  quickActionSub: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  menuLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});
