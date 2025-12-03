import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, radius, shadow, spacing } from "../../ui/theme";
import { AppIcons } from "@/ui/icons";


export default function CreateBooking() {
  const router = useRouter();

  // 👉 LẤY serviceId GỬI TỪ MÀN SERVICE DETAIL
  const { serviceId: paramServiceId } = useLocalSearchParams();

  const [serviceId, setServiceId] = useState<string>("");
  const [services, setServices] = useState<any[]>([]);

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lấy số điện thoại
  const loadUserPhone = async () => {
    const stored = await SecureStore.getItemAsync("my-user-session");
    if (!stored) return;
    const user = JSON.parse(stored);
    setPhone(user?.numberPhone || "");
  };

  // 👉 FETCH SERVICES nhưng KHÔNG auto chọn service 0
  const fetchServices = async () => {
    try {
      setLoading(true);
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const res = await axios.get(
        "https://phatdat.store/api/v1/service/get-all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data?.data || [];
      setServices(data);

      // 👉 NẾU CÓ PARAM serviceId THÌ DÙNG NÓ
      if (paramServiceId) {
        setServiceId(String(paramServiceId));
      }

      console.log("SERVICE DATA:", data);
    } catch (err: any) {
      console.log("FETCH SERVICES ERROR:", err?.response?.data || err);
      Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserPhone();
    fetchServices();
  }, []);

  const handleCreate = async () => {
    if (!serviceId || !phone) {
      Alert.alert(
        "Thiếu dữ liệu",
        "Thiếu serviceId hoặc số điện thoại."
      );
      return;
    }

    if (endTime <= startTime) {
      Alert.alert("Thời gian không hợp lệ", "Giờ kết thúc phải lớn hơn giờ bắt đầu.");
      return;
    }

    try {
      setSubmitting(true);
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;
      const user = JSON.parse(stored!);

      const body = {
        service_id: Number(serviceId),
        customer_id: user.id,
        booking_date: date.toISOString().slice(0, 10),
        number_phone: phone,
        start_time: startTime.toTimeString().slice(0, 5),
        end_time: endTime.toTimeString().slice(0, 5),
        note,
      };

      console.log("BOOKING BODY:", body);

      await axios.post(
        "https://phatdat.store/api/v1/booking/create",
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", "Đặt lịch thành công!");
      router.replace("/(tabs)/bookings?reload=1");
    } catch (err: any) {
      console.log("BOOKING ERROR:", err?.response?.data || err);
      Alert.alert("Lỗi", "Không thể đặt lịch.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);
  const formatTime = (d: Date) => d.toTimeString().slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.screenTitle}>Tạo lịch hẹn</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardTitle}>Thông tin đặt lịch</Text>
            <Text style={styles.cardSubtitle}>
              Vui lòng chọn ngày giờ phù hợp với bạn
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {loading ? "Đang tải..." : "Sẵn sàng"}
            </Text>
          </View>
        </View>

        {/* Ngày */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Ngày hẹn</Text>
          <TouchableOpacity
            style={styles.inputLike}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.inputText}>{formatDate(date)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(e, selected) => {
                setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}
        </View>

        {/* Giờ bắt đầu */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Giờ bắt đầu</Text>
          <TouchableOpacity
            style={styles.inputLike}
            onPress={() => setShowStartPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.inputText}>{formatTime(startTime)}</Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour
              onChange={(e, selected) => {
                setShowStartPicker(false);
                if (selected) setStartTime(selected);
              }}
            />
          )}
        </View>

        {/* Giờ kết thúc */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Giờ kết thúc</Text>
          <TouchableOpacity
            style={styles.inputLike}
            onPress={() => setShowEndPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.inputText}>{formatTime(endTime)}</Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              is24Hour
              onChange={(e, selected) => {
                setShowEndPicker(false);
                if (selected) setEndTime(selected);
              }}
            />
          )}
        </View>

        {/* Note */}
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={styles.textArea}
            value={note}
            onChangeText={setNote}
            placeholder="Thêm ghi chú (không bắt buộc)"
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          submitting && { opacity: 0.7 },
          (!serviceId || loading) && { opacity: 0.4 },
        ]}
        onPress={handleCreate}
        disabled={submitting || loading || !serviceId}
        activeOpacity={0.85}
      >
        <Text style={styles.submitText}>
          {submitting ? "Đang xử lý..." : "Đặt lịch"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  contentContainer: { padding: spacing(4), paddingBottom: spacing(6) },
  screenTitle: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: spacing(3) },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    marginBottom: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing(3),
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  cardSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: spacing(1) },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radius.md,
  },
  badgeText: { fontSize: 11, fontWeight: "600", color: colors.primaryAlt },
  fieldBlock: { marginBottom: spacing(3) },
  label: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: spacing(1) },
  inputLike: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3),
    justifyContent: "center",
  },
  inputText: { fontSize: 15, color: colors.text },
  textArea: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    minHeight: 90,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing(3.5),
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#000", fontSize: 16, fontWeight: "700" },
});
