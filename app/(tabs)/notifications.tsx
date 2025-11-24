import React, { useState } from "react";
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

import { colors, radius, shadow, spacing } from "@/ui/theme";

// ==============================
// 1️⃣ Empty State
// ==============================
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

// ==============================
// 2️⃣ Dummy Data
// ==============================
const notifications = [
  {
    id: 1,
    type: "booking_reminder",
    title: "Nhắc nhở lịch hẹn",
    message: "Bạn có lịch hẹn cắt tóc vào 14:30 ngày mai",
    time: "5 phút trước",
    read: false,
    icon: "calendar",
    color: colors.primaryDark,
  },
  {
    id: 2,
    type: "booking_confirmed",
    title: "Lịch hẹn đã được xác nhận",
    message: "Spa Premium đã xác nhận lịch hẹn massage",
    time: "2 giờ trước",
    read: false,
    icon: "check",
    color: colors.success,
  },
  {
    id: 3,
    type: "promotion",
    title: "Ưu đãi đặc biệt",
    message: "Giảm 20% cho dịch vụ cuối tuần",
    time: "1 ngày trước",
    read: true,
    icon: "bell",
    color: colors.warning,
  },
];

// ==============================
// 3️⃣ Main Component
// ==============================
export default function NotificationsScreen() {
  const [list, setList] = useState(notifications);
  const [filter, setFilter] = useState("all");

  const unreadCount = list.filter((n) => !n.read).length;

  const filteredList =
    filter === "all"
      ? list
      : filter === "unread"
      ? list.filter((n) => !n.read)
      : list.filter((n) => n.read);

  const markAsRead = (id: number) =>
    setList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllAsRead = () =>
    setList((prev) => prev.map((n) => ({ ...n, read: true })));

  const deleteItem = (id: number) =>
    setList((prev) => prev.filter((n) => n.id !== id));

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

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => !item.read && markAsRead(item.id)}
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
          <Text style={styles.cardTime}>{item.time}</Text>
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
    { id: "all", label: "Tất cả" },
    { id: "unread", label: "Chưa đọc" },
    { id: "read", label: "Đã đọc" },
  ];

  return (
    <SafeAreaView style={styles.container}>

      {/* ======================= HEADER (đẹp – canh phải) ======================= */}
    {/* ===== HEADER ===== */}
<LinearGradient
  colors={[colors.primary, colors.primaryAlt]}
  style={styles.header}
>
  {/* --- TOP ROW: TITLE + SETTINGS --- */}
  <View style={styles.headerTopRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.headerTitle}>Thông báo</Text>
      <Text style={styles.headerSubtitle}>
        {unreadCount > 0
          ? `${unreadCount} thông báo mới`
          : "Bạn đã xem hết nội dung"}
      </Text>
    </View>

    {/* Bánh răng bên phải */}
    <TouchableOpacity style={styles.headerIcon}>
      <Settings size={20} color={colors.text} />
    </TouchableOpacity>
  </View>

  {/* --- BOTTOM RIGHT: MARK ALL AS READ --- */}
  {unreadCount > 0 && (
    <TouchableOpacity
      style={styles.markAllWrapper}
      onPress={markAllAsRead}
    >
      <Text style={styles.markAllText}>Đánh dấu tất cả</Text>
    </TouchableOpacity>
  )}
</LinearGradient>


      {/* ======================= FILTER ======================= */}
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

      {/* ======================= LIST ======================= */}
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

// ==============================
// 4️⃣ Styles
// ==============================
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

/* Button “Đánh dấu tất cả” nằm dưới - bên phải */
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

  /* --- Filters --- */
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

  /* --- Notification Card --- */
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

  /* --- Empty State --- */
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
