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
  Image,
} from "react-native";

import api from "@/utils/api";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";

export default function CreateService() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");

  const [image, setImage] = useState<string | null>(null);

  const [categories, setCategories] = useState<
    { label: string; value: number }[]
  >([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  // ================================
  // PICK IMAGE (preview only)
  // ================================
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images", // đúng format Expo 2025
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImage(base64Image);
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
    } catch (err) {
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

    if (!categoryId || Number(categoryId) <= 0) {
      Alert.alert("Lỗi", "Vui lòng chọn danh mục");
      return;
    }

    if (isNaN(Number(duration)) || Number(duration) < 1) {
      Alert.alert("Lỗi", "Thời gian phải là số ≥ 1");
      return;
    }

    if (isNaN(Number(price)) || Number(price) < 10000) {
      Alert.alert("Lỗi", "Giá phải ≥ 10000");
      return;
    }

    try {
      const body = {
        name,
        description,
        duration_minutes: Number(duration),
        price: Number(price),
        category_id: Number(categoryId),
        is_active: true,
      };

      await api.post("/service/create", body);

      Alert.alert("Thành công", "Đã tạo dịch vụ thành công!");
      router.push("/staff/(stafftabs)/services?reload=1");
    } catch (err: any) {
      console.log("AXIOS ERROR:", err.response?.data);
      Alert.alert("Lỗi", err.response?.data?.message || "Không thể tạo dịch vụ");
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
            <Text style={styles.title}>Tạo dịch vụ mới</Text>

            {/* IMAGE PREVIEW */}
            <TouchableOpacity onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.preview} />
              ) : (
                <View style={styles.imagePicker}>
                  <Text style={{ color: "#777" }}>Chọn hình dịch vụ</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Tên dịch vụ</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên dịch vụ"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả dịch vụ"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Thời gian (phút)</Text>
            <TextInput
              style={styles.input}
              placeholder="60"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />

            <Text style={styles.label}>Giá dịch vụ</Text>
            <TextInput
              style={styles.input}
              placeholder="200000"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={styles.label}>Danh mục</Text>
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

            <TouchableOpacity style={styles.btn} onPress={handleCreate}>
              <Text style={styles.btnText}>Tạo dịch vụ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

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
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 22,
    color: "#222",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  preview: {
    width: "100%",
    height: 150,
    borderRadius: 14,
    marginBottom: 16,
  },
  imagePicker: {
    height: 150,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
  },
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
  btn: {
    backgroundColor: "#FFD600",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
});
