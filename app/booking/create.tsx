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

export default function CreateBooking() {
  const router = useRouter();

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");

  const loadUserPhone = async () => {
    const stored = await SecureStore.getItemAsync("my-user-session");
    if (!stored) return;
    const user = JSON.parse(stored);
    setPhone(user?.phone || "");
  };

  useEffect(() => {
    loadUserPhone();
  }, []);

  const handleCreate = async () => {
    if (!serviceId || !date || !startTime || !endTime || !phone) {
      Alert.alert("Thiếu dữ liệu", "Vui lòng nhập đầy đủ.");
      return;
    }

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;
      const user = JSON.parse(stored!);

      const body = {
        service_id: Number(serviceId),
        customer_id: user.id,
        booking_date: date,
        number_phone: phone,
        start_time: startTime,
        end_time: endTime,
        note,
      };

      const res = await axios.post(
        "https://phatdat.store/api/v1/booking/create",
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("Thành công", "Đặt lịch thành công!");
      router.replace("/(tabs)/bookings?reload=1");
    } catch (err: any) {
      console.log(err.response?.data);
      Alert.alert("Lỗi", "Không thể đặt lịch.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tạo lịch hẹn</Text>

      <View style={styles.card}>
        <Text style={styles.label}>ID Dịch vụ</Text>
        <TextInput
          style={styles.input}
          value={serviceId}
          onChangeText={setServiceId}
          placeholder="Ví dụ: 3"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Ngày hẹn (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2024-05-01"
        />

        <Text style={styles.label}>Giờ bắt đầu</Text>
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="14:00"
        />

        <Text style={styles.label}>Giờ kết thúc</Text>
        <TextInput
          style={styles.input}
          value={endTime}
          onChangeText={setEndTime}
          placeholder="15:00"
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Ghi chú</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={note}
          onChangeText={setNote}
          placeholder="Ghi chú thêm..."
        />
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createText}>Đặt lịch</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: "#F3F4F6" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  label: { fontSize: 15, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  createBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  createText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
