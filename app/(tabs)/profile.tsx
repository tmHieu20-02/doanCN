import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "expo-router";

import {
  User,
  Settings,
  Heart,
  CreditCard,
  MapPin,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  Edit3,
  Star,
  Calendar,
  Gift,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Theme
import { colors, radius, shadow, spacing } from "@/ui/theme";

/* ============================
      MOCK DATA
=============================== */

const profileStats = [
  {
    id: 1,
    name: "Lịch hẹn",
    value: "24",
    icon: "calendar",
    color: colors.primaryAlt,
  },
  {
    id: 2,
    name: "Yêu thích",
    value: "8",
    icon: "heart",
    color: "#EC4899",
  },
  {
    id: 3,
    name: "Điểm thưởng",
    value: "1,250",
    icon: "gift",
    color: colors.warning,
  },
];

const menuSections = [
  {
    title: "Tài khoản",
    items: [
      {
        id: "edit-profile",
        name: "Chỉnh sửa hồ sơ",
        icon: "edit",
        color: colors.primary,
      },
      {
        id: "addresses",
        name: "Địa chỉ của tôi",
        icon: "map-pin",
        color: colors.success,
      },
      {
        id: "payment",
        name: "Phương thức thanh toán",
        icon: "credit-card",
        color: colors.warning,
      },
      {
        id: "favorites",
        name: "Dịch vụ yêu thích",
        icon: "heart",
        color: "#EC4899",
      },
    ],
  },
  {
    title: "Cài đặt & hỗ trợ",
    items: [
      {
        id: "notifications",
        name: "Thông báo",
        icon: "bell",
        color: "#06B6D4",
        hasSwitch: true,
        enabled: true,
      },
      {
        id: "privacy",
        name: "Quyền riêng tư",
        icon: "shield",
        color: "#8B5CF6",
      },
      {
        id: "help",
        name: "Trợ giúp & hỗ trợ",
        icon: "help-circle",
        color: colors.success,
      },
    ],
  },
];

/* ============================
      COMPONENT CHÍNH
=============================== */

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { signOut } = useAuth();
  const router = useRouter();

  /* ICON RENDER */
  const getIconComponent = (iconName: string, size = 20, color: string) => {
    const iconProps = { size, color };
    switch (iconName) {
      case "edit":
        return <Edit3 {...iconProps} />;
      case "map-pin":
        return <MapPin {...iconProps} />;
      case "credit-card":
        return <CreditCard {...iconProps} />;
      case "heart":
        return <Heart {...iconProps} />;
      case "bell":
        return <Bell {...iconProps} />;
      case "shield":
        return <Shield {...iconProps} />;
      case "help-circle":
        return <HelpCircle {...iconProps} />;
      case "calendar":
        return <Calendar {...iconProps} />;
      case "gift":
        return <Gift {...iconProps} />;
      default:
        return <User {...iconProps} />;
    }
  };

  /* STAT CARD */
  const renderStatCard = (stat: any) => (
    <View key={stat.id} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color + "18" }]}>
        {getIconComponent(stat.icon, 20, stat.color)}
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statName}>{stat.name}</Text>
    </View>
  );

  /* MENU ITEM */
  const renderMenuItem = (item: any, isLast = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, isLast && styles.menuItemLast]}
      activeOpacity={0.8}
      onPress={() => {
        // TODO: điều hướng theo id nếu cần
      }}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}
        >
          {getIconComponent(item.icon, 20, item.color)}
        </View>
        <Text style={styles.menuItemText}>{item.name}</Text>
      </View>

      <View style={styles.menuItemRight}>
        {item.hasSwitch ? (
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        ) : (
          <ChevronRight size={20} color={colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );

  /* UI CHÍNH */
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER VÀNG CHỦ ĐẠO */}
        <LinearGradient
          colors={[colors.primary, colors.primaryAlt]}
          style={styles.header}
        >
          {/* TOP ROW: TITLE + SETTINGS */}
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerHello}>Hồ sơ</Text>
              <Text style={styles.headerSubtitle}>
                Quản lý tài khoản và ưu đãi của bạn
              </Text>
            </View>

            <TouchableOpacity
              style={styles.settingsButton}
              activeOpacity={0.8}
            >
              <Settings size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* AVATAR + INFO */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200",
                }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Edit3 size={16} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Nguyễn Văn A</Text>
              <Text style={styles.userEmail}>nguyenvana@gmail.com</Text>
              <Text style={styles.userPhone}>+84 123 456 789</Text>

              <View style={styles.membershipBadge}>
                <Star size={14} color={colors.warning} fill={colors.warning} />
                <Text style={styles.membershipText}>Thành viên VIP</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* STATS – FLOATING CARD */}
        <View style={styles.statsWrapper}>
          <View style={styles.statsContainer}>
            {profileStats.map(renderStatCard)}
          </View>
        </View>

        {/* MENU SECTIONS */}
        <View style={styles.menuContainer}>
          {menuSections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.title}</Text>

              <View style={styles.menuCard}>
                {section.items.map((item, index) =>
                  renderMenuItem(item, index === section.items.length - 1)
                )}
              </View>
            </View>
          ))}

          {/* LOGOUT BUTTON */}
          <View style={styles.menuSection}>
            <LinearGradient
              colors={["#F97373", "#EF4444"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutGradient}
            >
              <TouchableOpacity
                style={styles.logoutButtonContent}
                activeOpacity={0.9}
                onPress={async () => {
                  await signOut();
                  router.replace("/(auth)/login");
                }}
              >
                <LogOut size={20} color="#FFF" />
                <Text style={styles.logoutButtonText}>Đăng xuất</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* APP INFO */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>BookingApp v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================
      STYLES ULTRA
=============================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  /* HEADER */
  header: {
    paddingHorizontal: spacing(4),
    paddingTop: spacing(3),
    paddingBottom: spacing(8),
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing(4),
  },
  headerHello: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(0,0,0,0.7)",
    marginTop: spacing(1),
  },
  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    ...shadow.card,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing(1),
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing(3),
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    ...shadow.card,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing(0.5),
  },
  userPhone: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing(0.5),
    marginBottom: spacing(1.5),
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  membershipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.warning,
    marginLeft: spacing(1),
  },

  /* STATS */
  statsWrapper: {
    marginTop: -spacing(6),
    paddingHorizontal: spacing(4),
    marginBottom: spacing(4),
  },
  statsContainer: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing(3),
    flexDirection: "row",
    ...shadow.card,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing(1),
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing(0.5),
  },
  statName: {
    fontSize: 12,
    color: colors.textMuted,
  },

  /* MENU */
  menuContainer: {
    paddingHorizontal: spacing(4),
  },
  menuSection: {
    marginBottom: spacing(4),
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing(1.5),
  },
  menuCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    ...shadow.card,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing(2),
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  menuItemRight: {
    marginLeft: spacing(2),
  },

  /* LOGOUT */
  logoutGradient: {
    borderRadius: radius.lg,
    ...shadow.card,
  },
  logoutButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(3),
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
    marginLeft: spacing(1.5),
  },

  /* APP INFO */
  appInfo: {
    alignItems: "center",
    paddingVertical: spacing(4),
    paddingBottom: spacing(6),
  },
  appInfoText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
