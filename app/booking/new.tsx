import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
// BỔ SUNG: Import useLocalSearchParams để lấy serviceId
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  CreditCard,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Day = {
  date: Date;
  dayName: string;
  dayNumber: number;
  month: number;
  isToday: boolean;
};

const timeSlots = {
  morning: ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30'],
  afternoon: ['13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'],
  evening: ['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30']
};

// SỬA ĐỔI: Tạo một danh sách tổng chứa TẤT CẢ dịch vụ con
const allServicesFlat = [
  // Salon ID 1: Hair Studio
  { id: 1, name: 'Cắt tóc nam', price: 150000, duration: '30 phút' },
  { id: 2, name: 'Cắt tóc nữ', price: 200000, duration: '45 phút' },
  { id: 3, name: 'Nhuộm tóc', price: 500000, duration: '120 phút' },
  { id: 4, name: 'Uốn tóc', price: 800000, duration: '150 phút' },
  // Salon ID 2: Zen Spa
  { id: 5, name: 'Massage toàn thân', price: 300000, duration: '90 phút' },
  { id: 6, name: 'Chăm sóc da mặt', price: 250000, duration: '60 phút' },
  { id: 7, name: 'Liệu pháp đá nóng', price: 350000, duration: '100 phút' },
  // Salon ID 3: Elite Fitness
  { id: 8, name: 'Tập gym tự do', price: 100000, duration: '120 phút' },
  { id: 9, name: 'Huấn luyện cá nhân', price: 300000, duration: '90 phút' },
  { id: 10, name: 'Yoga buổi sáng', price: 120000, duration: '60 phút' },
  // Salon ID 4: Nail Art Studio
  { id: 11, name: 'Sơn gel cơ bản', price: 200000, duration: '60 phút' },
  { id: 12, name: 'Vẽ móng nghệ thuật', price: 250000, duration: '75 phút' },
  { id: 13, name: 'Chăm sóc móng chuyên sâu', price: 300000, duration: '90 phút' },
];

// SỬA ĐỔI: Tạo một map liên kết ID Salon với danh sách ID dịch vụ con
const allSalonServices: Record<string, number[]> = {
  '1': [1, 2, 3, 4],     // Dịch vụ của Hair Studio
  '2': [5, 6, 7],         // Dịch vụ của Zen Spa
  '3': [8, 9, 10],       // Dịch vụ của Elite Fitness
  '4': [11, 12, 13],    // Dịch vụ của Nail Art
};

// XÓA: 'const services = [...]' đã bị xóa khỏi đây


const getNext7Days = (): Day[] => {
  const days: Day[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      date,
      dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      dayNumber: date.getDate(),
      month: date.getMonth() + 1,
      isToday: i === 0,
    });
  }
  return days;
};

export default function NewBookingScreen() {
  // BỔ SUNG: Lấy serviceId (ID của Salon) từ URL
  const { serviceId } = useLocalSearchParams();
  
  // SỬA ĐỔI: Lấy đúng danh sách dịch vụ con để hiển thị
  // Dùng 'serviceId' để tìm, nếu không có thì mặc định là salon '1'
  const serviceIdsForSalon = allSalonServices[serviceId as string] || allSalonServices['1'];
  const servicesToRender = allServicesFlat.filter(s => serviceIdsForSalon.includes(s.id));

  const [selectedDate, setSelectedDate] = useState<Day>(getNext7Days()[0]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // SỬA ĐỔI: Bắt đầu với mảng rỗng, không hard-code [1]
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [customerNote, setCustomerNote] = useState<string>('');

  const days = getNext7Days();

  const toggleService = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, serviceId) => {
      // SỬA ĐỔI: Tìm kiếm trong danh sách tổng 'allServicesFlat'
      const service = allServicesFlat.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const getTotalDuration = () => {
    const totalMinutes = selectedServices.reduce((total, serviceId) => {
      // SỬA ĐỔI: Tìm kiếm trong danh sách tổng 'allServicesFlat'
      const service = allServicesFlat.find(s => s.id === serviceId);
      const minutes = parseInt(service?.duration.split(' ')[0] || '0');
      return total + minutes;
    }, 0);
    if (totalMinutes === 0) return '0p'; // Thêm check nếu chưa chọn
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}p` : `${hours}h`;
    }
    return `${totalMinutes}p`;
  };

  const handleBooking = () => {
    if (!selectedTime || selectedServices.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn thời gian và dịch vụ');
      return;
    }
    Alert.alert(
      'Xác nhận đặt lịch',
      `Bạn có muốn đặt lịch vào ${selectedTime} ngày ${selectedDate.dayNumber}/${selectedDate.month}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: () => {
            Alert.alert('Thành công', 'Đặt lịch thành công!', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const renderDateCard = (day: Day) => (
    <TouchableOpacity
      key={day.date.toISOString()}
      style={[
        styles.dateCard,
        selectedDate.date.toDateString() === day.date.toDateString() &&
          styles.dateCardSelected,
      ]}
      onPress={() => setSelectedDate(day)}
    >
      <Text
        style={[
          styles.dayName,
          selectedDate.date.toDateString() === day.date.toDateString() &&
            styles.dayNameSelected,
        ]}
      >
        {day.dayName}
      </Text>
      <Text
        style={[
          styles.dayNumber,
          selectedDate.date.toDateString() === day.date.toDateString() &&
            styles.dayNumberSelected,
        ]}
      >
        {day.dayNumber}
      </Text>
      {day.isToday && <View style={styles.todayDot} />}
    </TouchableOpacity>
  );

  const renderTimeSlot = (time: string) => {
    const isSelected = selectedTime === time;
    const isBooked = Math.random() > 0.7; // demo
    return (
      <TouchableOpacity
        key={time}
        style={[
          styles.timeSlot,
          isSelected && styles.timeSlotSelected,
          isBooked && !isSelected && styles.timeSlotBooked,
        ]}
        onPress={() => !isBooked && setSelectedTime(time)}
        disabled={isBooked}
      >
        <Text
          style={[
            styles.timeSlotText,
            isSelected && styles.timeSlotTextSelected,
            isBooked && !isSelected && styles.timeSlotTextBooked,
          ]}
        >
          {time}
        </Text>
      </TouchableOpacity>
    );
  };

  // SỬA ĐỔI: Chuyển type để khớp với 'allServicesFlat'
  const renderServiceItem = (service: typeof allServicesFlat[0]) => {
    const isSelected = selectedServices.includes(service.id);
    return (
      <TouchableOpacity
        key={service.id}
        style={[styles.serviceItem, isSelected && styles.serviceItemSelected]}
        onPress={() => toggleService(service.id)}
      >
        <View style={styles.serviceCheckbox}>
          {isSelected ? (
            <CheckCircle size={20} color="#4F46E5" />
          ) : (
            <View style={styles.serviceCheckboxEmpty} />
          )}
        </View>
        <View style={styles.serviceInfo}>
          <Text
            style={[
              styles.serviceName,
              isSelected && styles.serviceNameSelected,
            ]}
          >
            {service.name}
          </Text>
          <Text style={styles.serviceDuration}>{service.duration}</Text>
        </View>
        <Text
          style={[
            styles.servicePrice,
            isSelected && styles.servicePriceSelected,
          ]}
        >
          {service.price.toLocaleString('vi-VN')}đ
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch hẹn</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <User size={20} color="#4F46E5" />
            </View>
            <Text style={styles.sectionTitle}>Chọn dịch vụ</Text>
          </View>
          <View style={styles.servicesContainer}>
            {/* SỬA ĐỔI: map qua 'servicesToRender' thay vì 'services' */}
            {servicesToRender.map(renderServiceItem)}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Calendar size={20} color="#4F46E5" />
            </View>
            <Text style={styles.sectionTitle}>Chọn ngày</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesContainer}
          >
            {days.map(renderDateCard)}
          </ScrollView>
        </View>

        {/* Time */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Clock size={20} color="#4F46E5" />
            </View>
            <Text style={styles.sectionTitle}>Chọn giờ</Text>
          </View>
          <View style={styles.timeSection}>
            <Text style={styles.timeGroupTitle}>Buổi sáng</Text>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.morning.map(renderTimeSlot)}
            </View>
          </View>
          <View style={styles.timeSection}>
            <Text style={styles.timeGroupTitle}>Buổi chiều</Text>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.afternoon.map(renderTimeSlot)}
            </View>
          </View>
          <View style={styles.timeSection}>
            <Text style={styles.timeGroupTitle}>Buổi tối</Text>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.evening.map(renderTimeSlot)}
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MessageSquare size={20} color="#4F46E5" />
            </View>
            <Text style={styles.sectionTitle}>Ghi chú (tuỳ chọn)</Text>
          </View>
          <TextInput
            style={styles.noteInput}
            placeholder="Thêm ghi chú cho salon..."
            value={customerNote}
            onChangeText={setCustomerNote}
            multiline
          />
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Tóm tắt đặt lịch</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Dịch vụ:</Text>
            <Text style={styles.summaryValue}>
              {/* SỬA ĐỔI: Tìm tên trong 'allServicesFlat' */}
              {selectedServices.length > 0
                ? selectedServices
                    .map(id => allServicesFlat.find(s => s.id === id)?.name)
                    .join(', ')
                : 'Chưa chọn'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Ngày giờ:</Text>
            <Text style={styles.summaryValue}>
              {selectedTime
                ? `${selectedTime}, ${selectedDate.dayNumber}/${selectedDate.month}`
                : 'Chưa chọn'}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Thời gian:</Text>
            <Text style={styles.summaryValue}>{getTotalDuration()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryTotal}>Tổng cộng:</Text>
            <Text style={styles.summaryTotalValue}>
              {getTotalPrice().toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.bottomActionContent}>
          <View style={styles.totalInfo}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalAmount}>
              {getTotalPrice().toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            style={styles.confirmButton}
          >
            <TouchableOpacity
              style={styles.confirmButtonContent}
              onPress={handleBooking}
            >
              <CreditCard size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Xác nhận đặt lịch</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  headerRight: { width: 40 },
  section: { backgroundColor: '#fff', marginTop: 8, padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  servicesContainer: { gap: 12 },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceItemSelected: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  serviceCheckbox: { marginRight: 12 },
  serviceCheckboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  serviceInfo: { flex: 1 },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  serviceNameSelected: { color: '#111827' },
  serviceDuration: { fontSize: 14, color: '#6B7280' },
  servicePrice: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  servicePriceSelected: { color: '#4F46E5' },
  datesContainer: { paddingVertical: 8 },
  dateCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
    position: 'relative',
  },
  dateCardSelected: { backgroundColor: '#EEF2FF', borderColor: '#4F46E5' },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  dayNameSelected: { color: '#4F46E5' },
  dayNumber: { fontSize: 18, fontWeight: '700', color: '#374151' },
  dayNumberSelected: { color: '#4F46E5' },
  todayDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  timeSection: { marginBottom: 20 },
  timeGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  timeSlotsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeSlotSelected: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  timeSlotBooked: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  timeSlotText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  timeSlotTextSelected: { color: '#fff' },
  timeSlotTextBooked: { color: '#9CA3AF' },
  noteInput: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 60,
    fontSize: 16,
    color: '#111827',
  },
  summarySection: { backgroundColor: '#fff', marginTop: 8, padding: 20 },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 16, color: '#6B7280', flex: 1 },
  summaryValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  summaryDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 },
  summaryTotal: { fontSize: 18, fontWeight: '700', color: '#111827' },
  summaryTotalValue: { fontSize: 20, fontWeight: '700', color: '#4F46E5' },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  totalInfo: { flex: 1, marginRight: 16 },
  totalLabel: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  totalAmount: { fontSize: 20, fontWeight: '700', color: '#111827' },
  confirmButton: { borderRadius: 12, flex: 1 },
  confirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  confirmButtonText: { fontSize: 16, fontWeight: '700', color: '#fff', marginLeft: 8 },
});