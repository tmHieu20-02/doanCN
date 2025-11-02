import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// ==============================
// 1️⃣ EmptyState tái sử dụng
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

type Booking = {
  id: number;
  serviceName: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  status: string;
  statusText: string;
  statusColor: string;
  address?: string;
  phone?: string;
  canCancel?: boolean;
  canRate?: boolean;
  rating?: number;
};

// ==============================
// 3️⃣ Dummy Data
// ==============================
const initialUpcomingBookings: Booking[] = [
  {
    id: 1,
    serviceName: 'Hair Studio Premium',
    serviceType: 'Cắt tóc + Gội đầu',
    date: '2024-03-15',
    time: '14:30',
    duration: '45 phút',
    price: '150.000đ',
    status: 'confirmed',
    statusText: 'Đã xác nhận',
    statusColor: '#10B981',
    address: '123 Trần Hưng Đạo, Q1, TP.HCM',
    phone: '0123456789',
    canCancel: true,
  },
  {
    id: 2,
    serviceName: 'Royal Spa & Wellness',
    serviceType: 'Massage toàn thân',
    date: '2024-03-16',
    time: '10:00',
    duration: '90 phút',
    price: '300.000đ',
    status: 'pending',
    statusText: 'Chờ xác nhận',
    statusColor: '#F59E0B',
    address: '456 Nguyễn Thái Học, Q1, TP.HCM',
    phone: '0987654321',
    canCancel: true,
  },
];

const initialCompletedBookings: Booking[] = [];
const initialCancelledBookings: Booking[] = [];

// ==============================
// 4️⃣ Component
// ==============================
export default function BookingsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [upcoming, setUpcoming] = useState<Booking[]>(initialUpcomingBookings);
  const [completed, setCompleted] = useState<Booking[]>(initialCompletedBookings);
  const [cancelled, setCancelled] = useState<Booking[]>(initialCancelledBookings);

  const handleBookNow = () => router.push('/');

  const handleCancelBooking = (bookingId: number) => {
    Alert.alert('Xác nhận hủy lịch', 'Bạn có chắc chắn muốn hủy lịch hẹn này không?', [
      { text: 'Thoát', style: 'cancel' },
      {
        text: 'Đồng ý',
        style: 'destructive',
        onPress: () => {
          const bookingToCancel = upcoming.find((b) => b.id === bookingId);
          if (!bookingToCancel) return;

          setUpcoming((prev) => prev.filter((b) => b.id !== bookingId));

          const newCancelledBooking = {
            ...bookingToCancel,
            status: 'cancelled',
            statusText: 'Đã hủy',
            statusColor: '#EF4444',
            canCancel: false,
          };
          setCancelled((prev) => [newCancelledBooking, ...prev]);
        },
      },
    ]);
  };

  const bookingTabs: BookingTab[] = [
    { id: 'upcoming', name: 'Sắp tới', count: upcoming.length },
    { id: 'completed', name: 'Hoàn thành', count: completed.length },
    { id: 'cancelled', name: 'Đã hủy', count: cancelled.length },
  ];

  const getCurrentBookings = (): Booking[] => {
    switch (activeTab) {
      case 'upcoming': return upcoming;
      case 'completed': return completed;
      case 'cancelled': return cancelled;
      default: return [];
    }
  };

  // ==============================
  // 5️⃣ Render Tabs + Items
  // ==============================
  const renderTabButton = ({ item }: { item: BookingTab }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === item.id && styles.tabButtonActive]}
      onPress={() => setActiveTab(item.id)}>
      <Text style={[styles.tabButtonText, activeTab === item.id && styles.tabButtonTextActive]}>
        {item.name}
      </Text>
      {item.count > 0 && (
        <View style={[styles.tabBadge, activeTab === item.id && styles.tabBadgeActive]}>
          <Text style={[styles.tabBadgeText, activeTab === item.id && styles.tabBadgeTextActive]}>
            {item.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.serviceName}>{item.serviceName}</Text>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: item.statusColor }]}>{item.statusText}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {new Date(item.date).toLocaleDateString('vi-VN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.time} • {item.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.price}>{item.price}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <Phone size={16} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton}>
            <MessageCircle size={16} color="#4F46E5" />
          </TouchableOpacity>
          {item.canCancel && (
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelBooking(item.id)}>
              <Text style={styles.cancelButtonText}>Hủy lịch</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  // ==============================
  // 6️⃣ Render
  // ==============================
  const currentBookings = getCurrentBookings();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <Text style={styles.headerTitle}>Lịch hẹn của tôi</Text>
        <Text style={styles.headerSubtitle}>Quản lý và theo dõi lịch hẹn</Text>
      </LinearGradient>

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

      {currentBookings.length > 0 ? (
        <FlatList
          data={currentBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bookingsList}
        />
      ) : (
        <EmptyState
          icon={<Calendar size={64} color="#D1D5DB" />}
          title={
            activeTab === 'upcoming'
              ? 'Không có lịch hẹn sắp tới'
              : activeTab === 'completed'
              ? 'Chưa có lịch hẹn hoàn thành'
              : 'Không có lịch hẹn bị hủy'
          }
          subtitle={
            activeTab === 'upcoming'
              ? 'Đặt lịch hẹn đầu tiên của bạn ngay thôi!'
              : activeTab === 'completed'
              ? 'Hoàn thành một dịch vụ để xem lịch sử'
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
// 7️⃣ Styles
// ==============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: '#E0E7FF' },

  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsList: { paddingHorizontal: 20 },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    marginRight: 12,
  },
  tabButtonActive: { backgroundColor: '#4F46E5' },
  tabButtonText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabButtonTextActive: { color: '#FFFFFF' },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 24,
    alignItems: 'center',
  },
  tabBadgeActive: { backgroundColor: '#FFFFFF' },
  tabBadgeText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  tabBadgeTextActive: { color: '#4F46E5' },

  bookingsList: { padding: 20 },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bookingInfo: { flex: 1 },
  serviceName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  serviceType: { fontSize: 14, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  bookingDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { fontSize: 14, color: '#374151', marginLeft: 8, flex: 1 },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: '700', color: '#4F46E5' },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  contactButton: {
    padding: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    marginRight: 8,
  },
  messageButton: {
    padding: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    marginRight: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },

  // ✅ EmptyState
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
