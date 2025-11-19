import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';

// Import API và Theme
import api from '../../utils/api';
import { colors, radius, shadow } from '@/ui/theme';

// ==============================
// 1️⃣ EmptyState Component
// ==============================
const EmptyState = ({
  icon,
  title,
  subtitle,
  buttonText,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  buttonText?: string;
  onPress?: () => void;
}) => (
  <View style={styles.emptyWrapper}>
    {icon}
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
    {buttonText && onPress && (
      <TouchableOpacity style={styles.emptyButton} onPress={onPress}>
        <Text style={styles.emptyButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ==============================
// 2️⃣ Types
// ==============================
type BookingTab = {
  id: 'upcoming' | 'completed' | 'cancelled';
  name: string;
  count: number;
};

// Định nghĩa kiểu dữ liệu trả về từ API (Điều chỉnh nếu backend trả khác)
type Booking = {
  id: number;
  serviceName: string;
  serviceType: string;
  date: string;     // Format: "2024-03-15"
  time: string;     // Format: "14:30"
  duration: string;
  price: string | number;
  status: string;   // pending, confirmed, completed, cancelled...
  address: string;
  canCancel?: boolean; // Frontend tự tính toán
};

// ==============================
// 3️⃣ Component Chính
// ==============================
export default function BookingsScreen() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State lưu trữ dữ liệu
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [completed, setCompleted] = useState<Booking[]>([]);
  const [cancelled, setCancelled] = useState<Booking[]>([]);

  // Hàm gọi API lấy danh sách
  const fetchBookings = async () => {
    try {
      const res = await api.get('/booking/get-all');
      const data = res.data; // Hoặc res.data.data tùy backend

      console.log(">>> BOOKING DATA:", data);

      const list = Array.isArray(data) ? data : (data.data || []);

      // Phân loại dữ liệu vào các xô (bucket)
      const up: Booking[] = [];
      const com: Booking[] = [];
      const can: Booking[] = [];

      list.forEach((item: any) => {
        // Map dữ liệu từ Backend sang Frontend cho chuẩn
        const booking: Booking = {
          id: item.id,
          serviceName: item.serviceName || item.service?.name || "Dịch vụ",
          serviceType: item.categoryName || "Chăm sóc sắc đẹp",
          date: item.bookingDate || item.date, 
          time: item.bookingTime || item.time,
          duration: item.duration || "60 phút",
          price: item.totalPrice || item.price || 0,
          status: item.status?.toLowerCase() || 'pending',
          address: item.address || "Tại cửa hàng",
        };

        // Logic phân loại tab
        if (['cancelled', 'rejected', 'bom'].includes(booking.status)) {
          can.push(booking);
        } else if (['completed', 'done', 'finished'].includes(booking.status)) {
          com.push(booking);
        } else {
          // pending, confirmed, approved...
          booking.canCancel = true; // Chỉ cho hủy đơn sắp tới
          up.push(booking);
        }
      });

      setUpcoming(up);
      setCompleted(com);
      setCancelled(can);

    } catch (error) {
      console.error("Lỗi lấy booking:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tự động tải lại khi vào màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleBookNow = () => router.push('/');

  // Hàm xử lý Hủy Lịch (Gọi API thật)
  const handleCancelBooking = (bookingId: number) => {
    Alert.alert('Xác nhận hủy', 'Bạn có chắc chắn muốn hủy lịch hẹn này?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy lịch',
        style: 'destructive',
        onPress: async () => {
          try {
            // Gọi API Hủy
            await api.patch(`/booking/cancel/${bookingId}`);
            Alert.alert("Thành công", "Đã hủy lịch hẹn.");
            // Tải lại dữ liệu
            onRefresh(); 
          } catch (error) {
            Alert.alert("Lỗi", "Không thể hủy lịch hẹn lúc này.");
          }
        },
      },
    ]);
  };

  // Helper: Lấy màu sắc badge theo trạng thái
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: '#DCFCE7', text: colors.success, label: 'Đã xác nhận' };
      case 'pending': return { bg: '#FEF3C7', text: colors.warning, label: 'Chờ xác nhận' };
      case 'cancelled': return { bg: '#FEE2E2', text: colors.danger, label: 'Đã hủy' };
      case 'completed': return { bg: '#E0E7FF', text: colors.primary, label: 'Hoàn thành' };
      default: return { bg: '#F3F4F6', text: colors.textMuted, label: status };
    }
  };

  // Helper: Format tiền tệ
  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));
  };

  const bookingTabs: BookingTab[] = [
    { id: 'upcoming', name: 'Sắp tới', count: upcoming.length },
    { id: 'completed', name: 'Hoàn thành', count: completed.length },
    { id: 'cancelled', name: 'Đã hủy', count: cancelled.length },
  ];

  const getCurrentBookings = () => {
    if (activeTab === 'upcoming') return upcoming;
    if (activeTab === 'completed') return completed;
    return cancelled;
  };

  // ==============================
  // 4️⃣ Render Items
  // ==============================
  const renderTabButton = ({ item }: { item: BookingTab }) => {
    const isActive = activeTab === item.id;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(item.id)}>
        <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
          {item.name}
        </Text>
        {item.count > 0 && (
          <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
            <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
              {item.count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={styles.bookingCard}>
        {/* Header Card */}
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <Text style={styles.serviceType}>{item.serviceType}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={colors.textMuted} />
            <Text style={styles.detailText}>
               {/* Format ngày đơn giản nếu date string hợp lệ, ko thì hiện raw */}
               {item.date}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.time} • {item.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.textMuted} />
            <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.bookingFooter}>
          <Text style={styles.price}>{formatPrice(item.price)}</Text>
          
          <View style={styles.actionButtons}>
            {/* Nút Gọi (Giả lập) */}
            <TouchableOpacity style={styles.iconButton}>
              <Phone size={18} color={colors.primaryDark} />
            </TouchableOpacity>
            
            {/* Nút Chat (Giả lập) */}
            <TouchableOpacity style={styles.iconButton}>
              <MessageCircle size={18} color={colors.primaryDark} />
            </TouchableOpacity>

            {/* Nút Hủy - Chỉ hiện ở Tab Sắp tới */}
            {activeTab === 'upcoming' && item.canCancel && (
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => handleCancelBooking(item.id)}
              >
                <Text style={styles.cancelButtonText}>Hủy lịch</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const currentBookings = getCurrentBookings();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header Gradient Vàng */}
      <LinearGradient colors={[colors.primary, colors.primaryAlt]} style={styles.header}>
        <Text style={styles.headerTitle}>Lịch hẹn của tôi</Text>
        <Text style={styles.headerSubtitle}>Quản lý và theo dõi lịch hẹn</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={bookingTabs}
          renderItem={renderTabButton}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : currentBookings.length > 0 ? (
        <FlatList
          data={currentBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bookingsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      ) : (
        <EmptyState
          icon={<Calendar size={64} color="#D1D5DB" />}
          title={
            activeTab === 'upcoming' ? 'Không có lịch hẹn sắp tới'
            : activeTab === 'completed' ? 'Chưa có lịch hẹn hoàn thành'
            : 'Không có lịch hẹn bị hủy'
          }
          subtitle={
            activeTab === 'upcoming' ? 'Đặt lịch hẹn đầu tiên của bạn ngay thôi!'
            : activeTab === 'completed' ? 'Hoàn thành một dịch vụ để xem lịch sử'
            : 'Tuyệt vời! Bạn chưa hủy lịch hẹn nào'
          }
          buttonText={activeTab === 'upcoming' ? 'Đặt lịch ngay' : undefined}
          onPress={activeTab === 'upcoming' ? handleBookNow : undefined}
        />
      )}
    </SafeAreaView>
  );
}

// ==============================
// 5️⃣ Styles (Đã sửa: Thêm khoảng cách thoáng hơn)
// ==============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  
  // Header
  header: { 
    paddingTop: 20, 
    paddingBottom: 35, // Tăng padding dưới để tạo khoảng trống cho Tab chen vào
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  // Tabs (Đã sửa phần này)
  tabsContainer: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    marginHorizontal: 20,
    marginTop: -30, // Đẩy lên đè vào header
    
    // 👇 THAY ĐỔI QUAN TRỌNG Ở ĐÂY
    padding: 8,          // Tăng khoảng cách lề trong
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,              // 🔥 Tạo khoảng cách (space between) giữa các nút tab
    
    ...shadow.card,
    marginBottom: 24,    // Đẩy danh sách xuống xa hơn chút
  },
  
  // Không cần cái này nữa vì đã style ở trên
  tabsList: {}, 

  tabButton: {
    flex: 1, // Chia đều chiều ngang
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // 🔥 Nút cao hơn, dễ bấm hơn
    paddingHorizontal: 4,
    borderRadius: radius.lg,
  },
  tabButtonActive: { backgroundColor: colors.primary },
  tabButtonText: { fontSize: 13, fontWeight: '600', color: colors.textMuted }, // Giảm size chữ xíu cho đỡ chật
  tabButtonTextActive: { color: colors.text },
  
  tabBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
  },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.4)' },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  tabBadgeTextActive: { color: '#000' },

  // Booking List
  bookingsList: { paddingHorizontal: 20, paddingBottom: 100 },
  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16, // Khoảng cách giữa các card
    ...shadow.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: { flex: 1, marginRight: 10 },
  serviceName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  serviceType: { fontSize: 13, color: colors.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },

  // Details
  bookingDetails: { marginBottom: 16, gap: 10 }, // Tăng gap giữa các dòng thông tin
  detailRow: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 13, color: colors.text, marginLeft: 10, flex: 1 },

  // Footer
  bookingFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
  },
  price: { fontSize: 17, fontWeight: '800', color: colors.primaryAlt },
  
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: 38, 
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F9FAFB', // Nền xám rất nhạt
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FFF1F2', // Đỏ rất nhạt
    borderRadius: 10,
  },
  cancelButtonText: { fontSize: 13, fontWeight: '600', color: colors.danger },

  // Empty State
  emptyWrapper: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginTop: 24,
    ...shadow.card,
  },
  emptyButtonText: { fontSize: 15, fontWeight: '700', color: colors.text },
});