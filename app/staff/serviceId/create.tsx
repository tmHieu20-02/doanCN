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
  Image,
} from "react-native";

import api from "@/utils/api";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, Clock, Tag, DollarSign, ImagePlus } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

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

  /* =============================
        PICK IMAGE
  ============================= */
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
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

  /* =============================
        LOAD CATEGORY
  ============================= */
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
  const run = async () => {
    await loadCategories();
  };
  run();
}, []);


  /* =============================
        CREATE SERVICE
  ============================= */
  const handleCreate = async () => {
    if (!name.trim() || !description.trim() || !duration || !price) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (!imageFile) {
      Alert.alert("Thiếu ảnh", "Chọn ảnh dịch vụ");
      return;
    }
    if (!categoryId) {
      Alert.alert("Lỗi", "Chọn danh mục");
      return;
    }

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const staff = stored ? JSON.parse(stored) : null;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("duration_minutes", String(duration));
      formData.append("price", String(price));
      formData.append("category_id", String(categoryId));
      formData.append("is_active", "true");
      formData.append("image", imageFile);

      await api.post("/service/create", formData, {
        headers: {
          Authorization: `Bearer ${staff?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Thành công", "Đã tạo dịch vụ!");
      router.push("/staff/(stafftabs)/services?reload=1");

    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.mes || "Không thể tạo");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../assets/images/bg-blur.png")}
        style={styles.bg}
        resizeMode="cover"
        imageStyle={{ opacity: 0.18 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>

            {/* HEADER */}
            <View style={styles.headerRow}>
              <Pressable style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={20} color="#111" />
              </Pressable>
              <Text style={styles.title}>Tạo dịch vụ mới</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* INPUT — NAME */}
            <Text style={styles.label}>Tên dịch vụ</Text>
            <View style={styles.inputWrapper}>
              <Tag size={18} color="#8E8E8E" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Massage thư giãn"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#A3A3A3"
              />
            </View>

            {/* DESCRIPTION */}
            <Text style={styles.label}>Mô tả</Text>
            <View style={[styles.inputWrapper, { height: 120 }]}>
              <TextInput
                style={[styles.input, { height: "100%", textAlignVertical: "top" }]}
                placeholder="Nhập mô tả dịch vụ..."
                multiline
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#A3A3A3"
              />
            </View>

            {/* DURATION */}
            <Text style={styles.label}>Thời gian (phút)</Text>
            <View style={styles.inputWrapper}>
              <Clock size={18} color="#8E8E8E" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="60"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
                placeholderTextColor="#A3A3A3"
              />
            </View>

            {/* PRICE */}
            <Text style={styles.label}>Giá dịch vụ</Text>
            <View style={styles.inputWrapper}>
              <DollarSign size={18} color="#8E8E8E" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="200000"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholderTextColor="#A3A3A3"
              />
            </View>

            {/* IMAGE PICKER */}
            <Text style={styles.label}>Ảnh dịch vụ</Text>

            <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
              <ImagePlus size={32} color="#ADADAD" />
              <Text style={styles.uploadText}>
                {image ? "Đổi ảnh" : "Tải ảnh lên"}
              </Text>
            </TouchableOpacity>

            {image && (
              <Image
                source={{ uri: image }}
                style={styles.preview}
                resizeMode="cover"
              />
            )}

            {/* CATEGORY */}
            <Text style={[styles.label, { marginTop: 4 }]}>Danh mục</Text>

            <DropDownPicker
              open={openDropdown}
              value={categoryId}
              items={categories}
              setOpen={setOpenDropdown}
              setValue={setCategoryId}
              setItems={setCategories}
              placeholder="Chọn danh mục dịch vụ"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
            />

            {/* BUTTON */}
            <LinearGradient colors={["#FAD961", "#F76B1C"]} style={styles.btnGradient}>
              <TouchableOpacity style={styles.btn} onPress={handleCreate}>
                <Text style={styles.btnText}>Tạo dịch vụ</Text>
              </TouchableOpacity>
            </LinearGradient>

          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

/* ============================================================
                      PREMIUM ULTRA UI STYLES
============================================================ */
const styles = StyleSheet.create({
  bg: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 40,
    backgroundColor: "#F4F5F7",
  },

  /* CARD */
  card: {
    backgroundColor: "#FFFFFF",
    padding: 26,
    borderRadius: 30,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },

  /* HEADER */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
  },

  /* INPUT LABEL */
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#444",
    marginTop: 10,
  },

  /* INPUT GROUP */
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    borderRadius: 18,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 52,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#111",
  },

  /* IMAGE UPLOAD */
  uploadBox: {
    height: 140,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D7D7D7",
    borderStyle: "dashed",
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  uploadText: {
    marginTop: 10,
    fontSize: 14,
    color: "#777",
    fontWeight: "600",
  },

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    marginBottom: 16,
  },

  /* DROPDOWN */
  dropdown: {
    borderColor: "#D5D5D5",
    borderRadius: 18,
    backgroundColor: "#FAFAFA",
    marginBottom: 12,
  },
  dropdownContainer: {
    borderColor: "#D5D5D5",
    borderRadius: 18,
  },

  /* BUTTON */
  btnGradient: {
    borderRadius: 18,
    marginTop: 10,
    overflow: "hidden",
  },

  btn: {
    paddingVertical: 15,
    alignItems: "center",
  },

  btnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
});
