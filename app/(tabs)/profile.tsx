import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, SafeAreaView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, 
  Settings, 
  Heart, 
  CreditCard, 
  MapPin, 
  Bell, 
  HelpCircle, 
  Shield, 
  LogOut,
  ChevronRight,
  Edit3,
  Star,
  Calendar,
  Gift
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const profileStats = [
  { id: 1, name: 'Lịch hẹn', value: '24', icon: 'calendar', color: '#4F46E5' },
  { id: 2, name: 'Yêu thích', value: '8', icon: 'heart', color: '#EC4899' },
  { id: 3, name: 'Điểm thưởng', value: '1,250', icon: 'gift', color: '#F59E0B' },
];

const menuSections = [
  {
    title: 'Tài khoản',
    items: [
      { id: 'edit-profile', name: 'Chỉnh sửa hồ sơ', icon: 'edit', color: '#4F46E5' },
      { id: 'addresses', name: 'Địa chỉ của tôi', icon: 'map-pin', color: '#10B981' },
      { id: 'payment', name: 'Phương thức thanh toán', icon: 'credit-card', color: '#F59E0B' },
      { id: 'favorites', name: 'Dịch vụ yêu thích', icon: 'heart', color: '#EC4899' },
    ],
  },
  {
    title: 'Cài đặt',
    items: [
      { id: 'notifications', name: 'Thông báo', icon: 'bell', color: '#06B6D4', hasSwitch: true, enabled: true },
      { id: 'privacy', name: 'Quyền riêng tư', icon: 'shield', color: '#8B5CF6' },
      { id: 'help', name: 'Trợ giúp & hỗ trợ', icon: 'help-circle', color: '#10B981' },
    ],
  },
];

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { signOut } = useAuth();


  const getIconComponent = (iconName: string, size = 20, color: string) => {
    const iconProps = { size, color };
    switch (iconName) {
      case 'edit': return <Edit3 {...iconProps} />;
      case 'map-pin': return <MapPin {...iconProps} />;
      case 'credit-card': return <CreditCard {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      case 'bell': return <Bell {...iconProps} />;
      case 'shield': return <Shield {...iconProps} />;
      case 'help-circle': return <HelpCircle {...iconProps} />;
      case 'calendar': return <Calendar {...iconProps} />;
      case 'gift': return <Gift {...iconProps} />;
      default: return <User {...iconProps} />;
    }
  };
interface StatItem {
  id: number;
  name: string;
  value: string;
  icon: string;
  color: string;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  hasSwitch?: boolean;
  enabled?: boolean;
}

  const renderStatCard = (stat: StatItem) => (
    <View key={stat.id} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
        {getIconComponent(stat.icon, 20, stat.color)}
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statName}>{stat.name}</Text>
    </View>
  );

 const renderMenuItem = (item: MenuItem, isLast = false) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.menuItem, isLast && styles.menuItemLast]}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
          {getIconComponent(item.icon, 20, item.color)}
        </View>
        <Text style={styles.menuItemText}>{item.name}</Text>
      </View>
      
      <View style={styles.menuItemRight}>
        {item.hasSwitch ? (
          <Switch
            value={item.id === 'notifications' ? notificationsEnabled : item.enabled}
            onValueChange={(value) => {
              if (item.id === 'notifications') {
                setNotificationsEnabled(value);
              }
            }}
            trackColor={{ false: '#F3F4F6', true: '#4F46E5' }}
            thumbColor='#FFFFFF'
          />
        ) : (
          <ChevronRight size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.header}
        >
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Edit3 size={16} color="#4F46E5" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Nguyễn Văn A</Text>
              <Text style={styles.userEmail}>nguyenvana@gmail.com</Text>
              <Text style={styles.userPhone}>+84 123 456 789</Text>
              
              <View style={styles.membershipBadge}>
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.membershipText}>Thành viên VIP</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsContainer}>
            {profileStats.map(renderStatCard)}
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {menuSections.map((section, sectionIndex) => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.title}</Text>
              <View style={styles.menuCard}>
                {section.items.map((item, itemIndex) => 
                  renderMenuItem(item, itemIndex === section.items.length - 1)
                )}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <View style={styles.menuSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => signOut()}>
          <View style={styles.logoutButtonContent}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </View>
       </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>BookingApp v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  membershipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  statsSection: {
    marginTop: -20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statName: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  menuItemRight: {
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 40,
  },
  appInfoText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});