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
import { cancelAllBookings as cancelAllService } from "../serviceId/bookingService";
import * as SecureStore from "expo-secure-store";

// ✅ Thêm "completed" vào union
type BookingStatus = "" | "pending" | "confirmed" | "completed" | "done" | "cancelled";

export default function StaffBooking() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("");

  // ==========================
  // 🔵 GET ALL BOOKINGS
  // ==========================
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

      const list =
        res.data?.bookings || res.data?.data || res.data?.items || [];

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

  // ==========================
  // 🔵 CONFIRM 1 BOOKING
  // ==========================
  const confirmBooking = async (booking: any, nextStatus: "confirmed" | "completed") => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const body = {
        service_id: booking.service_id,
        booking_date: booking.booking_date,
        start_time: booking.start_time?.slice(0, 5),
        end_time: booking.end_time?.slice(0, 5),
        note: booking.note || "",
        status: nextStatus, // "confirmed" hoặc "completed"
      };

      await axios.put(
        `https://phatdat.store/api/v1/booking/update/${booking.id}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchBookings({ silent: true });
    } catch (error: any) {
      console.log("❌ Lỗi cập nhật:", error?.response?.data || error);
    }
  };

  // ==========================
  // 🔵 HỦY TẤT CẢ LỊCH HẸN (FINAL)
  // ==========================
  const handleCancelAllBookings = () => {
    Alert.alert(
      "Hủy toàn bộ lịch hẹn hôm nay",
      "Bạn có chắc muốn hủy TẤT CẢ lịch hẹn hôm nay không?",
      [
        { text: "Không" },
        {
          text: "Hủy tất cả",
          style: "destructive",
          onPress: async () => {
            try {
              const body = {
                cancel_note: "Shop nghỉ đột xuất",
              };

              const res = await cancelAllService(body);
              console.log("🔥 HỦY TOÀN BỘ THÀNH CÔNG:", res.data);

              fetchBookings({ silent: true });
            } catch (error: any) {
              console.log("❌ Lỗi hủy all:", error?.response?.data || error);
            }
          },
        },
      ]
    );
  };

  // ==========================
  // 🔵 UI
  // ==========================
  const renderStatusBadge = (statusRaw: string) => {
    const status = (statusRaw || "").toLowerCase();

    let bg = "#6B7280";
    let label = statusRaw;

    switch (status) {
      case "pending":
        bg = "#F59E0B";
        label = "Chờ xác nhận";
        break;
      case "confirmed":
        bg = "#3B82F6";
        label = "Đã xác nhận";
        break;
      case "completed":
      case "done":
        bg = "#10B981";
        label = "Hoàn tất";
        break;
      case "cancelled":
      case "canceled":
        bg = "#EF4444";
        label = "Đã hủy";
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: any) => {
    const serviceName =
      item.service?.name || item.service_name || "Dịch vụ";

    const customerName =
      item.customer?.full_name || item.user_name || "Ẩn danh";

    const price =
      item.service?.price || item.total_price || 0;

    const status: string = item.status || "pending";

    return (
      <View style={styles.card}>
        <View style={{ position: "absolute", top: 10, right: 10 }}>
          {renderStatusBadge(status)}
        </View>

        <Text style={styles.service}>{serviceName}</Text>
        <Text style={styles.customer}>Khách: {customerName}</Text>
        <Text style={styles.customer}>Giá: {price.toLocaleString()}đ</Text>

        <Text style={styles.time}>
          {item.start_time?.slice(0, 5)} - {item.end_time?.slice(0, 5)} •{" "}
          {item.booking_date?.slice(0, 10)}
        </Text>

        {/* Hành động theo trạng thái */}
        <View style={styles.actionRow}>
          {status === "pending" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#2563EB" }]}
              onPress={() => confirmBooking(item, "confirmed")}
            >
              <Text style={styles.actionText}>Xác nhận</Text>
            </TouchableOpacity>
          )}

          {status === "confirmed" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#10B981" }]}
              onPress={() => confirmBooking(item, "completed")}
            >
              <Text style={styles.actionText}>Hoàn tất</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 10, color: "#4B5563" }}>
          Đang tải lịch hẹn...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch hẹn của bạn</Text>

      {/* 🔥 NÚT HỦY TẤT CẢ LỊCH HẸN */}
      <TouchableOpacity
        style={styles.cancelAllBtn}
        onPress={handleCancelAllBookings}
      >
        <Text style={styles.cancelAllText}>Hủy lịch hôm nay</Text>
      </TouchableOpacity>

      <Text style={styles.sub}>
        Xem và quản lý các lịch hẹn được giao cho bạn
      </Text>

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
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 10 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Hiện chưa có lịch hẹn nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7", padding: 16 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 22, fontWeight: "700", color: "#111827" },

  sub: { fontSize: 13, color: "#6B7280", marginTop: 4, marginBottom: 14 },

  cancelAllBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  cancelAllText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: "#FFF",
  },
  filterBtnActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterText: { fontSize: 12, color: "#4B5563", fontWeight: "500" },
  filterTextActive: { color: "#FFF" },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  service: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 2 },
  customer: { fontSize: 13, color: "#374151", marginTop: 2 },

  time: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },

  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: { color: "#FFF", fontSize: 10, fontWeight: "600" },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionText: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  emptyBox: { alignItems: "center", marginTop: 60 },
  emptyText: { color: "#6B7280", fontSize: 14 },
});
