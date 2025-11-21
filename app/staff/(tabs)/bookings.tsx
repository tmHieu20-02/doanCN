import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

type BookingStatus = "" | "pending" | "confirmed" | "done" | "cancelled";

export default function StaffBooking() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("");

  const fetchBookings = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);

      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const params: any = {
        page: 1,
        limit: 20,
      };
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get(
        "https://phatdat.store/api/v1/booking/get-all",
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(res.data?.data || []);
    } catch (err: any) {
      console.log("Lỗi lấy booking:", err?.response?.data || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings({ silent: true });
  };

  const renderStatusBadge = (status: string) => {
    let bg = "#6B7280";
    let label = status;

    switch (status) {
      case "pending":
        bg = "#F59E0B";
        label = "Chờ xác nhận";
        break;
      case "confirmed":
        bg = "#3B82F6";
        label = "Đã xác nhận";
        break;
      case "done":
        bg = "#10B981";
        label = "Hoàn tất";
        break;
      case "cancelled":
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

  const formatDateTime = (item: any) => {
    const raw =
      item.booking_time ||
      item.dateTime ||
      item.time ||
      item.date ||
      item.created_at;

    if (!raw) return "Không rõ thời gian";

    const d = new Date(raw);
    if (isNaN(d.getTime())) return String(raw);

    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderItem = ({ item }: any) => {
    const serviceName =
      item.service?.name || item.service_name || "Dịch vụ không rõ";
    const customerName =
      item.customer?.name || item.user?.fullName || item.user_name || "Ẩn danh";
    const status = item.status || "pending";

    return (
      <View style={styles.card}>
        <Text style={styles.service}>{serviceName}</Text>
        <Text style={styles.customer}>Khách: {customerName}</Text>

        <View style={styles.rowBetween}>
          <Text style={styles.time}>{formatDateTime(item)}</Text>
          {renderStatusBadge(status)}
        </View>
      </View>
    );
  };

  const renderFilterButton = (label: string, value: BookingStatus) => {
    const active = statusFilter === value;
    return (
      <TouchableOpacity
        onPress={() => setStatusFilter(value)}
        style={[
          styles.filterBtn,
          active && styles.filterBtnActive,
        ]}
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
      <Text style={styles.sub}>
        Xem và quản lý các lịch hẹn được giao cho bạn
      </Text>

      {/* Bộ lọc trạng thái */}
      <View style={styles.filterRow}>
        {renderFilterButton("Tất cả", "")}
        {renderFilterButton("Chờ", "pending")}
        {renderFilterButton("Đã xác nhận", "confirmed")}
        {renderFilterButton("Hoàn tất", "done")}
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
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  sub: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 10,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginRight: 8,
    marginBottom: 8,
  },
  filterBtnActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterText: {
    fontSize: 12,
    color: "#4B5563",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  service: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  customer: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 6,
  },
  time: {
    fontSize: 13,
    color: "#6B7280",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },

  emptyBox: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 15,
  },
});
