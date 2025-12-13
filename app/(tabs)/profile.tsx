import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  // LOẠI BỎ SafeAreaView cũ
  // SafeAreaView,
  Animated,
} from "react-native";

// IMPORT SafeAreaView TỪ CONTEXT
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

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
import * as ImagePicker from "expo-image-picker";
import { uploadAvatar } from "@/utils/uploadAvatar";
import { colors, radius, shadow, spacing } from "@/ui/theme";

/* ================================ MENU CONFIG ================================ */

const menuSections = [
  {
    title: "Tài khoản",
    items: [
      { id: "edit-profile", name: "Chỉnh sửa hồ sơ", icon: "edit", color: colors.primary },
      { id: "addresses", name: "Địa chỉ của tôi", icon: "map-pin", color: colors.success },
      { id: "payment", name: "Phương thức thanh toán", icon: "credit-card", color: colors.warning },
      { id: "favorites", name: "Dịch vụ yêu thích", icon: "heart", color: "#EC4899" },
    ],
  },
  {
    title: "Cài đặt & hỗ trợ",
    items: [
      { id: "notifications", name: "Thông báo", icon: "bell", color: "#06B6D4", hasSwitch: true },
      { id: "privacy", name: "Quyền riêng tư", icon: "shield", color: "#8B5CF6" },
      { id: "help", name: "Trợ giúp & hỗ trợ", icon: "help-circle", color: colors.success },
    ],
  },
];

/* ================================ MAIN COMPONENT ================================ */

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar ? user.avatar : "https://phatdat.store/default-avatar.png"
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  /* ===================== FIX QUAN TRỌNG: SYNC SESSION SAU UPDATE ===================== */

  useEffect(() => {
    const syncSession = async () => {
      const stored = await SecureStore.getItemAsync("my-user-session");
      if (stored) {
        const data = JSON.parse(stored);

        if (user && data.full_name) {
          user.full_name = data.full_name;
        }

        if (data.avatar) setAvatarUrl(data.avatar);
      }
    };

    syncSession();
  }, []);

  /* ================================ AVATAR PICKER ================================ */

  const openPickerSheet = () => {
    setShowPicker(true);
    Animated.timing(slideAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  };

  const closePickerSheet = () => {
    Animated.timing(slideAnim, { toValue: 0, duration: 240, useNativeDriver: true }).start(() =>
      setShowPicker(false)
    );
  };

  const handleChangeAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Cần quyền truy cập thư viện ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;

    // Cập nhật UI ngay lập tức
    setAvatarUrl(imageUri);

    // Lưu avatar mới vào session
    const stored = await SecureStore.getItemAsync("my-user-session");
    if (stored) {
      const session = JSON.parse(stored);
      session.avatar = imageUri;
      await SecureStore.setItemAsync("my-user-session", JSON.stringify(session));
    }

    // ⚡ Thông báo ngay lập tức (không chờ upload)
    alert("Cập nhật ảnh đại diện thành công!");

    // ⚙ Upload chạy nền, không block UI
    uploadAvatar(imageUri).catch(() => { });
  };

  /* ================================ RENDER ================================ */

  const getIconComponent = (name: string, size = 20, color: string) => {
    const p = { size, color };
    switch (name) {
      case "edit": return <Edit3 {...p} />;
      case "map-pin": return <MapPin {...p} />;
      case "credit-card": return <CreditCard {...p} />;
      case "heart": return <Heart {...p} />;
      case "bell": return <Bell {...p} />;
      case "shield": return <Shield {...p} />;
      case "help-circle": return <HelpCircle {...p} />;
      case "calendar": return <Calendar {...p} />;
      case "gift": return <Gift {...p} />;
      default: return <User {...p} />;
    }
  };

  return (
    // FIX: Dùng SafeAreaView từ Context
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* HEADER */}
        <LinearGradient colors={[colors.primary, colors.primaryAlt]} style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.headerHello}>Hồ sơ</Text>
              <Text style={styles.headerSubtitle}>Quản lý tài khoản và ưu đãi của bạn</Text>
            </View>

            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* PROFILE */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />

              <TouchableOpacity style={styles.editAvatarButton} onPress={openPickerSheet}>
                <Edit3 size={16} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.full_name || "Người dùng"}</Text>
              {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
              {user?.numberPhone && <Text style={styles.userPhone}>{user.numberPhone}</Text>}

              <View style={styles.membershipBadge}>
                <Star size={14} color={colors.warning} fill={colors.warning} />
                <Text style={styles.membershipText}>Thành viên</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* MENU */}
        <View style={styles.menuContainer}>
          {menuSections.map((section) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.title}</Text>

              <View style={styles.menuCard}>
                {section.items.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      if (item.id === "edit-profile") {
                        router.push("/profile/edit");
                      }

                      if (item.id === "favorites") {
                        router.push("../favorite");
                      }
                    }}

                    style={[
                      styles.menuItem,
                      index === section.items.length - 1 && styles.menuItemLast,
                    ]}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
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
                          thumbColor="#FFF"
                        />
                      ) : (
                        <ChevronRight size={20} color={colors.textMuted} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* LOGOUT */}
          <LinearGradient colors={["#F97373", "#EF4444"]} style={styles.logoutGradient}>
            <TouchableOpacity
              style={styles.logoutButtonContent}
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

        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>BookingApp v1.0.0</Text>
        </View>
      </ScrollView>

      {/* BOTTOM SHEET */}
      {showPicker && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closePickerSheet}>
          <Animated.View
            style={[
              styles.bottomSheetUltra,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [350, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.dragHandle} />
            <Text style={styles.sheetTitleUltra}>Chọn ảnh đại diện</Text>

            <LinearGradient colors={["#FFD600", "#FF9F00"]} style={styles.ultraButtonGradient}>
              <TouchableOpacity
                style={styles.ultraButton}
                onPress={async () => {
                  closePickerSheet();
                  await handleChangeAvatar();
                }}
              >
                <Text style={styles.ultraButtonText}>Chọn ảnh từ thư viện</Text>
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity style={styles.ultraCancel} onPress={closePickerSheet}>
              <Text style={styles.ultraCancelText}>Hủy</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ================================ STYLES ================================ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

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

  headerHello: { fontSize: 22, fontWeight: "800", color: colors.text },
  headerSubtitle: { fontSize: 13, color: "rgba(0,0,0,0.7)", marginTop: spacing(1) },

  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    ...shadow.card,
  },

  profileSection: { flexDirection: "row", alignItems: "center", marginTop: spacing(1) },
  avatarContainer: { position: "relative", marginRight: spacing(3) },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: "#fff" },

  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    backgroundColor: "#fff",
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    ...shadow.card,
  },

  profileInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: "800", color: colors.text },
  userEmail: { fontSize: 13, color: colors.textMuted, marginTop: spacing(0.5) },
  userPhone: { fontSize: 13, color: colors.textMuted, marginTop: spacing(0.5), marginBottom: spacing(1.5) },

  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(245,158,11,0.12)",
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.4)",
  },

  membershipText: { fontSize: 13, fontWeight: "600", color: colors.warning, marginLeft: spacing(1) },

  menuContainer: { paddingHorizontal: spacing(4) },
  menuSection: { marginBottom: spacing(4) },
  menuSectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: spacing(1.5) },
  menuCard: { backgroundColor: colors.card, borderRadius: radius.lg, ...shadow.card },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuItemLast: { borderBottomWidth: 0 },

  menuItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing(2),
  },
  menuItemText: { fontSize: 15, fontWeight: "600", color: colors.text },
  menuItemRight: { marginLeft: spacing(2) },

  logoutGradient: { borderRadius: radius.lg, ...shadow.card },
  logoutButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing(3),
  },
  logoutButtonText: { fontSize: 15, fontWeight: "700", color: "#fff", marginLeft: spacing(1.5) },

  appInfo: { alignItems: "center", paddingVertical: spacing(4), paddingBottom: spacing(6) },
  appInfoText: { fontSize: 13, color: colors.textMuted },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  bottomSheetUltra: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingTop: 20,
    paddingBottom: 35,
    paddingHorizontal: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: -5 },
    elevation: 30,
  },

  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: "rgba(120,120,120,0.35)",
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 18,
  },

  sheetTitleUltra: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 22,
  },

  ultraButtonGradient: {
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 2,
  },

  ultraButton: {
    width: "100%",
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  ultraButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  ultraCancel: {
    marginTop: 4,
    paddingVertical: 15,
  },

  ultraCancelText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "#777",
  },
});