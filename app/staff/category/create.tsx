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
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useRouter } from "expo-router";

import { uploadToCloudinary } from "@/utils/uploadToCloudinary";  // ⚡ IMPORT

export default function CreateCategory() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // CHỌN ẢNH
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Lỗi", "Bạn phải cấp quyền truy cập ảnh.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    const localUri = result.assets[0].uri;

    setUploading(true);

    try {
      const url = await uploadToCloudinary(localUri);   // ⚡ UPLOAD CLOUDINARY
      setImageUrl(url);
    } catch (error) {
      Alert.alert("Lỗi", "Không upload được ảnh lên Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  // GỬI API
  const handleCreate = async () => {
    if (!name || !description || !imageUrl) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const body = {
        name,
        description,
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
        Alert.alert("Thành công", "Tạo danh mục thành công!");
        router.push("/staff/(stafftabs)/services?reload=1");
        return;
      }

      Alert.alert("Lỗi", res.data?.message || "Không tạo được danh mục.");
    } catch (err) {
      Alert.alert("Lỗi server", "Không thể tạo danh mục.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tạo danh mục mới</Text>

      <Text style={styles.label}>Tên danh mục</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập tên danh mục"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        multiline
        placeholder="Nhập mô tả"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Hình ảnh</Text>

      <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
        <Text style={styles.uploadText}>
          {uploading ? "Đang upload..." : "Chọn ảnh"}
        </Text>
      </TouchableOpacity>

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.preview} />
      ) : null}

      <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
        <Text style={styles.submitText}>Tạo danh mục</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FFFDF5", flex: 1 },
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
  uploadBtn: {
    backgroundColor: "#FFE082",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  uploadText: { fontWeight: "700", color: "#8A6D00" },
  preview: { width: "100%", height: 200, borderRadius: 12, marginBottom: 20 },
  submitBtn: {
    backgroundColor: "#FFCC00",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: { fontSize: 17, fontWeight: "700" },
});
