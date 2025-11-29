import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function BookingDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  // =============================
  //  Load booking theo ID
  // =============================
  const fetchBooking = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const res = await axios.get(
        "https://phatdat.store/api/v1/booking/get-all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const found = res.data.data.find((b: any) => b.id == id);
      setBooking(found);
    } catch (err: any) {
      console.log("Lỗi:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  // =============================
  //  Update booking
  // =============================
  const updateBooking = async () => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      await axios.put(
        `https://phatdat.store/api/v1/booking/update/${id}`,
        {
          service_id: Number(booking.service_id),
          booking_date: booking.booking_date,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status,
          note: booking.note,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", "Cập nhật booking thành công!");
      router.push("/staff/(stafftabs)/bookings?reload=1");

    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err?.response?.data?.message || "Không thể cập nhật booking"
      );
    }
  };

  // =============================
  //  Staff KHÔNG được hủy booking theo ID
  // =============================
  const cancelBooking = () => {
    Alert.alert(
      "Không thể hủy lịch",
      "Nhân viên không được phép hủy lịch theo ID. Muốn hủy, hãy dùng chức năng 'Hủy tất cả lịch hẹn hôm nay' trong trang quản lý.",
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#6B7280" }}>Không tìm thấy booking</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa booking</Text>

      <View style={styles.card}>
        <Text style={styles.label}>ID Dịch vụ</Text>
        <TextInput
          style={styles.input}
          value={String(booking.service_id)}
          onChangeText={(t) =>
            setBooking({ ...booking, service_id: Number(t) })
          }
          keyboardType="numeric"
        />

        <Text style={styles.label}>Ngày booking</Text>
        <TextInput
          style={styles.input}
          value={booking.booking_date}
          onChangeText={(t) => setBooking({ ...booking, booking_date: t })}
        />

        <Text style={styles.label}>Giờ bắt đầu</Text>
        <TextInput
          style={styles.input}
          value={booking.start_time}
          onChangeText={(t) => setBooking({ ...booking, start_time: t })}
        />

        <Text style={styles.label}>Giờ kết thúc</Text>
        <TextInput
          style={styles.input}
          value={booking.end_time}
          onChangeText={(t) => setBooking({ ...booking, end_time: t })}
        />

        <Text style={styles.label}>Trạng thái</Text>
        <TextInput
          style={styles.input}
          value={booking.status}
          onChangeText={(t) => setBooking({ ...booking, status: t })}
        />

        <Text style={styles.label}>Ghi chú</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={booking.note || ""}
          onChangeText={(t) => setBooking({ ...booking, note: t })}
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={updateBooking}>
        <Text style={styles.saveText}>Cập nhật</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={cancelBooking}>
        <Text style={styles.deleteText}>Không thể hủy lịch tại đây</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F3F4F6" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },

  input: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 14,
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  deleteBtn: {
    backgroundColor: "#9CA3AF",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  deleteText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
