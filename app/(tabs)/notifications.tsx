import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  Calendar,
  CheckCircle,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

import { colors, radius, shadow, spacing } from "@/ui/theme";

/* ==============================
   TYPES
================================ */
type NotificationItem = {
  id: number;
  type?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: "calendar" | "check" | "bell";
  color: string;
  bookingId?: string;
};

/* ==============================
   API HELPERS
================================ */
const getToken = async () => {
  const session = await SecureStore.getItemAsync("my-user-session");
  return session ? JSON.parse(session).token : null;
};

const fetchNotifications = async (): Promise<any[]> => {
  const token = await getToken();
  // Đảm bảo URL này đúng với server của bạn
  const res = await fetch(
    "https://phatdat.store/api/v1/notification/get-all",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const json = await res.json();
  return json.data || [];
};

const apiMarkRead = async (id: number) => {
  const token = await getToken();
  await fetch(
    `https://phatdat.store/api/v1/notification/read/${id}`,
    { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
  );
};

const apiDelete = async (id: number) => {
  const token = await getToken();
  await fetch(
    `https://phatdat.store/api/v1/notification/${id}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
};

/* ==============================
   HELPERS (PHẦN BẠN ĐANG THIẾU)
================================ */
const formatTime = (createdAt?: string) => {
  if (!createdAt) return "";
  return new Date(createdAt).toLocaleString("vi-VN");
};

const getIconName = (type?: string): NotificationItem["icon"] => {
  switch (type) {
    case "booking_created":
    case "booking_reminder":
      return "calendar";
    case "booking_confirmed":
    case "booking_incoming":
    case "booking_completed":
      return "check";
    default:
      return "bell";
  }
};

const getColorByType = (type?: string): string => {
  switch (type) {
    case "booking_created":
    case "booking_reminder":
      return colors.primaryDark;
    case "booking_confirmed":
    case "booking_incoming":
    case "booking_completed":
      return colors.success;
    case "booking_canceled":
      return colors.warning;
    default:
      return colors.primary;
  }
};

/* ==============================
   EMPTY STATE COMPONENT (PHẦN BẠN ĐANG THIẾU)
================================ */
const EmptyState = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <View style={styles.emptyWrapper}>
    {icon}
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

/* ==============================
   MAP API → UI
================================ */
const mapNotificationFromApi = (n: any): NotificationItem => {
  let bookingId = n.bookingId;

  if (!bookingId && typeof n.data === "object") {
    bookingId = n.data?.bookingId;
  }

  if (!bookingId && typeof n.data === "string") {
    try {
      bookingId = JSON.parse(n.data)?.bookingId;
    } catch {}
  }

  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    time: formatTime(n.createdAt),
    read: !!n.isRead,
    icon: getIconName(n.type),
    color: getColorByType(n.type),
    bookingId: bookingId ? String(bookingId) : undefined,
  };
};

/* ==============================
   MAIN SCREEN
================================ */
export default function NotificationsScreen() {
  const [list, setList] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const raw = await fetchNotifications();
      if (Array.isArray(raw)) {
        setList(raw.map(mapNotificationFromApi));
      }
    } catch (error) {
      console.log("Error loading notifications:", error);
    }
  };

  const unreadCount = list.filter((n) => !n.read).length;

  const filteredList =
    filter === "all"
      ? list
      : filter === "unread"
      ? list.filter((n) => !n.read)
      : list.filter((n) => n.read);

  const openDetail = async (item: NotificationItem) => {
    if (!item.read) {
      setList((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
      await apiMarkRead(item.id);
    }
    
    if (!item.bookingId) return;

    // SỬA LỖI ROUTER: Thêm 'as any' để tránh báo lỗi đỏ
    router.push({
      pathname: "/booking/[id]",
      params: { id: item.bookingId },
    } as any);
  };

  const handleDelete = (id: number, title: string) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa thông báo: "${title}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setList((prev) => prev.filter((item) => item.id !== id));
            try {
              await apiDelete(id);
            } catch (error) {
              console.log("Error deleting:", error);
              loadData();
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => openDetail(item)}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: item.color + "22" },
          ]}
        >
          {item.icon === "calendar" ? (
            <Calendar size={20} color={item.color} />
          ) : item.icon === "check" ? (
            <CheckCircle size={20} color={item.color} />
          ) : (
            <Bell size={20} color={item.color} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, !item.read && styles.bold]}>
            {item.title}
          </Text>
          <Text style={styles.cardMessage}>{item.message}</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>

        <TouchableOpacity onPress={() => handleDelete(item.id, item.title)} style={{ padding: 4 }}>
          <X size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={[colors.primary, colors.primaryAlt]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Thông báo</Text>
        <Text style={styles.headerSubtitle}>
          {unreadCount
            ? `${unreadCount} thông báo mới`
            : "Bạn đã xem hết"}
        </Text>
      </LinearGradient>

      {filteredList.length ? (
        <FlatList
          data={filteredList}
          renderItem={renderItem}
          keyExtractor={(i) => i.id.toString()}
          contentContainerStyle={{ padding: 20 }}
        />
      ) : (
        <EmptyState
          icon={<Bell size={64} color={colors.border} />}
          title="Không có thông báo"
          subtitle="Thông báo mới sẽ xuất hiện tại đây"
        />
      )}
    </SafeAreaView>
  );
}

/* ==============================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    padding: spacing(6),
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", color: colors.text },
  headerSubtitle: { marginTop: 4, color: colors.textMuted },
  card: {
    backgroundColor: colors.card,
    padding: spacing(4),
    borderRadius: radius.lg,
    marginBottom: spacing(3),
    ...shadow.card,
  },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: colors.primaryDark },
  row: { flexDirection: "row" },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing(3),
  },
  cardTitle: { fontSize: 16, color: colors.text },
  bold: { fontWeight: "800" },
  cardMessage: { color: colors.textMuted },
  cardTime: { fontSize: 12, color: colors.textMuted },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryDark,
    position: "absolute",
    top: 10,
    right: 10,
  },
  emptyWrapper: { alignItems: "center", marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { color: colors.textMuted },
});