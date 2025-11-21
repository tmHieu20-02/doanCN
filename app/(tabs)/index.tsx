import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, MapPin, Star, Clock, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

// Hooks
import { useCategories, Category } from '../../hooks/useCategories';

// Theme
import { colors } from '@/ui/theme';

export type Service = {
  id: number;
  name: string;
  description?: string;
  image?: string;
  price: number;
  duration?: string;
  categoryId: number;
  rating?: number;
  reviewCount?: number;
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  const { categories, isLoading: categoriesLoading, error: categoriesError } =
    useCategories();

  /* ---------------------------------------------------------
        FINAL: LẤY DỊCH VỤ QUA API BOOKING (User không có quyền service)
  ----------------------------------------------------------*/
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');

  useEffect(() => {
  const fetchServices = async () => {
    try {
      setServicesLoading(true);

      const session = await SecureStore.getItemAsync("my-user-session");
      const token = session ? JSON.parse(session).token : null;

      const res = await fetch("https://phatdat.store/api/v1/service/get-all", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
      });

      const json = await res.json();

      if (!json.data) {
        setServicesError("Không thể tải dịch vụ.");
        return;
      }

      const mapped = json.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        image: s.image || "https://picsum.photos/400",
        price: s.price || 0,
        duration: `${s.duration_minutes} phút`,
        categoryId: s.category_id,
        rating: 4.8,
        reviewCount: 120,
      }));

      setServices(mapped);
    } catch (e) {
      setServicesError("Không thể tải dịch vụ.");
    } finally {
      setServicesLoading(false);
    }
  };

  fetchServices();
}, []);


  /* ------------------------------------------------------- */

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const jsonValue = await SecureStore.getItemAsync('my-user-session');
        if (jsonValue) {
          const userData = JSON.parse(jsonValue);
          console.log('>>> HOME USER DATA:', userData);
          setUser(userData);
        }
      } catch (e) {
        console.error('Lỗi lấy thông tin user:', e);
      }
    };

    loadUserInfo();
  }, []);

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return;
    router.push({ pathname: '/search', params: { q: searchQuery } });
  };

  /* ---------------- SERVICE CARD ---------------- */
  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.serviceCard}
      onPress={() =>
        router.push({
          pathname: '/service/[id]',
          params: { id: item.id },
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.serviceImage} />

      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.serviceCategory}>Danh mục #{item.categoryId}</Text>

        <View style={styles.serviceDetails}>
          <View style={styles.ratingContainer}>
            <Star size={14} color={colors.warning} fill={colors.warning} />
            <Text style={styles.rating}>{item.rating ?? '4.8'}</Text>
            <Text style={styles.reviewCount}>
              ({item.reviewCount ?? 100})
            </Text>
          </View>

          <View style={styles.locationContainer}>
            <MapPin size={14} color="#9CA3AF" />
            <Text style={styles.distance}>0.5km</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price}đ</Text>
          <View style={styles.durationContainer}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={styles.duration}>
              {item.duration ?? '30 phút'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  /* ---------------- CATEGORY CARD ---------------- */
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() =>
        router.push({
          pathname: '/search',
          params: { category: item.name },
        })
      }
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryEmoji}>{item.icon ?? '⭐'}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
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
            {/* ---------------- HEADER + GRADIENT ---------------- */}
            <LinearGradient
              colors={[colors.primary, colors.primaryAlt]}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.greeting}>Xin chào 👋</Text>

                  <Text style={styles.userName}>
                    {user?.name ||
                      user?.fullName ||
                      user?.numberPhone ||
                      'Khách hàng'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  <Image
                    source={{
                      uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
                    }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
              </View>

              {/* ---------------- SEARCH BAR ---------------- */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <Search size={20} color="#A1A1AA" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm dịch vụ, spa, gym..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                    onSubmitEditing={handleSearchSubmit}
                  />
                  <TouchableOpacity style={styles.filterButton}>
                    <Filter size={20} color={colors.primaryAlt} />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

            {/* ---------------- CATEGORIES ---------------- */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh mục dịch vụ</Text>

              {categoriesLoading && (
                <ActivityIndicator
                  color={colors.primaryAlt}
                  style={{ marginTop: 20 }}
                />
              )}

              {categoriesError && (
                <Text style={styles.errorText}>
                  {categoriesError.includes('403')
                    ? 'Bạn chưa có quyền xem danh mục (Role User)'
                    : 'Không thể tải danh mục.'}
                </Text>
              )}

              {!categoriesLoading && !categoriesError && (
                <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                />
              )}
            </View>

            {/* ---------------- FEATURED ---------------- */}
            <View style={[styles.section, styles.sectionHeader]}>
              <Text style={styles.sectionTitle}>Dịch vụ nổi bật</Text>
              <TouchableOpacity onPress={() => router.push('/search')}>
                <Text style={styles.seeAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {servicesLoading && (
              <ActivityIndicator
                color={colors.primaryAlt}
                style={{ marginTop: 30 }}
              />
            )}

            {servicesError && (
              <Text style={[styles.errorText, { textAlign: 'center' }]}>
                Không thể tải dịch vụ.
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ------------------------ STYLES (GIỮ NGUYÊN 100%) ------------------------ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
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
  greeting: { fontSize: 16, color: '#FFF8D1' },
  userName: { fontSize: 26, color: '#FFFFFF', fontWeight: '800' },
  avatarContainer: {
    padding: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
  },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  searchContainer: { marginTop: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#374151' },
  filterButton: {
    padding: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  section: { paddingHorizontal: 20, marginTop: 26 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  seeAllText: { fontSize: 14, fontWeight: '600', color: colors.primaryAlt },
  categoriesList: { paddingVertical: 10 },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    width: 90,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    backgroundColor: colors.primaryLight,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: { fontSize: 24 },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  serviceRow: {
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  serviceImage: { width: '100%', height: 130, resizeMode: 'cover' },
  serviceInfo: { padding: 12 },
  serviceName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  serviceCategory: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: 12, fontWeight: '600', marginLeft: 4, color: colors.text },
  reviewCount: { fontSize: 12, color: '#6B7280', marginLeft: 2 },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  distance: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  price: { fontSize: 16, fontWeight: '700', color: colors.primaryAlt },
  durationContainer: { flexDirection: 'row', alignItems: 'center' },
  duration: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  errorText: {
    marginTop: 20,
    paddingHorizontal: 20,
    color: colors.danger,
    fontSize: 14,
  },
});
