import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ImageBackground,
  Pressable,
} from "react-native";

import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Clock, Tag, DollarSign } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";

export default function CreateService() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);

  const [categories, setCategories] = useState<
    { label: string; value: number }[]
  >([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [openDropdown, setOpenDropdown] = useState(false);

  // ================================
  // CHỌN ẢNH - UPLOAD FILE
  // ================================
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setImage(asset.uri);
      setImageFile({
        uri: asset.uri,
        name: asset.fileName ?? "service.jpg",
        type: asset.mimeType ?? "image/jpeg",
      });
    }
  };

  // ================================
  // LOAD CATEGORY
  // ================================
  const loadCategories = async () => {
    try {
      const res = await api.get("/category/get-all");
      const raw = res.data.categories ?? res.data.data ?? [];

      setCategories(
        raw.map((c: any) => ({
          label: c.name,
          value: Number(c.id),
        }))
      );
    } catch {
      Alert.alert("Lỗi", "Không thể tải danh mục");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ================================
  // CREATE SERVICE
  // ================================
  const handleCreate = async () => {
    if (!name.trim() || !description.trim() || !duration || !price) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (!imageFile) {
      Alert.alert("Thiếu ảnh", "Vui lòng chọn ảnh dịch vụ");
      return;
    }

    if (!categoryId || Number(categoryId) <= 0) {
      Alert.alert("Lỗi", "Vui lòng chọn danh mục");
      return;
    }

    let token = "";
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const staff = stored ? JSON.parse(stored) : null;
      token = staff?.token ?? "";

      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy token đăng nhập");
        return;
      }

      // Tạo formData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("duration_minutes", String(duration));
      formData.append("price", String(price));
      formData.append("category_id", String(categoryId));
      formData.append("is_active", "true");
      formData.append("image", imageFile); // FILE UPLOAD

      const res = await api.post("/service/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Thành công", "Đã tạo dịch vụ thành công!");
      router.push("/staff/(stafftabs)/services?reload=1");
    } catch (err: any) {
      const msg =
        err?.response?.data?.mes ||
        err?.response?.data ||
        err?.message ||
        "Không thể tạo dịch vụ";
      Alert.alert("Lỗi", String(msg));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../assets/images/bg-blur.png")}
        style={styles.bg}
        resizeMode="contain"
        imageStyle={{ opacity: 0.15 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={18} color="#111827" />
              </Pressable>

              <Text style={styles.title}>Tạo dịch vụ mới</Text>
              <View style={{ width: 34 }} />
            </View>

            {/* Name */}
            <Text style={styles.label}>Tên dịch vụ</Text>
            <View style={styles.inputRow}>
              <View style={styles.leftIcon}>
                <Tag size={16} color="#6B7280" />
              </View>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="Nhập tên dịch vụ"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Description */}
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả dịch vụ"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {/* Duration */}
            <Text style={styles.label}>Thời gian (phút)</Text>
            <View style={styles.inputRow}>
              <View style={styles.leftIcon}>
                <Clock size={16} color="#6B7280" />
              </View>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="60"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Price */}
            <Text style={styles.label}>Giá dịch vụ</Text>
            <View style={styles.inputRow}>
              <View style={styles.leftIcon}>
                <DollarSign size={16} color="#6B7280" />
              </View>
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="200000"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* IMAGE UPLOAD */}
            <Text style={styles.label}>Ảnh dịch vụ</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={{ color: "#555" }}>
                {image ? "Đổi ảnh" : "Chọn ảnh dịch vụ"}
              </Text>
            </TouchableOpacity>

            {image && (
              <Image
                source={{ uri: image }}
                style={{ width: "100%", height: 200, borderRadius: 12, marginBottom: 16 }}
                resizeMode="cover"
              />
            )}

            {/* CATEGORY */}
            <Text style={[styles.label, { marginBottom: 8 }]}>Danh mục</Text>
            <DropDownPicker
              open={openDropdown}
              value={categoryId}
              items={categories}
              setOpen={setOpenDropdown}
              setValue={setCategoryId}
              setItems={setCategories}
              placeholder="Chọn danh mục"
              listMode="SCROLLVIEW"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />

            {/* SUBMIT */}
            <LinearGradient colors={["#FFD600", "#FFC107"]} style={styles.btnGradient}>
              <TouchableOpacity style={[styles.btn]} onPress={handleCreate}>
                <Text style={styles.btnText}>Tạo dịch vụ</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

// ================================
// STYLES
// ================================
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 50,
    backgroundColor: "#F8F8F8",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 26,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 60,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 22,
    color: "#111827",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#444",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
  },
  inputRow: { flexDirection: "row", alignItems: "center" },
  leftIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  inputWithIcon: { flex: 1, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: "top" },
  dropdown: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  imagePicker: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  btnGradient: { borderRadius: 16, marginTop: 10, overflow: "hidden" },
  btn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  btnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
});
