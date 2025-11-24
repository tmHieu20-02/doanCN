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

  const [categories, setCategories] = useState<{ label: string; value: number }[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false);

  // Load categories
  const loadCategories = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      if (!token) {
        console.log("CATEGORY ERROR: NO TOKEN");
        return;
      }

      const res = await axios.get("https://phatdat.store/api/v1/category/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const raw = res.data.categories ?? res.data.data ?? [];

      const formatted = raw.map((c: any) => ({
        label: c.name,
        value: c.id,
      }));

      setCategories(formatted);
    } catch (err: any) {
      console.log("CATEGORY ERROR:", err.response?.data || err);
      Alert.alert("Lỗi", "Không thể tải danh mục");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Create service
  const handleCreate = async () => {
    if (!name || !description || !duration || !price || !categoryId) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập đầy đủ thông tin");
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
      Alert.alert("Lỗi", err.response?.data?.message || "Không thể tạo dịch vụ.");
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
              placeholder="Mô tả"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.label}>Thời gian (phút)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 60"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />

            <Text style={styles.label}>Giá dịch vụ</Text>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: 200000"
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
