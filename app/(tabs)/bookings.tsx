// BookingsScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,

} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from "expo-status-bar"; // 


import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

import api from '../../utils/api';
import { colors, radius, shadow } from '@/ui/theme';

export type BookingItem = {
  id: number;
  service_id: number;
  user_id: number;

  number_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;

  status: string;
  note?: string;

  total_price: number;
  booking_type: "at_store" | "at_home";
  address_text?: string;

  service?: {
    id: number;
    name: string;
    price?: number;
    duration_minutes?: number;
    category_name?: string;
  };

  customer?: {
    id: number;
    full_name: string;
    email?: string;
    phone_number?: string;
  };

  has_review?: boolean;
};

export type Booking = {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceType: string;

  date: string;
  time: string;
  duration: string;
  price: number | string;

  status: string;
  address: string;
  bookingType?: string;

  canCancel?: boolean;
  hasReview?: boolean;
};

// ... component EmptyState

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


/* MAIN COMPONENT */

export default function BookingsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [completed, setCompleted] = useState<Booking[]>([]);
  const [cancelled, setCancelled] = useState<Booking[]>([]);

  // ... logic fetchBookings, useFocusEffect, onRefresh, handleBookNow giữ nguyên
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const session = await SecureStore.getItemAsync('my-user-session');
      const user = session ? JSON.parse(session) : null;
      const userId = user?.id;

      if (!userId) {
        setUpcoming([]);
        setCompleted([]);
        setCancelled([]);
        return;
      }

      const res = await api.get('/booking/get-all');
      const list = res.data.bookings || [];

      const userBookings = list.filter((b: BookingItem) => b.user_id === userId);

      const up: Booking[] = [];
      const com: Booking[] = [];
      const can: Booking[] = [];

      userBookings.forEach((item) => {
        const rawStatus = (item.status || '').toLowerCase();

        const booking: Booking = {
          id: item.id,
          serviceId: item.service?.id,
          serviceName: item.service?.name || 'Dịch vụ',
          serviceType: item.service?.category_name || 'Không có danh mục',

          date: item.booking_date ? String(item.booking_date).slice(0, 10) : '',
          time: item.start_time ? String(item.start_time).slice(0, 5) : '',
          duration: `${item.service?.duration_minutes || 60} phút`,
          price: item.total_price || item.service?.price || 0,

          status: rawStatus,
          hasReview: item.has_review || false,

          address:
            item.booking_type === "at_home"
              ? item.address_text || "Tại nhà"
              : "Tại cửa hàng",

          bookingType: item.booking_type,
          canCancel: true,
        };

        if (['canceled', 'cancelled', 'rejected', 'bom'].includes(rawStatus)) {
          can.push(booking);
        } else if (['completed', 'done'].includes(rawStatus)) {
          com.push(booking);
        } else {
          up.push(booking);
        }
      });

      setUpcoming(up);
      setCompleted(com);
      setCancelled(can);
    } catch (error) {
      console.error('FETCH BOOKING ERROR:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
  // ... logic handleCancelBooking giữ nguyên
  const handleCancelBooking = (bookingId: number) => {
    Alert.alert(
      "Xác nhận hủy lịch",
      "Bạn có chắc chắn muốn hủy lịch hẹn này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy lịch",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.post(`/booking/cancel/${bookingId}`, {
                cancel_note: "Người dùng đã hủy lịch",
              });

              if (res.data?.err === 0) {
                Alert.alert("Thành công", "Đã hủy lịch hẹn.");
                setActiveTab("cancelled");
                onRefresh();
              } else {
                Alert.alert("Lỗi", res.data?.mes || "Không thể hủy lịch.");
              }
            } catch (error: any) {
              Alert.alert(
                "Lỗi",
                error?.response?.data?.mes ||
                "Không thể hủy lịch hẹn. Vui lòng thử lại."
              );
            }
          },
        },
      ]
    );
  };
  // ... logic getStatusStyle, formatPrice, bookingTabs, getCurrentBookings giữ nguyên
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return { bg: '#DCFCE7', text: colors.success, label: 'Đã xác nhận' };

      case 'pending':
        return { bg: '#FEF3C7', text: colors.warning, label: 'Chờ xác nhận' };

      case 'canceled':
      case 'cancelled':
      case 'rejected':
      case 'bom':
        return { bg: '#FEE2E2', text: colors.danger, label: 'Đã hủy' };

      case 'completed':
      case 'done':
        return {
          bg: '#D1FAE5',
          text: '#059669',
          label: 'Hoàn thành'
        };

      default:
        return { bg: '#F3F4F6', text: colors.textMuted, label: status };
    }
  };

  const formatPrice = (price: string | number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
      Number(price)
    );

  const bookingTabs = [
    { id: 'upcoming', name: 'Sắp tới', count: upcoming.length },
    { id: 'completed', name: 'Hoàn thành', count: completed.length },
    { id: 'cancelled', name: 'Đã hủy', count: cancelled.length },
  ];

  const getCurrentBookings = () => {
    if (activeTab === 'upcoming') return upcoming;
    if (activeTab === 'completed') return completed;
    return cancelled;
  };

  // ... logic renderTabButton, renderBookingItem giữ nguyên

  const renderTabButton = ({ item }: any) => {
    const isActive = activeTab === item.id;

    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(item.id)}
      >
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

        {/* HEADER */}
        <View style={styles.bookingHeader}>
          <View style={styles.bookingInfo}>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <Text style={styles.serviceType}>{item.serviceType}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {statusStyle.label}
            </Text>
          </View>
        </View>

        {/* DETAILS */}
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={16} color={colors.textMuted} />
            <Text style={styles.detailText}>
              {item.time} • {item.duration}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.address}</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.bookingFooter}>
  {/* Thêm View bọc giá tiền để đẩy các nút sang phải */}
  <View style={{ flex: 1 }}>
    <Text style={styles.price}>{formatPrice(item.price)}</Text>
  </View>

  <View style={styles.actionButtons}>
    <TouchableOpacity style={styles.iconButton}>
      <Phone size={18} color={colors.primaryDark} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.iconButton}>
      <MessageCircle size={18} color={colors.primaryDark} />
    </TouchableOpacity>

    {/* Nút Hủy lịch */}
    {activeTab === 'upcoming' && item.canCancel && (
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleCancelBooking(item.id)}
      >
        <Text style={styles.cancelButtonText}>Hủy lịch</Text>
      </TouchableOpacity>
    )}

    {/* Các nút Đánh giá / Đặt lại giữ nguyên logic của bạn */}
    {activeTab === 'completed' && (
      <>
        {!item.hasReview && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => router.push({
                pathname: "/rating/create",
                params: { serviceId: item.serviceId, bookingId: item.id }
            })}
          >
            <Text style={styles.reviewButtonText}>Đánh giá</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.rebookButton}
          onPress={() => router.push(`/service/${item.serviceId}?rebook=1`)}
        >
          <Text style={styles.rebookButtonText}>Đặt lại</Text>
        </TouchableOpacity>
      </>
    )}

    {activeTab === 'cancelled' && (
      <TouchableOpacity
        style={styles.rebookButton}
        onPress={() => router.push(`/service/${item.serviceId}?rebook=1`)}
      >
        <Text style={styles.rebookButtonText}>Đặt lại</Text>
      </TouchableOpacity>
    )}
  </View>
</View>
      </View>
    );
  };

  const currentBookings = getCurrentBookings();

  /* ------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------ */

  return (
    // FIX: Bọc ngoài cùng bằng SafeAreaView từ react-native-safe-area-context
    // edges={['top']} đảm bảo chỉ thêm padding ở trên
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* StatusBar để quản lý màu nền Status Bar (đã đổi sang dark-content) */}
      <StatusBar style="light" backgroundColor={colors.primary} />

      <LinearGradient
        colors={[colors.primary, colors.primaryAlt]}
        style={styles.header}
      >
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
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 50 }}
        />
      ) : currentBookings.length > 0 ? (
        <FlatList
          data={currentBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bookingsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
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

/* ------------------------------------------------------------ */
/* STYLES */
/* ------------------------------------------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: {
    paddingTop: 20, // Giữ nguyên padding top cho Header vì SafeAreaView đã lo phần trên.
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  // ... các styles còn lại giữ nguyên
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#000',
  },

  tabsContainer: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    marginHorizontal: 20,
    marginTop: -30,
    padding: 8,
    ...shadow.card,
    marginBottom: 24,
  },

  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radius.lg,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: colors.text,
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabBadgeTextActive: {
    color: '#000',
  },

  bookingsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  bookingCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 16,
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
  bookingInfo: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 13,
    color: colors.textMuted,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.95,
  },

  bookingDetails: {
    marginBottom: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: 10,
    flex: 1,
  },

 bookingFooter: {
    flexDirection: 'row', // Xếp hàng ngang
    alignItems: 'center', // Căn giữa theo chiều dọc
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
  },


  price: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primaryAlt,
  },

 actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Khoảng cách giữa các nút bấm
  },


  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },

  rebookButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    marginLeft: 8,
  },
  rebookButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
  },

  reviewButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    marginLeft: 8,
  },
  reviewButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },

  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginTop: 24,
    ...shadow.card,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
});