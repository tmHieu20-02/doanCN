import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useRouter } from "expo-router";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

export default function CreateCategory() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // CHỌN ẢNH VÀ UPLOAD
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Lỗi", "Bạn phải cấp quyền truy cập ảnh trong cài đặt.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled) return;

    const localUri = result.assets[0].uri;
    setUploading(true);

    try {
      const url = await uploadToCloudinary(localUri);
      setImageUrl(url);
    } catch (error: any) {
      Alert.alert("Lỗi Upload", error.message || "Không upload được ảnh.");
    } finally {
      setUploading(false);
    }
  };

  // GỬI DATA VỀ SERVER
  const handleCreate = async () => {
    if (!name || !description || !imageUrl) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập đầy đủ tên, mô tả và chọn ảnh.");
      return;
    }

    setLoading(true);
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      if (!stored) {
        Alert.alert("Lỗi", "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        return;
      }

      const session = JSON.parse(stored);
      const token = session.token;

      const body = {
        name: name.trim(),
        description: description.trim(),
        image: imageUrl,
      };

      const res = await axios.post(
        "https://phatdat.store/api/v1/category/create",
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200 || res.status === 201) {
        Alert.alert("Thành công", "Đã tạo danh mục mới!");
        router.push("/staff/(stafftabs)/services?reload=1");
      }
    } catch (err: any) {
      console.error("Lỗi tạo danh mục:", err?.response?.data || err.message);
      const msg = err?.response?.data?.message || "Lỗi 403 hoặc lỗi Server.";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo danh mục mới</Text>

      <Text style={styles.label}>Tên danh mục</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên danh mục..."
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        placeholder="Nhập mô tả chi tiết..."
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Hình ảnh</Text>
      <TouchableOpacity 
        style={[styles.uploadBtn, uploading && { opacity: 0.7 }]} 
        onPress={pickImage}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#8A6D00" />
        ) : (
          <Text style={styles.uploadText}>Chọn ảnh từ thư viện</Text>
        )}
      </TouchableOpacity>

      {imageUrl ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUrl }} style={styles.preview} />
          <Text style={styles.successUrl}>✓ Đã upload lên Cloudinary</Text>
        </View>
      ) : null}

      <TouchableOpacity 
        style={[styles.submitBtn, loading && { backgroundColor: "#ccc" }]} 
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.submitText}>Xác nhận tạo</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FFFDF5", flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 8, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  uploadBtn: {
    backgroundColor: "#FFE082",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#BCA24A",
  },
  uploadText: { fontWeight: "bold", color: "#8A6D00" },
  previewContainer: { marginBottom: 20, alignItems: "center" },
  preview: { width: "100%", height: 200, borderRadius: 10 },
  successUrl: { fontSize: 12, color: "green", marginTop: 5 },
  submitBtn: {
    backgroundColor: "#FFCC00",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { fontSize: 16, fontWeight: "bold", color: "#000" },
});