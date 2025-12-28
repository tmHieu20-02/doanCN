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
import { useState, useEffect, useCallback } from "react";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/hooks/useAuth";
import { Lock, ArrowLeft, MapPin } from "lucide-react-native";

const DRAFT_KEY = "staff-edit-profile-draft";
const MAP_RESULT_KEY = "map-picker-result";

export default function EditStaffProfile() {
  const router = useRouter();
  const { updateUser } = useAuth();

  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [storeLat, setStoreLat] = useState("");
  const [storeLng, setStoreLng] = useState("");

  /* =========================
      1. LOAD PROFILE / DRAFT BAN ĐẦU
  ========================= */
  useEffect(() => {
    const load = async () => {
      const draft = await SecureStore.getItemAsync(DRAFT_KEY);
      const stored = await SecureStore.getItemAsync("my-user-session");
      const data = stored ? JSON.parse(stored) : {};
      const profile = data?.staffProfile;

      if (draft) {
        const d = JSON.parse(draft);
        setStoreName(d.storeName || "");
        setStoreAddress(d.storeAddress || "");
        setExperience(d.experience || "");
        setBio(d.bio || "");
        setIsActive(d.isActive ?? true);
        setStoreLat(d.storeLat ? String(d.storeLat) : "");
        setStoreLng(d.storeLng ? String(d.storeLng) : "");
        return;
      }

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
      2. LẮNG NGHE KẾT QUẢ TỪ BẢN ĐỒ
  ========================= */
  useFocusEffect(
    useCallback(() => {
      const checkMapResult = async () => {
        const result = await SecureStore.getItemAsync(MAP_RESULT_KEY);
        if (result) {
          const { lat, lng } = JSON.parse(result);
          
          // Nhận giá trị string chính xác từ Map (đã toFixed(7))
          setStoreLat(lat);
          setStoreLng(lng);

          // Cập nhật ngay vào bản nháp
          const draft = await SecureStore.getItemAsync(DRAFT_KEY);
          const currentDraft = draft ? JSON.parse(draft) : {};
          await SecureStore.setItemAsync(DRAFT_KEY, JSON.stringify({
            ...currentDraft,
            storeLat: lat,
            storeLng: lng
          }));

          await SecureStore.deleteItemAsync(MAP_RESULT_KEY);
        }
      };
      checkMapResult();
    }, [])
  );

  const saveDraft = async () => {
    await SecureStore.setItemAsync(DRAFT_KEY, JSON.stringify({
      storeName, storeAddress, experience, bio, isActive, storeLat, storeLng
    }));
  };

  const handleSave = async () => {
    if (!storeName.trim()) return Alert.alert("Lỗi", "Tên cửa hàng không được rỗng.");

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const session = JSON.parse(stored || "{}");
      const token = session?.token;

      const res = await api.put("/staff/profile", {
        store_name: storeName,
        store_address: storeAddress,
        experience_years: Number(experience) || 0,
        bio,
        is_active: isActive,
        store_lat: storeLat ? parseFloat(storeLat) : null,
        store_lng: storeLng ? parseFloat(storeLng) : null,
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data?.err === 0) {
        await SecureStore.deleteItemAsync(DRAFT_KEY);
        session.staffProfile = res.data.profile;
        await SecureStore.setItemAsync("my-user-session", JSON.stringify(session));
        await updateUser({ staffProfile: res.data.profile });
        Alert.alert("Thành công", "Đã cập nhật hồ sơ.");
        router.back();
      }
    } catch {
      Alert.alert("Lỗi", "Không thể kết nối máy chủ.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={22} color="#111827" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin làm việc</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Label text="Tên cửa hàng" />
          <Input value={storeName} onChangeText={setStoreName} placeholder="Nhập tên..." />

          <Label text="Địa chỉ chi tiết" />
          <Input value={storeAddress} onChangeText={setStoreAddress} placeholder="Số nhà, đường..." />

          <Label text="Vị trí tọa độ (Lat / Lng)" />
          <View style={styles.row}>
            {/* LockedInput hiển thị số chuẩn xác từ trái sang phải */}
            <LockedInput value={storeLat} placeholder="Latitude" />
            <LockedInput value={storeLng} placeholder="Longitude" />
          </View>

          <TouchableOpacity style={styles.mapBtn} onPress={async () => { await saveDraft(); router.push("/staff/modal/map-picker"); }}>
            <MapPin size={18} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={styles.mapText}>Chọn lại trên bản đồ</Text>
          </TouchableOpacity>

          <Label text="Kinh nghiệm (năm)" />
          <Input value={experience} onChangeText={setExperience} keyboardType="numeric" />

          <Label text="Giới thiệu bản thân" />
          <Input value={bio} onChangeText={setBio} multiline style={{ height: 80 }} />

          <View style={styles.switchRow}>
            <Text style={{ fontWeight: "500" }}>Trạng thái hoạt động</Text>
            <Switch value={isActive} onValueChange={setIsActive} trackColor={{ true: "#2563EB" }} />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const Label = ({ text }: { text: string }) => (
  <Text style={styles.label}>{text}</Text>
);

const Input = (props: any) => (
  <TextInput {...props} style={[styles.input, props.style]} placeholderTextColor="#9CA3AF" />
);

const LockedInput = ({ value, placeholder }: { value: string; placeholder?: string }) => (
  <View style={styles.lockWrap}>
    <TextInput 
      value={value} 
      editable={false} 
      placeholder={placeholder} 
      style={styles.lockedText} 
      textAlignVertical="center"
    />
    <Lock size={14} color="#9CA3AF" />
  </View>
);

const styles = StyleSheet.create({
  header: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, backgroundColor: "#FFF", borderBottomWidth: 1, borderColor: "#E5E7EB" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "700", color: "#111827" },
  container: { padding: 20, paddingBottom: 40 },
  label: { marginTop: 16, marginBottom: 8, fontSize: 14, fontWeight: "600", color: "#374151" },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: "#FFF" },
  row: { flexDirection: "row", gap: 10 },
  lockWrap: { flex: 1, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, backgroundColor: "#F3F4F6", height: 50 },
  lockedText: { flex: 1, color: "#111827", fontSize: 13, padding: 0, margin: 0 },
  mapBtn: { marginTop: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#2563EB", borderRadius: 12, paddingVertical: 12, borderStyle: "dashed" },
  mapText: { color: "#2563EB", fontWeight: "700" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: 12, backgroundColor: "#FFF", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  saveBtn: { marginTop: 32, paddingVertical: 16, backgroundColor: "#2563EB", borderRadius: 14, elevation: 3 },
  saveText: { color: "#FFF", textAlign: "center", fontSize: 16, fontWeight: "700" },
});