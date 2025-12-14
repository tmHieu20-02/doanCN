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
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/hooks/useAuth";
import { Lock, ArrowLeft } from "lucide-react-native";

const DRAFT_KEY = "staff-edit-profile-draft";

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
     LOAD PROFILE / DRAFT
     (Draft KHÔNG set lat/lng)
  ========================= */
  useEffect(() => {
    const load = async () => {
      const draft = await SecureStore.getItemAsync(DRAFT_KEY);

      if (draft) {
        const d = JSON.parse(draft);
        setStoreName(d.storeName || "");
        setStoreAddress(d.storeAddress || "");
        setExperience(d.experience || "");
        setBio(d.bio || "");
        setIsActive(d.isActive ?? true);
        return;
      }

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
     (Map là source of truth)
  ========================= */
  useEffect(() => {
    if (params.selectedLat && params.selectedLng) {
      const lat = String(params.selectedLat);
      const lng = String(params.selectedLng);

      setStoreLat(lat);
      setStoreLng(lng);

      // 🔥 Update lại draft với vị trí MỚI
      SecureStore.setItemAsync(
        DRAFT_KEY,
        JSON.stringify({
          storeName,
          storeAddress,
          experience,
          bio,
          isActive,
          storeLat: lat,
          storeLng: lng,
        })
      );
    }
  }, [params.selectedLat, params.selectedLng]);

  /* =========================
     SAVE DRAFT (TRƯỚC KHI MỞ MAP)
  ========================= */
  const saveDraft = async () => {
    await SecureStore.setItemAsync(
      DRAFT_KEY,
      JSON.stringify({
        storeName,
        storeAddress,
        experience,
        bio,
        isActive,
        storeLat,
        storeLng,
      })
    );
  };

  /* =========================
     SAVE PROFILE (FINAL)
  ========================= */
  const handleSave = async () => {
    if (!storeName.trim()) {
      return Alert.alert(
        "Thiếu thông tin",
        "Tên địa điểm làm việc không được để trống."
      );
    }

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored || "{}")?.token;

      const res = await api.put(
        "/staff/profile",
        {
          store_name: storeName,
          store_address: storeAddress,
          experience_years: Number(experience) || 0,
          bio,
          is_active: isActive,
          store_lat: storeLat ? Number(storeLat) : null,
          store_lng: storeLng ? Number(storeLng) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.err === 0) {
        await SecureStore.deleteItemAsync(DRAFT_KEY);

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
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        {/* Header custom */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin làm việc</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Label text="Tên cửa hàng" />
          <Input value={storeName} onChangeText={setStoreName} />

          <Label text="Địa chỉ" />
          <Input value={storeAddress} onChangeText={setStoreAddress} />

          <Label text="Kinh nghiệm (năm)" />
          <Input
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
          />

          <Label text="Giới thiệu" />
          <Input
            value={bio}
            onChangeText={setBio}
            multiline
            style={{ height: 100 }}
          />

          <Label text="Vị trí làm việc" />
          <View style={styles.row}>
            <LockedInput value={storeLat} />
            <LockedInput value={storeLng} />
          </View>

          <TouchableOpacity
            style={styles.mapBtn}
            onPress={async () => {
              await saveDraft();
              router.push({
                pathname: "../modal/map-picker",
                params: {
                  lat: storeLat || "10.762622",
                  lng: storeLng || "106.660172",
                },
              });
            }}
          >
            <Text style={styles.mapText}>Chọn trên bản đồ</Text>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text>Đang nhận khách</Text>
            <Switch value={isActive} onValueChange={setIsActive} />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/* =========================
   UI COMPONENTS
========================= */
const Label = ({ text }: { text: string }) => (
  <Text style={{ marginTop: 14, marginBottom: 6 }}>{text}</Text>
);

const Input = (props: any) => (
  <TextInput {...props} style={[styles.input, props.style]} />
);

const LockedInput = ({ value }: { value: string }) => (
  <View style={styles.lockWrap}>
    <TextInput value={value} editable={false} style={{ flex: 1 }} />
    <Lock size={14} />
  </View>
);

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  lockWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  mapBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 10,
  },
  mapText: {
    color: "#2563EB",
    textAlign: "center",
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveBtn: {
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: "#2563EB",
    borderRadius: 12,
  },
  saveText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },
});
