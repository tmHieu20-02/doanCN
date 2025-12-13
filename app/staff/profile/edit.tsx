import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/hooks/useAuth";
import { Lock } from "lucide-react-native";

export default function EditStaffProfile() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    selectedLat?: string;
    selectedLng?: string;
  }>();
  const { updateUser } = useAuth();

  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [storeLat, setStoreLat] = useState("");
  const [storeLng, setStoreLng] = useState("");

  /* =========================
     LOAD PROFILE
  ========================= */
  useEffect(() => {
    const load = async () => {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const data = stored ? JSON.parse(stored) : {};
      const profile = data?.staffProfile;

      if (profile) {
        setStoreName(profile.store_name || "");
        setStoreAddress(profile.store_address || "");
        setExperience(String(profile.experience_years || ""));
        setBio(profile.bio || "");
        setIsActive(profile.is_active ?? true);
        setStoreLat(profile.store_lat ? String(profile.store_lat) : "");
        setStoreLng(profile.store_lng ? String(profile.store_lng) : "");
      }
    };

    load();
  }, []);

  /* =========================
     UPDATE FROM MAP PICKER
  ========================= */
  useEffect(() => {
    if (params.selectedLat && params.selectedLng) {
      setStoreLat(String(params.selectedLat));
      setStoreLng(String(params.selectedLng));
      Alert.alert("Thành công", "Đã cập nhật vị trí từ bản đồ.");
    }
  }, [params.selectedLat, params.selectedLng]);

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
    if (!storeName.trim()) {
      return Alert.alert(
        "Thiếu thông tin",
        "Tên địa điểm làm việc không được để trống."
      );
    }

    if (storeLat && isNaN(Number(storeLat)))
      return Alert.alert("Lỗi", "Lat không hợp lệ.");
    if (storeLng && isNaN(Number(storeLng)))
      return Alert.alert("Lỗi", "Lng không hợp lệ.");

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored || "{}")?.token;

      const body = {
        store_name: storeName,
        store_address: storeAddress,
        experience_years: Number(experience) || 0,
        bio,
        is_active: isActive,
        store_lat: storeLat ? Number(storeLat) : null,
        store_lng: storeLng ? Number(storeLng) : null,
      };

      const res = await api.put("/staff/profile", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.err === 0) {
        const saved = stored ? JSON.parse(stored) : {};
        saved.staffProfile = res.data.profile;

        await SecureStore.setItemAsync(
          "my-user-session",
          JSON.stringify(saved)
        );
        await updateUser({ staffProfile: res.data.profile });

        Alert.alert("Thành công", "Đã cập nhật thông tin làm việc.");
        router.back();
      } else {
        Alert.alert("Lỗi", res.data?.mes || "Không thể cập nhật.");
      }
    } catch {
      Alert.alert("Lỗi", "Không thể kết nối server.");
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      edges={["top", "left", "right"]}
    >
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.header}>Thông tin làm việc</Text>

        <Text style={styles.label}>Tên địa điểm / cửa hàng</Text>
        <TextInput
          style={styles.input}
          value={storeName}
          onChangeText={setStoreName}
          placeholder="VD: Barber Phát Đạt, Spa Minh Anh..."
        />

        <Text style={styles.label}>Địa chỉ làm việc</Text>
        <TextInput
          style={styles.input}
          value={storeAddress}
          onChangeText={setStoreAddress}
          placeholder="Nhập địa chỉ nơi cung cấp dịch vụ"
        />

        <Text style={styles.label}>Kinh nghiệm (năm)</Text>
        <TextInput
          style={styles.input}
          value={experience}
          onChangeText={setExperience}
          keyboardType="numeric"
          placeholder="VD: 3"
        />

        <Text style={styles.label}>Giới thiệu ngắn</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="Mô tả kinh nghiệm, kỹ năng, phong cách làm việc..."
        />

        <Text style={styles.label}>Vị trí làm việc</Text>
        <View style={styles.locationRow}>
          <View style={styles.lockedInputWrapper}>
            <TextInput
              style={styles.locationInput}
              placeholder="Lat"
              value={storeLat}
              editable={false}
            />
            <Lock size={16} color="#6B7280" style={styles.lockIcon} />
          </View>

          <View style={{ width: 10 }} />

          <View style={styles.lockedInputWrapper}>
            <TextInput
              style={styles.locationInput}
              placeholder="Lng"
              value={storeLng}
              editable={false}
            />
            <Lock size={16} color="#6B7280" style={styles.lockIcon} />
          </View>
        </View>

        {/* ✅ FIX: PUSH MODAL — KHÔNG ĐỔI TAB, KHÔNG RESET */}
        <TouchableOpacity
          style={styles.mapBtn}
          onPress={() =>
            router.push({
              pathname: "/staff/modal/map-picker",
              params: {
                lat: storeLat || "10.762622",
                lng: storeLng || "106.660172",
              },
            })
          }
        >
          <Text style={styles.mapText}>Chọn vị trí trên bản đồ</Text>
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Đang nhận khách</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#767577", true: "#2563EB" }}
            thumbColor={isActive ? "#fff" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Lưu thông tin</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  contentContainer: { flex: 1, padding: 18, backgroundColor: "#F8FAFC" },
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1F2937",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
    color: "#1F2937",
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1F2937",
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  lockedInputWrapper: { flex: 1, position: "relative" },
  locationInput: {
    backgroundColor: "#E5E7EB",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#6B7280",
    paddingRight: 40,
  },
  lockIcon: { position: "absolute", right: 12, top: 12 },
  mapBtn: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },
  mapText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    alignItems: "center",
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "700",
  },
});
