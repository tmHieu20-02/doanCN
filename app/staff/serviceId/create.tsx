import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";

export default function CreateService() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");

  // ============================
  // CATEGORY STATES (TYPED)
  // ============================
  const [categories, setCategories] = useState<
    { label: string; value: number }[]
  >([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  // ============================
  // LOAD CATEGORY LIST
  // ============================
 const loadCategories = async () => {
  try {
    const res = await axios.get("https://phatdat.store/api/v1/category/get-all");

    console.log("CATEGORY API:", res.data);

    // 🔥 SỬA TẠI ĐÂY: BE trả về res.data.categories
    const formatted = res.data.categories.map((c: any) => ({
      label: c.name,
      value: c.id,
    }));

    setCategories(formatted);
  } catch (error) {
    console.log("CATEGORY ERROR:", error);
    Alert.alert("Lỗi", "Không thể tải danh mục");
  }
};


  useEffect(() => {
    loadCategories();
  }, []);

  // ============================
  // CREATE SERVICE
  // ============================
  const handleCreate = async () => {
    if (!name || !description || !duration || !price || !categoryId) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const body = {
        name,
        description,
        duration_minutes: Number(duration),
        price: Number(price),
        category_id: categoryId,
        is_active: true,
      };

      const res = await axios.post(
        "https://phatdat.store/api/v1/service/create",
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Thành công", "Đã tạo dịch vụ thành công!");
      router.push("/staff/(stafftabs)/services?reload=1");
    } catch (err: any) {
      console.log("SERVICE ERROR:", err.response?.data);
      Alert.alert(
        "Lỗi",
        err.response?.data?.message || "Không thể tạo dịch vụ."
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tạo dịch vụ mới</Text>

      {/* NAME */}
      <Text style={styles.label}>Tên dịch vụ</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên dịch vụ"
        value={name}
        onChangeText={setName}
      />

      {/* DESCRIPTION */}
      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Mô tả"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* DURATION */}
      <Text style={styles.label}>Thời gian (phút)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ví dụ: 60"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

      {/* PRICE */}
      <Text style={styles.label}>Giá dịch vụ</Text>
      <TextInput
        style={styles.input}
        placeholder="Ví dụ: 200000"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      {/* CATEGORY DROPDOWN */}
      <Text style={styles.label}>Danh mục</Text>

      <DropDownPicker
        open={openDropdown}
        value={categoryId}
        items={categories}
        setOpen={setOpenDropdown}
        setValue={setCategoryId}
        setItems={setCategories}
        placeholder="Chọn danh mục"
        listMode="SCROLLVIEW" // Fix error VirtualizedList
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

      {/* SUBMIT */}
      <TouchableOpacity style={styles.btn} onPress={handleCreate}>
        <Text style={styles.btnText}>Tạo dịch vụ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ===========================
// STYLES
// ===========================
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FFFDF5" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 16,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  btn: {
    backgroundColor: "#FFCC00",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { fontSize: 17, fontWeight: "700" },
});
