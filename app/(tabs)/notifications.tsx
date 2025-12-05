import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import {
  Bell,
  Calendar,
  CheckCircle,
  X,
  Settings,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

import { colors, radius, shadow, spacing } from "@/ui/theme";

/* ==============================
   1️⃣ Types
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
   2️⃣ Empty State
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
   3️⃣ API helpers
================================ */
const getToken = async () => {
  const session = await SecureStore.getItemAsync("my-user-session");
  const token = session ? JSON.parse(session).token : null;
  return token;
};

// Fetch all notifications
const fetchNotifications = async (): Promise<any[]> => {
  const token = await getToken();
  const res = await fetch("https://phatdat.store/api/v1/notification/get-all", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json.data || [];
};

// Mark one read
const apiMarkRead = async (id: number) => {
  const token = await getToken();
  await fetch(`https://phatdat.store/api/v1/notification/read/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Mark all read
const apiMarkAll = async () => {
  const token = await getToken();
  await fetch("https://phatdat.store/api/v1/notification/read-all", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Delete notification
const apiDelete = async (id: number) => {
  const token = await getToken();
  await fetch(`https://phatdat.store/api/v1/notification/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ==============================
   4️⃣ Helper Mapping
================================ */
const formatTime = (createdAt?: string) => {
  if (!createdAt) return "";
  try {
    return new Date(createdAt).toLocaleString("vi-VN");
  } catch {
    return "";
  }
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

/* FINAL FIX — mapping bookingId from both BE formats */
const mapNotificationFromApi = (n: any): NotificationItem => {
  let bookingId = n.bookingId;

  // Case BE stores data as object: { bookingId: 12 }
  if (!bookingId && typeof n.data === "object") {
    bookingId = n.data?.bookingId;
  }

  // Case BE stores JSON string: '{"bookingId":12}'
  if (!bookingId && typeof n.data === "string") {
    try {
      const parsed = JSON.parse(n.data);
      bookingId = parsed.bookingId;
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
   5️⃣ Main Component
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
      const mapped = raw.map(mapNotificationFromApi);
      setList(mapped);
    } catch (error) {
      console.log("LOAD NOTIFICATIONS ERROR:", error);
    }
  };

  const unreadCount = list.filter((n) => !n.read).length;

  const filteredList =
    filter === "all"
      ? list
      : filter === "unread"
      ? list.filter((n) => !n.read)
      : list.filter((n) => n.read);

  const markAsRead = async (id: number) => {
    try {
      await apiMarkRead(id);
      setList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.log("MARK READ ERROR:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiMarkAll();
      setList((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.log("MARK ALL READ ERROR:", error);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await apiDelete(id);
      setList((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.log("DELETE NOTIFICATION ERROR:", error);
    }
  };

  /* FIX — Điều hướng đúng screen booking/[id].tsx */
  const openDetail = (item: NotificationItem) => {
  if (!item.bookingId) return;

  router.push({
    pathname: "../booking/[id]",   // FIXED ✔
    params: { id: String(item.bookingId) },
  });
};


  const getIcon = (icon: string, color: string) => {
    switch (icon) {
      case "calendar":
        return <Calendar size={20} color={color} />;
      case "check":
        return <CheckCircle size={20} color={color} />;
      default:
        return <Bell size={20} color={color} />;
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={async () => {
        if (!item.read) await markAsRead(item.id);
        openDetail(item);
      }}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: item.color + "22" },
          ]}
        >
          {getIcon(item.icon, item.color)}
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.cardTitle,
              !item.read && styles.cardTitleUnread,
            ]}
          >
            {item.title}
          </Text>

          <Text style={styles.cardMessage}>{item.message}</Text>

          {item.time && <Text style={styles.cardTime}>{item.time}</Text>}
        </View>

        <TouchableOpacity
          onPress={() => deleteItem(item.id)}
          style={styles.deleteBtn}
        >
          <X size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const FILTERS = [
    { id: "all" as const, label: "Tất cả" },
    { id: "unread" as const, label: "Chưa đọc" },
    { id: "read" as const, label: "Đã đọc" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryAlt]}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Thông báo</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0
                ? `${unreadCount} thông báo mới`
                : "Bạn đã xem hết nội dung"}
            </Text>
          </View>

          <TouchableOpacity style={styles.headerIcon}>
            <Settings size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllWrapper}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Đánh dấu tất cả</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Filter */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[
              styles.filterBtn,
              filter === f.id && styles.filterBtnActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.id && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {filteredList.length ? (
        <FlatList
          data={filteredList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
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
   Styles
================================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    padding: spacing(6),
    paddingBottom: spacing(10),
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    ...shadow.card,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },

  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: colors.textMuted,
  },

  headerIcon: {
    padding: spacing(3),
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
  },

  markAllWrapper: {
    marginTop: spacing(4),
    alignSelf: "flex-end",
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.lg,
  },

  markAllText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "700",
  },

  filterRow: {
    flexDirection: "row",
    padding: spacing(4),
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  filterBtn: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    marginRight: spacing(3),
  },

  filterBtnActive: {
    backgroundColor: colors.primaryDark,
  },

  filterText: {
    fontWeight: "600",
    color: colors.textMuted,
  },

  filterTextActive: {
    color: colors.card,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    marginBottom: spacing(3),
    ...shadow.card,
    position: "relative",
  },

  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryDark,
  },

  row: { flexDirection: "row", alignItems: "flex-start" },

  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing(3),
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  cardTitleUnread: {
    fontWeight: "800",
  },

  cardMessage: {
    color: colors.textMuted,
    marginVertical: spacing(1),
  },

  cardTime: {
    color: colors.textMuted,
    fontSize: 12,
  },

  deleteBtn: {
    padding: spacing(1),
    marginLeft: spacing(2),
  },

  unreadDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryDark,
    top: spacing(3),
    right: spacing(3),
  },

  emptyWrapper: {
    paddingVertical: spacing(20),
    alignItems: "center",
    opacity: 0.85,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: spacing(4),
    color: colors.text,
  },

  emptySubtitle: {
    fontSize: 14,
    marginTop: spacing(2),
    color: colors.textMuted,
    textAlign: "center",
    width: "70%",
  },
});
