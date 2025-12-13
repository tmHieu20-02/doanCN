import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../ui/theme"; 

// === THEME: WARM & PREMIUM (SPA/SALON STYLE) ===
const THEME = {
  primary: "#F59E0B",      // Vàng cam ấm (Premium service vibe)
  primarySoft: "#FFF7ED",  // Nền cam siêu nhạt
  textMain: "#1C1917",     // Đen nâu (Sang hơn đen tuyền)
  textSub: "#78716C",      // Xám nâu
  bg: "#FAFAF9",           // Nền màu kem/xám ấm
  card: "#FFFFFF",
  border: "#E7E5E4",
  inputBg: "#F5F5F4",      // Nền input xám nhẹ
  success: "#10B981",
};

function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const { width } = Dimensions.get("window");

export default function CreateBooking() {
  const router = useRouter();
  const { serviceId: paramServiceId } = useLocalSearchParams();

  const [serviceId, setServiceId] = useState<string>("");
  const [services, setServices] = useState<any[]>([]);
  const [bookingType, setBookingType] = useState<"at_store" | "at_home" | "">("");
  const [addressText, setAddressText] = useState("");
  
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

  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Logic lấy dữ liệu
  const selectedService = useMemo(() => {
    return services.find((s) => String(s.id) === serviceId);
  }, [services, serviceId]);
  
  const storeAddress = useMemo(() => {
    if (!selectedService) return "";
    if (selectedService.creator?.staffProfile?.store_address) {
      return selectedService.creator.staffProfile.store_address;
    }
    if (selectedService.Staff?.staffProfile?.store_address) {
      return selectedService.Staff.staffProfile.store_address;
    }
    return ""; 
  }, [selectedService]);

  const loadUserPhone = async () => {
    const stored = await SecureStore.getItemAsync("my-user-session");
    if (!stored) return;
    const user = JSON.parse(stored);
    setPhone(user?.phone_number || "");
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;

      const res = await axios.get("https://phatdat.store/api/v1/service/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data || [];
      setServices(data);

      if (paramServiceId) {
        const selected = data.find((s: any) => String(s.id) === String(paramServiceId));
        setServiceId(String(paramServiceId));
        if (selected?.service_type === "at_store") setBookingType("at_store");
        else if (selected?.service_type === "at_home") setBookingType("at_home");
        else setBookingType("");
      }
    } catch {
      Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserPhone();
    fetchServices();
  }, []);

  const generateTimeSlots = () => {
    const list: string[] = [];
    for (let h = 8; h <= 20; h++) {
      list.push(`${String(h).padStart(2, "0")}:00`);
    }
    return list;
  };

  const loadBookedSlots = async (selectedDate: Date) => {
    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = JSON.parse(stored!).token;
      const res = await axios.get("https://phatdat.store/api/v1/booking/get-all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data?.bookings || [];
      const selectedDateStr = formatYMD(selectedDate);
      const filtered = all.filter((b: any) => {
        const bookingDate = (b.booking_date || "").slice(0, 10);
        return bookingDate === selectedDateStr;
      });
      const booked: string[] = [];
      filtered.forEach((b: any) => {
        if (!b.start_time) return;
        const [rawHour] = String(b.start_time).split(":");
        const hour = String(rawHour).padStart(2, "0");
        const slotKey = `${hour}:00`;
        if (!booked.includes(slotKey)) booked.push(slotKey);
      });
      setBookedSlots(booked);
    } catch (err) {
      console.log("LOAD SLOTS ERROR:", err);
    }
  };

  useEffect(() => {
    if (serviceId) {
      setTimeSlots(generateTimeSlots());
      loadBookedSlots(date);
    }
  }, [serviceId, date]);

  const isSlotUnavailable = (slot: string) => {
    if (bookedSlots.includes(slot)) return true;
    const now = new Date();
    const [h, m] = slot.split(":").map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(h, m, 0, 0);
    if (slotTime < now) return true;
    return false;
  };

  const handleCreate = async () => {
    if (!serviceId) return Alert.alert("Thiếu dữ liệu", "Vui lòng chọn dịch vụ.");
    if (!bookingType) return Alert.alert("Lỗi", "Vui lòng chọn loại hình phục vụ.");
    if (bookingType === "at_home" && !addressText.trim())
      return Alert.alert("Lỗi", "Vui lòng nhập địa chỉ.");
    if (bookingType === "at_store" && !storeAddress)
      return Alert.alert("Lỗi", "Địa chỉ Salon đang cập nhật, vui lòng thử lại sau.");
    if (endTime <= startTime)
      return Alert.alert("Lỗi", "Giờ kết thúc phải lớn hơn giờ bắt đầu.");

    try {
      setSubmitting(true);
      const stored = await SecureStore.getItemAsync("my-user-session");
      const user = JSON.parse(stored!);
      const body = {
        service_id: Number(serviceId),
        booking_date: formatYMD(date),
        start_time: startTime.toTimeString().slice(0, 5),
        end_time: endTime.toTimeString().slice(0, 5),
        booking_type: bookingType,
        address_text: bookingType === "at_home" ? addressText : storeAddress,
        number_phone: phone,
        note,
      };
      const res = await axios.post(
        "https://phatdat.store/api/v1/booking/create",
        body,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (res.data?.err === 0) {
        Alert.alert("Thành công", "Đặt lịch thành công!");
        router.replace("/(tabs)/bookings?reload=1");
      } else {
        Alert.alert("Lỗi", res.data?.mes || "Không thể đặt lịch.");
      }
    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.mes || "Không thể đặt lịch.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top', 'left', 'right']}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={THEME.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác Nhận Đặt Lịch</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* === CARD DỊCH VỤ === */}
        {selectedService && (
          <View style={styles.serviceCard}>
            <View style={styles.serviceIconCircle}>
               <MaterialCommunityIcons name="content-cut" size={24} color={THEME.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceLabel}>Dịch vụ</Text>
              <Text style={styles.serviceName}>{selectedService.name}</Text>
              <Text style={styles.serviceStaff}>
                Thợ: <Text style={{fontWeight: '600', color: THEME.textMain}}>{selectedService.creator?.full_name || "..."}</Text>
              </Text>
            </View>
            <Text style={styles.servicePrice}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedService.price || 0)}
            </Text>
          </View>
        )}

        {/* === SECTION 1: HÌNH THỨC === */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hình thức phục vụ</Text>
          
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, bookingType === "at_store" && styles.toggleBtnActive]}
              onPress={() => setBookingType("at_store")}
            >
              <Ionicons 
                name="storefront" 
                size={18} 
                color={bookingType === "at_store" ? THEME.primary : THEME.textSub} 
              />
              <Text style={[styles.toggleText, bookingType === "at_store" && styles.toggleTextActive]}>
                Tại Salon
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, bookingType === "at_home" && styles.toggleBtnActive]}
              onPress={() => setBookingType("at_home")}
            >
              <Ionicons 
                name="home" 
                size={18} 
                color={bookingType === "at_home" ? THEME.primary : THEME.textSub} 
              />
              <Text style={[styles.toggleText, bookingType === "at_home" && styles.toggleTextActive]}>
                Tại Nhà
              </Text>
            </TouchableOpacity>
          </View>

          {/* ĐỊA CHỈ */}
          <View style={styles.addressWrapper}>
            {bookingType === "at_store" ? (
              <View style={styles.readOnlyAddress}>
                <Ionicons name="location-sharp" size={20} color={THEME.primary} style={{marginTop: 2}}/>
                <Text style={styles.readOnlyText}>
                  {storeAddress || "Đang tải địa chỉ salon..."}
                </Text>
              </View>
            ) : (
              <TextInput
                style={styles.textInput}
                value={addressText}
                onChangeText={setAddressText}
                placeholder="Nhập địa chỉ nhà của bạn..."
                placeholderTextColor={THEME.textSub}
                multiline
              />
            )}
          </View>
        </View>

        {/* === SECTION 2: THỜI GIAN === */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ngày & Giờ</Text>
          
          {/* DATE PICKER */}
          <TouchableOpacity style={styles.datePickerRow} onPress={() => setShowDatePicker(true)}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={styles.calendarIcon}>
                <Ionicons name="calendar-outline" size={20} color={THEME.primary} />
              </View>
              <Text style={styles.dateValue}>
                {date.toLocaleDateString("vi-VN", { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={THEME.textSub} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker value={date} mode="date" minimumDate={new Date()} onChange={(e, s) => { setShowDatePicker(false); if(s) setDate(s) }} />
          )}

          {/* TIME SLOTS */}
          <View style={{marginTop: 16}}>
            <Text style={styles.subLabel}>Khung giờ</Text>
            <View style={styles.slotContainer}>
              {timeSlots.map((slot, index) => {
                const unavailable = isSlotUnavailable(slot);
                const isSelected = selectedSlot === slot;
                return (
                  <TouchableOpacity
                    key={index}
                    disabled={unavailable}
                    onPress={() => {
                      setSelectedSlot(slot);
                      const [h, m] = slot.split(":").map(Number);
                      const start = new Date(date);
                      start.setHours(h, m, 0);
                      setStartTime(start);
                      const end = new Date(start.getTime() + 60 * 60000);
                      setEndTime(end);
                    }}
                    style={[
                      styles.slotItem,
                      unavailable && styles.slotDisabled,
                      isSelected && styles.slotActive
                    ]}
                  >
                    <Text style={[
                      styles.slotText,
                      unavailable && styles.slotTextDisabled,
                      isSelected && styles.slotTextActive
                    ]}>{slot}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* MANUAL TIME */}
          <View style={styles.timeRangeRow}>
            <View style={styles.timeBoxWrapper}>
              <Text style={styles.subLabel}>Bắt đầu</Text>
              <TouchableOpacity style={styles.timeBox} onPress={() => setShowStartPicker(true)}>
                <Text style={styles.timeBoxText}>{startTime.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeArrow}>
              <Ionicons name="arrow-forward" size={18} color={THEME.border} />
            </View>
            <View style={styles.timeBoxWrapper}>
              <Text style={styles.subLabel}>Kết thúc</Text>
              <TouchableOpacity style={styles.timeBox} onPress={() => setShowEndPicker(true)}>
                <Text style={styles.timeBoxText}>{endTime.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartPicker && <DateTimePicker value={startTime} mode="time" is24Hour onChange={(e, s) => { setShowStartPicker(false); if(s) setStartTime(s) }} />}
          {showEndPicker && <DateTimePicker value={endTime} mode="time" is24Hour onChange={(e, s) => { setShowEndPicker(false); if(s) setEndTime(s) }} />}
        </View>

        {/* === SECTION 3: GHI CHÚ === */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ghi chú thêm</Text>
          <TextInput
            style={styles.noteArea}
            value={note}
            onChangeText={setNote}
            placeholder="Bạn có yêu cầu gì đặc biệt không?"
            placeholderTextColor={THEME.textSub}
            multiline
          />
        </View>

      </ScrollView>

      {/* === FOOTER === */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (submitting || !serviceId) && { opacity: 0.5, backgroundColor: "#D1D5DB" }]}
          onPress={handleCreate}
          disabled={submitting || !serviceId}
        >
          <Text style={styles.submitText}>{submitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT LỊCH"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.bg,
    position: 'relative',
  },
  backButton: {
    position: 'absolute', left: 20,
    padding: 8, borderRadius: 10,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 17, fontWeight: "700", color: THEME.textMain,
  },
  contentContainer: {
    padding: 20, paddingBottom: 100,
  },

  // Service Card
  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: "#fff", borderRadius: 16,
    padding: 16, marginBottom: 20,
    elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, shadowOffset: {width:0, height:2}
  },
  serviceIconCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: THEME.primarySoft,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  serviceLabel: { fontSize: 11, color: THEME.textSub, textTransform: 'uppercase', marginBottom: 2, fontWeight: '600' },
  serviceName: { fontSize: 16, fontWeight: '700', color: THEME.textMain, marginBottom: 2 },
  serviceStaff: { fontSize: 13, color: THEME.textSub },
  servicePrice: { fontSize: 16, fontWeight: '700', color: THEME.primary },

  // Section Generic
  sectionContainer: {
    backgroundColor: "#fff", borderRadius: 16,
    padding: 16, marginBottom: 20,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: THEME.textMain, marginBottom: 16 },

  // Toggle Type
  toggleContainer: {
    flexDirection: 'row', backgroundColor: THEME.bg,
    borderRadius: 12, padding: 4, marginBottom: 16,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 10, gap: 6,
  },
  toggleBtnActive: { backgroundColor: "#fff", elevation: 1, shadowColor: "#000", shadowOpacity: 0.05 },
  toggleText: { fontSize: 13, fontWeight: "600", color: THEME.textSub },
  toggleTextActive: { color: THEME.primary },

  // Address
  addressWrapper: { minHeight: 50 },
  readOnlyAddress: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: THEME.primarySoft,
    padding: 12, borderRadius: 12, gap: 10,
  },
  readOnlyText: { fontSize: 14, color: THEME.textMain, flex: 1, lineHeight: 20 },
  textInput: {
    backgroundColor: THEME.inputBg,
    borderRadius: 12, padding: 12,
    fontSize: 14, color: THEME.textMain,
    minHeight: 50, textAlignVertical: 'center',
  },

  // Date Picker
  datePickerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: THEME.inputBg, padding: 12, borderRadius: 12,
  },
  calendarIcon: { marginRight: 10 },
  dateValue: { fontSize: 15, fontWeight: "600", color: THEME.textMain, textTransform: 'capitalize' },

  // Slots
  subLabel: { fontSize: 13, color: THEME.textSub, marginBottom: 8, fontWeight: '500' },
  slotContainer: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
  },
  slotItem: {
    width: "18%", aspectRatio: 1.6,
    alignItems: "center", justifyContent: "center",
    borderRadius: 8, backgroundColor: THEME.inputBg,
    borderWidth: 1, borderColor: "transparent",
  },
  slotActive: {
    backgroundColor: THEME.primarySoft, borderColor: THEME.primary,
  },
  slotDisabled: { opacity: 0.3 },
  slotText: { fontSize: 13, fontWeight: "600", color: THEME.textMain },
  slotTextActive: { color: THEME.primary },
  slotTextDisabled: { color: THEME.textSub },

  // Manual Time
  timeRangeRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 16 },
  timeBoxWrapper: { flex: 1 },
  timeArrow: { width: 40, alignItems: 'center', paddingBottom: 12 },
  timeBox: {
    backgroundColor: THEME.inputBg, paddingVertical: 12,
    alignItems: 'center', borderRadius: 12,
  },
  timeBoxText: { fontSize: 16, fontWeight: "700", color: THEME.textMain },

  // Note
  noteArea: {
    backgroundColor: THEME.inputBg, borderRadius: 12,
    padding: 12, fontSize: 14, color: THEME.textMain,
    height: 100, textAlignVertical: 'top',
  },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff", padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1, borderTopColor: THEME.border,
  },
  submitButton: {
    backgroundColor: THEME.primary, // Màu vàng cam
    paddingVertical: 16, borderRadius: 14,
    alignItems: "center",
    shadowColor: THEME.primary, shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 5,
  },
  submitText: { fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
});