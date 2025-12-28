import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Animated,
  Platform,
  Dimensions,
} from "react-native";

// FIX LỖI: Import useSafeAreaInsets
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
  Star,
  Camera,
} from "lucide-react-native";

import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { uploadAvatar } from "@/utils/uploadAvatar";
import { colors, radius, shadow } from "@/ui/theme";

/* ================================ MENU CONFIG ================================ */

const menuSections = [
  {
    title: "Tài khoản cá nhân",
    items: [
      { id: "edit-profile", name: "Chỉnh sửa hồ sơ", icon: <User size={20} color="#6366F1" />, bgColor: "#EEF2FF" },
      { id: "addresses", name: "Địa chỉ đã lưu", icon: <MapPin size={20} color="#10B981" />, bgColor: "#ECFDF5" },
      { id: "payment", name: "Thanh toán", icon: <CreditCard size={20} color="#F59E0B" />, bgColor: "#FFFBEB" },
      { id: "favorites", name: "Dịch vụ yêu thích", icon: <Heart size={20} color="#EF4444" />, bgColor: "#FEF2F2" },
    ],
  },
  {
    title: "Ứng dụng & Hỗ trợ",
    items: [
      { id: "notifications", name: "Thông báo đẩy", icon: <Bell size={20} color="#3B82F6" />, bgColor: "#EFF6FF", hasSwitch: true },
      { id: "privacy", name: "Quyền riêng tư", icon: <Shield size={20} color="#8B5CF6" />, bgColor: "#F5F3FF" },
      { id: "help", name: "Trung tâm trợ giúp", icon: <HelpCircle size={20} color="#6B7280" />, bgColor: "#F9FAFB" },
    ],
  },
];

/* ================================ MAIN COMPONENT ================================ */

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets(); // Hook lấy khoảng cách tai thỏ/status bar

  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar ? user.avatar : "https://phatdat.store/default-avatar.png"
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const syncSession = async () => {
      const stored = await SecureStore.getItemAsync("my-user-session");
      if (stored) {
        const data = JSON.parse(stored);
        if (user && data.full_name) user.full_name = data.full_name;
        if (data.avatar) setAvatarUrl(data.avatar);
      }
    };
    syncSession();
  }, []);

  const openPickerSheet = () => {
    setShowPicker(true);
    Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, bounciness: 5 }).start();
  };

  const closePickerSheet = () => {
    Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setShowPicker(false));
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
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;
    const imageUri = result.assets[0].uri;
    setAvatarUrl(imageUri);

    const stored = await SecureStore.getItemAsync("my-user-session");
    if (stored) {
      const session = JSON.parse(stored);
      session.avatar = imageUri;
      await SecureStore.setItemAsync("my-user-session", JSON.stringify(session));
    }
    uploadAvatar(imageUri).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* PREMIUM HEADER - Cân đối lại khoảng cách */}
        <LinearGradient 
          colors={["#FFE7C2", "#FFD08A"]} 
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerActionRow}>
            <View />
            <TouchableOpacity style={styles.glassButton}>
              <Settings size={22} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileMainRow}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarBorder}>
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              </View>
              <TouchableOpacity style={styles.cameraBadge} onPress={openPickerSheet} activeOpacity={0.8}>
                <Camera size={14} color="#FFF" fill="#4B5563" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileTextInfo}>
              <Text style={styles.userNameText} numberOfLines={1}>
                {user?.full_name || "Khách hàng"}
              </Text>
              <Text style={styles.userSubText}>
                {user?.numberPhone || "09x-xxxx-xxx"}
              </Text>
              <View style={styles.statusBadge}>
                <LinearGradient colors={["#F59E0B", "#D97706"]} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.badgeGradient}>
                  <Star size={10} color="#FFF" fill="#FFF" />
                  <Text style={styles.badgeText}>Thành viên Vàng</Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* MENU SECTIONS */}
        <View style={styles.contentBody}>
          {menuSections.map((section, sIdx) => (
            <View key={sIdx} style={styles.sectionWrapper}>
              <Text style={styles.sectionTitleText}>{section.title}</Text>
              <View style={styles.menuGroupCard}>
                {section.items.map((item, iIdx) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.6}
                    onPress={() => {
                      if (item.id === "edit-profile") router.push("/profile/edit");
                      if (item.id === "favorites") router.push("../favorite");
                    }}
                    style={[styles.menuRowItem, iIdx === section.items.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={styles.menuRowLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                        {item.icon}
                      </View>
                      <Text style={styles.menuNameText}>{item.name}</Text>
                    </View>

                    {item.hasSwitch ? (
                      <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: "#D1D5DB", true: "#FFD08A" }}
                        thumbColor={notificationsEnabled ? "#F59E0B" : "#F3F4F6"}
                      />
                    ) : (
                      <ChevronRight size={18} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* DANGER ZONE */}
          <TouchableOpacity 
            style={styles.logoutBtn} 
            activeOpacity={0.8}
            onPress={async () => {
              await signOut();
              router.replace("/(auth)/login");
            }}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Phiên bản 1.0.2 • PhatDat Store</Text>
        </View>
      </ScrollView>

      {/* MODERN BOTTOM SHEET */}
      {showPicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{flex:1}} onPress={closePickerSheet} />
          <Animated.View style={[styles.sheetContent, { transform: [{ translateY: slideAnim.interpolate({ inputRange:[0,1], outputRange:[300,0] }) }] }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetHeaderTitle}>Thay đổi ảnh đại diện</Text>
            <Text style={styles.sheetSubTitle}>Chọn ảnh rõ mặt để hiển thị tốt nhất</Text>
            
            <TouchableOpacity style={styles.sheetActionBtn} onPress={handleChangeAvatar}>
              <LinearGradient colors={["#FFD08A", "#F59E0B"]} style={styles.sheetActionGradient}>
                <Text style={styles.sheetActionText}>Tải ảnh lên từ thiết bị</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.sheetCancelBtn} onPress={closePickerSheet}>
              <Text style={styles.sheetCancelText}>Để sau</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

/* ================================ STYLES ================================ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 35, // Giảm padding bottom để header gọn hơn
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...shadow.card,
  },
  headerActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5, // Giảm margin đẩy profile lên cao
  },
  glassButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileMainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarBorder: {
    padding: 4,
    backgroundColor: "#FFF",
    borderRadius: 50,
    ...shadow.card,
  },
  avatarImage: {
    width: 80, // Tinh chỉnh kích thước avatar
    height: 80,
    borderRadius: 40,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4B5563",
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileTextInfo: {
    marginLeft: 18,
    flex: 1,
  },
  userNameText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  userSubText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 1,
    fontWeight: "500",
  },
  statusBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
  },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFF",
    marginLeft: 4,
    textTransform: "uppercase",
  },
  contentBody: {
    paddingHorizontal: 20,
    marginTop: -30, // Tăng độ đè lên header
  },
  sectionWrapper: {
    marginBottom: 20,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
    marginBottom: 10,
    marginLeft: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  menuGroupCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingVertical: 2,
    ...shadow.card,
  },
  menuRowItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    paddingVertical: 16,
    borderRadius: 20,
    marginTop: 5,
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
    marginLeft: 10,
  },
  versionText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 11,
    color: "#D1D5DB",
    fontWeight: "500",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  sheetContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 45,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeaderTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1F2937",
    textAlign: "center",
  },
  sheetSubTitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 25,
  },
  sheetActionBtn: {
    width: "100%",
  },
  sheetActionGradient: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  sheetActionText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  sheetCancelBtn: {
    marginTop: 15,
    paddingVertical: 10,
  },
  sheetCancelText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "600",
  },
});