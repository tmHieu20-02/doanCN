import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { Bell, Calendar, CheckCircle, X, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// ==============================
// 1️⃣ EmptyState tái sử dụng
// ==============================
const EmptyState = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <View style={styles.emptyWrapper}>
    {icon}
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySubtitle}>{subtitle}</Text>
  </View>
);

// ==============================
// 2️⃣ Dummy Notifications
// ==============================
const notifications = [
  {
    id: 1,
    type: 'booking_reminder',
    title: 'Nhắc nhở lịch hẹn',
    message: 'Bạn có lịch hẹn cắt tóc tại Hair Studio Premium vào 14:30 ngày mai',
    time: '5 phút trước',
    read: false,
    icon: 'calendar',
    color: '#4F46E5',
  },
  {
    id: 2,
    type: 'booking_confirmed',
    title: 'Lịch hẹn đã được xác nhận',
    message: 'Royal Spa & Wellness đã xác nhận lịch hẹn massage của bạn',
    time: '2 giờ trước',
    read: false,
    icon: 'check',
    color: '#10B981',
  },
  {
    id: 3,
    type: 'promotion',
    title: 'Ưu đãi đặc biệt',
    message: 'Giảm 20% cho dịch vụ spa cuối tuần tại Zen Spa & Wellness',
    time: '1 ngày trước',
    read: true,
    icon: 'bell',
    color: '#F59E0B',
  },
  {
    id: 4,
    type: 'booking_cancelled',
    title: 'Lịch hẹn bị hủy',
    message: 'Fitness Center Pro đã hủy lịch hẹn của bạn do sự cố kỹ thuật',
    time: '2 ngày trước',
    read: true,
    icon: 'x',
    color: '#EF4444',
  },
  {
    id: 5,
    type: 'review_reminder',
    title: 'Đánh giá dịch vụ',
    message: 'Hãy để lại đánh giá cho dịch vụ tại Beauty Salon Luxury',
    time: '3 ngày trước',
    read: true,
    icon: 'bell',
    color: '#06B6D4',
  },
];

// ==============================
// 3️⃣ Main Component
// ==============================
export default function NotificationsScreen() {
  const [notificationList, setNotificationList] = useState(notifications);
  const [filter, setFilter] = useState('all');

  const unreadCount = notificationList.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotificationList((prev) => prev.filter((n) => n.id !== id));
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notificationList.filter((n) => !n.read);
      case 'read':
        return notificationList.filter((n) => n.read);
      default:
        return notificationList;
    }
  };

  const getIconComponent = (type: string, color: string) => {
    switch (type) {
      case 'calendar':
        return <Calendar size={20} color={color} />;
      case 'check':
        return <CheckCircle size={20} color={color} />;
      case 'bell':
        return <Bell size={20} color={color} />;
      case 'x':
        return <X size={20} color={color} />;
      default:
        return <Bell size={20} color={color} />;
    }
  };

  const renderNotification = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.notificationCardUnread]}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          {getIconComponent(item.icon, item.color)}
        </View>

        <View style={styles.notificationText}>
          <Text
            style={[
              styles.notificationTitle,
              !item.read && styles.notificationTitleUnread,
            ]}
          >
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <X size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const filterButtons = [
    { id: 'all', name: 'Tất cả', count: notificationList.length },
    { id: 'unread', name: 'Chưa đọc', count: unreadCount },
    { id: 'read', name: 'Đã đọc', count: notificationList.length - unreadCount },
  ];

  const filtered = getFilteredNotifications();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Thông báo</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} thông báo mới` : 'Không có thông báo mới'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                <Text style={styles.markAllButtonText}>Đánh dấu tất cả</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Bộ lọc */}
      <View style={styles.filtersContainer}>
        {filterButtons.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[styles.filterButton, filter === b.id && styles.filterButtonActive]}
            onPress={() => setFilter(b.id)}
          >
            <Text
              style={[styles.filterButtonText, filter === b.id && styles.filterButtonTextActive]}
            >
              {b.name}
            </Text>
            {b.count > 0 && (
              <View style={[styles.filterBadge, filter === b.id && styles.filterBadgeActive]}>
                <Text
                  style={[
                    styles.filterBadgeText,
                    filter === b.id && styles.filterBadgeTextActive,
                  ]}
                >
                  {b.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ✅ Dùng EmptyState */}
      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.notificationsList}
        />
      ) : (
        <EmptyState
          icon={<Bell size={64} color="#D1D5DB" />}
          title={
            filter === 'unread'
              ? 'Không có thông báo chưa đọc'
              : filter === 'read'
              ? 'Không có thông báo đã đọc'
              : 'Không có thông báo'
          }
          subtitle={
            filter === 'unread'
              ? 'Tuyệt vời! Bạn đã đọc hết thông báo'
              : filter === 'read'
              ? 'Chưa có thông báo nào được đọc'
              : 'Thông báo sẽ xuất hiện tại đây'
          }
        />
      )}
    </SafeAreaView>
  );
}

// ==============================
// 4️⃣ Styles
// ==============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: '#E0E7FF' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, marginRight: 12 },
  markAllButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  markAllButtonText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },

  filtersContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonActive: { backgroundColor: '#4F46E5' },
  filterButtonText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  filterButtonTextActive: { color: '#FFFFFF' },
  filterBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: { backgroundColor: '#FFFFFF' },
  filterBadgeText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  filterBadgeTextActive: { color: '#4F46E5' },

  notificationsList: { padding: 20 },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationContent: { flexDirection: 'row', alignItems: 'flex-start' },
  iconContainer: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  notificationText: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 4 },
  notificationTitleUnread: { color: '#111827', fontWeight: '700' },
  notificationMessage: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 8 },
  notificationTime: { fontSize: 12, color: '#9CA3AF' },
  deleteButton: { padding: 4, marginLeft: 8 },
  unreadDot: { position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F46E5' },

  // ✅ EmptyState style
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
});
