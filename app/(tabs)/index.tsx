import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Star, Clock, Filter } from 'lucide-react-native';
import { router } from 'expo-router';

type Service = {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: string;
  duration: string;
  distance: string;
  image: string;
  popular: boolean;
};

type Category = {
  id: number;
  name: string;
  icon: string;
  color: string;
  filterKey: string; // <-- Đây là key để lọc
};

const services: Service[] = [
  {
    id: 1,
    name: 'Hair Studio Premium',
    category: 'Cắt tóc',
    rating: 4.8,
    reviewCount: 125,
    price: '150.000đ',
    duration: '45 phút',
    distance: '0.5km',
    image:
      'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=400',
    popular: true,
  },
  {
    id: 2,
    name: 'Royal Spa & Wellness',
    category: 'Spa & Massage',
    rating: 4.9,
    reviewCount: 89,
    price: '300.000đ',
    duration: '90 phút',
    distance: '1.2km',
    image:
      'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400',
    popular: false,
  },
  {
    id: 3,
    name: 'Fitness Center Pro',
    category: 'Gym & Fitness',
    rating: 4.7,
    reviewCount: 203,
    price: '100.000đ',
    duration: '2 giờ',
    distance: '0.8km',
    image:
      'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400',
    popular: true,
  },
  {
    id: 4,
    name: 'Nail Art Studio',
    category: 'Làm nail',
    rating: 4.6,
    reviewCount: 67,
    price: '200.000đ',
    duration: '60 phút',
    distance: '1.5km',
    image:
      'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=400',
    popular: false,
  },
];

// ✅ SỬA ĐỔI CHÍNH: RÚT GỌN 'filterKey'
const categories: Category[] = [
  // 'Cắt tóc' sẽ khớp với 'Cắt tóc' và 'Cắt tóc, Làm nail'
  { id: 1, name: 'Cắt tóc', icon: '💇‍♀️', color: '#4F46E5', filterKey: 'Cắt tóc' }, 
  
  // 'Spa' sẽ khớp với 'Spa, Massage'
  { id: 2, name: 'Spa', icon: '🧖‍♀️', color: '#06B6D4', filterKey: 'Spa' }, 
  
  // 'Gym' sẽ khớp với 'Gym, Yoga' hoặc 'Gym & Fitness'
  { id: 3, name: 'Gym', icon: '💪', color: '#F59E0B', filterKey: 'Gym' }, 
  
  // 'Nail' sẽ khớp với 'Làm nail'
  { id: 4, name: 'Nail', icon: '💅', color: '#EC4899', filterKey: 'Nail' }, 
  
  // 'Massage' sẽ khớp với 'Spa, Massage'
  { id: 5, name: 'Massage', icon: '💆‍♀️', color: '#10B981', filterKey: 'Massage' }, 
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    router.push({ pathname: '/search', params: { q: searchQuery } });
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.serviceCard}
      onPress={() =>
        router.push({
          pathname: '/service/[id]',
          params: { id: item.id },
        })
      }>
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Phổ biến</Text>
        </View>
      )}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceCategory}>{item.category}</Text>

        <View style={styles.serviceDetails}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>

          <View style={styles.locationContainer}>
            <MapPin size={14} color="#9CA3AF" />
            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price}</Text>
          <View style={styles.durationContainer}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={styles.duration}>{item.duration}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Logic onPress đã đúng, nó sẽ gửi filterKey (đã rút gọn) đi
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
      ]}
      onPress={() => {
        router.push({
          pathname: '/search', 
          params: { category: item.filterKey } // Gửi 'Gym', 'Spa', 'Nail'...
        });
      }}>
      <View
        style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.categoryEmoji}>{item.icon}</Text>
      </View>
      <Text
        style={[
          styles.categoryName,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={services} 
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.serviceRow}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.greeting}>Xin chào 👋</Text>
                  <Text style={styles.userName}>Nguyễn Văn A</Text>
                </View>
                <TouchableOpacity style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
                    }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
              </View>

              {/* Search bar */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Search size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm dịch vụ, spa, gym..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                    onSubmitEditing={handleSearchSubmit}
                    returnKeyType="search"
                  />
                  <TouchableOpacity style={styles.filterButton}>
                    <Filter size={20} color="#4F46E5" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh mục dịch vụ</Text>
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </View>

            {/* Services */}
            <View style={[styles.section, styles.sectionHeader]}>
              <Text style={styles.sectionTitle}>Dịch vụ nổi bật</Text>
              <TouchableOpacity onPress={() => router.push('/search')}> 
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  greeting: { fontSize: 16, color: '#E0E7FF', fontWeight: '400' },
  userName: { fontSize: 26, color: '#FFFFFF', fontWeight: '700', marginTop: 2 },
  avatarContainer: { padding: 2, backgroundColor: '#FFFFFF', borderRadius: 25 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  searchContainer: { marginTop: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#374151' },
  filterButton: { padding: 8, backgroundColor: '#EEF2FF', borderRadius: 12 },
  section: { paddingHorizontal: 20, marginTop: 26 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  seeAllText: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  categoriesList: { paddingVertical: 10 },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryItemSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: { fontSize: 24 },
  categoryName: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  categoryNameSelected: { color: '#4F46E5' },
  serviceRow: { justifyContent: 'space-between', marginBottom: 18 },
  serviceCard: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  serviceImage: { width: '100%', height: 130, resizeMode: 'cover' },
  popularBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: { fontSize: 10, fontWeight: '600', color: '#FFFFFF' },
  serviceInfo: { padding: 12 },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceCategory: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: 12, fontWeight: '600', color: '#111827', marginLeft: 4 },
  reviewCount: { fontSize: 12, color: '#6B7280', marginLeft: 2 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  distance: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 16, fontWeight: '700', color: '#4F46E5' },
  durationContainer: { flexDirection: 'row', alignItems: 'center' },
  duration: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
});