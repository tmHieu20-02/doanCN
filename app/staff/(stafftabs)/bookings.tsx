import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { cancelAllBookings as cancelAllService } from "services/bookingService";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

type BookingStatus =
  | ""
  | "pending"
  | "confirmed"
  | "completed"
  | "done"
  | "cancelled";

export default function StaffBooking() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("");

  // ========================================================
  // LOAD BOOKINGS
  // ========================================================
  const fetchBookings = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);

      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const params: any = { page: 1, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get(
        "https://phatdat.store/api/v1/booking/get-all",
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const list = res.data?.bookings || res.data?.data || [];
      setBookings(list);
    } catch (err: any) {
      console.log("❌ Lỗi lấy booking:", err?.response?.data || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings({ silent: true });
  };

  // ========================================================
  // UPDATE STATUS (CONFIRM / COMPLETE)
  // ========================================================
  const confirmBooking = async (
    booking: any,
    nextStatus: "confirmed" | "completed"
  ) => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const body = {
        service_id: booking.service_id,
        booking_date: booking.booking_date,
        start_time: booking.start_time?.slice(0, 5),
        end_time: booking.end_time?.slice(0, 5),
        note: booking.note || "",
        status: nextStatus,
      };

      await axios.put(
        `https://phatdat.store/api/v1/booking/update/${booking.id}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchBookings({ silent: true });
    } catch (err) {
      console.log("❌ Lỗi cập nhật:", err);
    }
  };

  // ========================================================
  // CANCEL ALL BOOKINGS
  // ========================================================
  const handleCancelAllBookings = () => {
    Alert.alert(
      "Hủy lịch hẹn hôm nay",
      "Bạn có chắc muốn hủy TẤT CẢ lịch hẹn hôm nay không?",
      [
        { text: "Không" },
        {
          text: "Hủy tất cả",
          style: "destructive",
          onPress: async () => {
            console.log("Đang gọi lệnh hủy tất cả...");
            try {
              await cancelAllService({
                cancel_note: "Shop nghỉ đột xuất",
              });
              fetchBookings({ silent: true });
            } catch (error) {
              console.log("❌ Lỗi hủy hết:", error);
            }
          },
        },
      ]
    );
  };

  // ========================================================
  // STATUS BADGE
  // ========================================================
  const getStatusBadge = (raw: string) => {
    const s = (raw || "").toLowerCase();

    const map: any = {
      pending: { text: "Chờ xác nhận", bg: "#F59E0B" },
      confirmed: { text: "Đã xác nhận", bg: "#3B82F6" },
      completed: { text: "Hoàn tất", bg: "#10B981" },
      done: { text: "Hoàn tất", bg: "#10B981" },
      cancelled: { text: "Đã hủy", bg: "#EF4444" },
      canceled: { text: "Đã hủy", bg: "#EF4444" },
    };

    return map[s] || { text: "Không rõ", bg: "#6B7280" };
  };

  // ========================================================
  // RENDER ONE BOOKING CARD
  // ========================================================
  const renderItem = ({ item }: any) => {
    const service = item.service || {};
    const serviceName = service.name || "Dịch vụ";

    let serviceType = "Tại salon";
    if (item.booking_type === "at_home") serviceType = "Tại nhà";

    const customerName = item.customer?.full_name || "Ẩn danh";

    const rawPrice =
      item.total_price ??
      item.totalPrice ??
      service.price ??
      service.cost ??
      0;

    const price = Number(rawPrice).toLocaleString("vi-VN") + " đ";
    const badge = getStatusBadge(item.status);

    return (
      <View style={styles.card}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={styles.badgeText}>{badge.text}</Text>
        </View>

        <Text style={styles.serviceName}>{serviceName}</Text>
        <Text style={styles.serviceType}>Loại dịch vụ: {serviceType}</Text>

        {item.booking_type === "at_home" && item.address_text ? (
          <Text style={styles.customer}>Địa chỉ: {item.address_text}</Text>
        ) : null}

        <Text style={styles.customer}>Khách: {customerName}</Text>
        <Text style={styles.price}>Giá: {price}</Text>

        <Text style={styles.time}>
          {item.start_time?.slice(0, 5)} – {item.end_time?.slice(0, 5)} •{" "}
          {item.booking_date?.slice(0, 10)}
        </Text>

        <Text style={styles.note}>
          Ghi chú: {item.note?.trim() || "Không có"}
        </Text>

        <View style={styles.actionRow}>
          {item.status === "pending" && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.confirmBtn]}
              onPress={() => confirmBooking(item, "confirmed")}
            >
              <Text style={styles.actionText}>Xác nhận</Text>
            </TouchableOpacity>
          )}

          {item.status === "confirmed" && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.doneBtn]}
              onPress={() => confirmBooking(item, "completed")}
            >
              <Text style={styles.actionText}>Hoàn tất</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ========================================================
  // FILTER BUTTON
  // ========================================================
  const renderFilterButton = (label: string, value: BookingStatus) => {
    const active = statusFilter === value;

    return (
      <TouchableOpacity
        onPress={() => setStatusFilter(value)}
        style={[styles.filterBtn, active && styles.filterBtnActive]}
      >
        <Text style={[styles.filterText, active && styles.filterTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // ========================================================
  // LOADING
  // ========================================================
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>
          Đang tải lịch hẹn...
        </Text>
      </View>
    );
  }

  // ========================================================
  // MAIN
  // ========================================================
  return (
    <View style={styles.container}>
      {/* HEADER + BACK */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/staff/(stafftabs)")}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Lịch hẹn của bạn</Text>
      </View>

      <TouchableOpacity
        style={styles.cancelAllBtn}
        onPress={handleCancelAllBookings}
      >
        <Text style={styles.cancelAllText}>Hủy lịch hôm nay</Text>
      </TouchableOpacity>

      <Text style={styles.sub}>Xem và quản lý lịch hẹn được giao cho bạn</Text>

      <View style={styles.filterRow}>
        {renderFilterButton("Tất cả", "")}
        {renderFilterButton("Chờ", "pending")}
        {renderFilterButton("Đã xác nhận", "confirmed")}
        {renderFilterButton("Hoàn tất", "completed")}
        {renderFilterButton("Đã hủy", "cancelled")}
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Hiện chưa có lịch hẹn nào</Text>
          </View>
        }
      />
    </View>
  );
}

// ========================================================
// STYLES
// ========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
  },

  backText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
  },

  title: { fontSize: 22, fontWeight: "800", color: "#111827" },

  sub: { fontSize: 14, color: "#6B7280", marginBottom: 12 },

  cancelAllBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 10,
  },
  cancelAllText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#fff",
  },
  filterBtnActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  filterTextActive: { color: "#fff" },

  card: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { color: "#FFF", fontWeight: "700", fontSize: 10 },

  serviceName: { fontSize: 17, fontWeight: "800", color: "#111827" },
  serviceType: { fontSize: 13, color: "#6B7280", marginTop: 4 },

  customer: { fontSize: 14, color: "#374151", marginTop: 6 },

  price: { fontSize: 14, color: "#1F2937", fontWeight: "700", marginTop: 4 },

  time: { fontSize: 12, color: "#6B7280", marginTop: 8 },

  note: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
    fontStyle: "italic",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 10,
  },

  actionBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8 },
  confirmBtn: { backgroundColor: "#2563EB" },
  doneBtn: { backgroundColor: "#10B981" },

  actionText: { color: "#FFF", fontSize: 12, fontWeight: "700" },

  emptyBox: { marginTop: 40, alignItems: "center" },
  emptyText: { color: "#6B7280", fontSize: 14 },
});
