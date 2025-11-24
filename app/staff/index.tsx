import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Calendar, List, User, ChevronRight } from "lucide-react-native";
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
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang nhân viên</Text>
        <Text style={styles.headerSub}>Xin chào, {user?.numberPhone}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 30 }} size="large" />
      ) : (
        <>
          {/* THỐNG KÊ NHANH */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#FFD27F" }]}>
              <Text style={styles.statNumber}>{stats.today}</Text>
              <Text style={styles.statLabel}>Lịch hẹn hôm nay</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#FFB48A" }]}>
              <Text style={styles.statNumber}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Đang chờ</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: "#A0E7E5" }]}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: "#C4B5FD" }]}>
              <Text style={styles.statNumber}>{stats.rating} ★</Text>
              <Text style={styles.statLabel}>Đánh giá</Text>
            </View>
          </View>
        </>
      )}

      {/* MENU CHÍNH */}
      <Text style={styles.sectionTitle}>Chức năng</Text>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push("/staff/(stafftabs)/bookings")}
      >
        <Calendar color="#444" size={22} />
        <Text style={styles.menuLabel}>Quản lý lịch hẹn</Text>
        <ChevronRight color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push("/staff/(stafftabs)/services")}
      >
        <List color="#444" size={22} />
        <Text style={styles.menuLabel}>Dịch vụ</Text>
        <ChevronRight color="#999" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => router.push("/staff/(stafftabs)/profile")}
      >
        <User color="#444" size={22} />
        <Text style={styles.menuLabel}>Hồ sơ nhân viên</Text>
        <ChevronRight color="#999" />
      </TouchableOpacity>
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
  menuLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});
