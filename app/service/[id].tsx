import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions, // Import Dimensions
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  Heart,
  Calendar,
  CheckCircle,
  Users,
  Award,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Lấy chiều rộng màn hình
const { width: screenWidth } = Dimensions.get('window');

const serviceDetails: Record<string, any> = {
  1: {
    name: 'Hair Studio Premium',
    category: 'Cắt tóc',
    rating: 4.8,
    reviewCount: 125,
    price: '150.000đ',
    originalPrice: '200.000đ',
    duration: '45 phút',
    distance: '0.5km',
    address: '123 Trần Hưng Đạo, Quận 1, TP.HCM',
    phone: '0123456789',
    description:
      'Salon tóc cao cấp với đội ngũ stylist chuyên nghiệp, sử dụng sản phẩm chính hãng và công nghệ hiện đại. Mang đến cho bạn phong cách tóc hoàn hảo.',
    images: [
      'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3992859/pexels-photo-3992859.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    services: [
      { name: 'Cắt tóc nam', price: '150.000đ', duration: '30 phút' },
      { name: 'Cắt tóc nữ', price: '200.000đ', duration: '45 phút' },
      { name: 'Nhuộm tóc', price: '500.000đ', duration: '120 phút' },
      { name: 'Uốn tóc', price: '800.000đ', duration: '150 phút' },
    ],
    features: [
      'Stylist chuyên nghiệp',
      'Sản phẩm chính hãng',
      'Tư vấn miễn phí',
      'Bảo hành 30 ngày',
    ],
    workingHours: '8:00 - 22:00 (T2 - CN)',
    reviews: [
      {
        id: 1,
        name: 'Nguyễn Thị B',
        avatar:
          'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        comment: 'Dịch vụ tuyệt vời, stylist rất chuyên nghiệp và tận tình.',
        date: '2024-03-10',
      },
      {
        id: 2,
        name: 'Trần Văn C',
        avatar:
          'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4,
        comment: 'Không gian sang trọng, nhân viên thân thiện, rất hài lòng.',
        date: '2024-03-08',
      },
    ],
  },
  2: {
    name: 'Zen Spa & Wellness',
    category: 'Spa & Massage',
    rating: 4.9,
    reviewCount: 98,
    price: '300.000đ',
    originalPrice: '400.000đ',
    duration: '90 phút',
    distance: '1.2km',
    address: '45 Nguyễn Đình Chiểu, Quận 3, TP.HCM',
    phone: '0909123456',
    description:
      'Trải nghiệm thư giãn đỉnh cao với dịch vụ massage chuyên nghiệp, không gian yên tĩnh và hương liệu tự nhiên giúp tái tạo năng lượng.',
    images: [
      'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3865792/pexels-photo-3865792.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    services: [
      { name: 'Massage toàn thân', price: '300.000đ', duration: '90 phút' },
      { name: 'Chăm sóc da mặt', price: '250.000đ', duration: '60 phút' },
      { name: 'Liệu pháp đá nóng', price: '350.000đ', duration: '100 phút' },
    ],
    features: [
      'Không gian thư giãn',
      'Liệu pháp thiên nhiên',
      'Chuyên viên giàu kinh nghiệm',
    ],
    workingHours: '9:00 - 21:00 (T2 - CN)',
    reviews: [
      {
        id: 1,
        name: 'Lê Minh',
        avatar:
          'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        comment: 'Dịch vụ massage tuyệt vời, cảm giác thư giãn hoàn toàn!',
        date: '2024-04-12',
      },
    ],
  },
  3: {
    name: 'Elite Fitness Center',
    category: 'Gym & Fitness',
    rating: 4.7,
    reviewCount: 203,
    price: '100.000đ',
    originalPrice: '120.000đ',
    duration: '2 giờ',
    distance: '0.8km',
    address: '200 Lý Tự Trọng, Quận 1, TP.HCM',
    phone: '0988776655',
    description:
      'Phòng tập hiện đại với thiết bị nhập khẩu, huấn luyện viên cá nhân chuyên nghiệp và không gian rộng rãi.',
    images: [
      'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    services: [
      { name: 'Tập gym tự do', price: '100.000đ', duration: '120 phút' },
      { name: 'Huấn luyện cá nhân', price: '300.000đ', duration: '90 phút' },
      { name: 'Yoga buổi sáng', price: '120.000đ', duration: '60 phút' },
    ],
    features: [
      'Huấn luyện viên chuyên nghiệp',
      'Thiết bị nhập khẩu',
      'Phòng tắm riêng tư',
    ],
    workingHours: '6:00 - 23:00 (T2 - CN)',
    reviews: [
      {
        id: 1,
        name: 'Đặng Thảo',
        avatar:
          'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 4,
        comment: 'Phòng tập rộng rãi, sạch sẽ, huấn luyện viên rất nhiệt tình.',
        date: '2024-02-20',
      },
    ],
  },
  4: {
    name: 'Nail Art Studio',
    category: 'Làm nail',
    rating: 4.6,
    reviewCount: 67,
    price: '200.000đ',
    originalPrice: '250.000đ',
    duration: '60 phút',
    distance: '1.5km',
    address: '12 Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    phone: '0977665544',
    description:
      'Dịch vụ làm nail chuyên nghiệp với hàng trăm mẫu mới, dụng cụ vệ sinh tuyệt đối và kỹ thuật viên tận tâm.',
    images: [
      'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1616813/pexels-photo-1616813.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    services: [
      { name: 'Sơn gel cơ bản', price: '200.000đ', duration: '60 phút' },
      { name: 'Vẽ móng nghệ thuật', price: '250.000đ', duration: '75 phút' },
      { name: 'Chăm sóc móng chuyên sâu', price: '300.000đ', duration: '90 phút' },
    ],
    features: [
      'Dụng cụ vô trùng',
      'Mẫu nail cập nhật liên tục',
      'Chuyên viên tỉ mỉ và thân thiện',
    ],
    workingHours: '8:30 - 21:30 (T2 - CN)',
    reviews: [
      {
        id: 1,
        name: 'Ngọc Anh',
        avatar:
          'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5,
        comment: 'Móng rất đẹp, nhân viên cực kỳ dễ thương và tỉ mỉ.',
        date: '2024-01-15',
      },
    ],
  },
};

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const service = serviceDetails[id as string] || serviceDetails['1'];

  const renderImageDot = (index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.imageDot,
        selectedImageIndex === index && styles.imageDotActive,
      ]}
      onPress={() => setSelectedImageIndex(index)}
    />
  );

  const renderServiceItem = (
    serviceItem: { name: string; price: string; duration: string },
    index: number
  ) => (
    <View key={index} style={styles.serviceItem}>
      <View style={styles.serviceItemInfo}>
        <Text style={styles.serviceItemName}>{serviceItem.name}</Text>
        <Text style={styles.serviceItemDuration}>{serviceItem.duration}</Text>
      </View>
      <Text style={styles.serviceItemPrice}>{serviceItem.price}</Text>
    </View>
  );

  const renderFeature = (feature: string, index: number) => (
    <View key={index} style={styles.featureItem}>
      <CheckCircle size={16} color="#10B981" />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  const renderReview = (
    review: {
      id: number;
      name: string;
      avatar: string;
      rating: number;
      comment: string;
      date: string;
    },
    index: number
  ) => (
    <View key={index} style={styles.reviewItem}>
      <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewName}>{review.name}</Text>
          <Text style={styles.reviewDate}>{review.date}</Text>
        </View>
        <View style={styles.reviewRating}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              color="#F59E0B"
              fill={i < review.rating ? '#F59E0B' : 'none'}
            />
          ))}
        </View>
        <Text style={styles.reviewComment}>{review.comment}</Text>
      </View>
    </View>
  );

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

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => setIsFavorited(!isFavorited)}
        >
          <Heart
            size={24}
            color={isFavorited ? '#EC4899' : '#6B7280'}
            fill={isFavorited ? '#EC4899' : 'none'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Images */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x /
                  event.nativeEvent.layoutMeasurement.width
              );
              setSelectedImageIndex(index);
            }}
          >
            {service.images.map((image: string, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={[styles.serviceImage, { width: screenWidth }]} // Sử dụng screenWidth
              />
            ))}
          </ScrollView>

          <View style={styles.imageDots}>
            {service.images.map((_: string, index: number) =>
              renderImageDot(index)
            )}
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <View style={styles.titleSection}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceCategory}>{service.category}</Text>
          </View>

          <View style={styles.ratingSection}>
            <View style={styles.ratingContainer}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.rating}>{service.rating}</Text>
              <Text style={styles.reviewCount}>
                ({service.reviewCount} đánh giá)
              </Text>
            </View>

            <View style={styles.badgesContainer}>
              <View style={styles.badge}>
                <Award size={12} color="#4F46E5" />
                <Text style={styles.badgeText}>Chất lượng cao</Text>
              </View>

              <View style={styles.badge}>
                <Users size={12} color="#10B981" />
                <Text style={styles.badgeText}>Phổ biến</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.detailText}>{service.distance}</Text>
            </View>

            <View style={styles.detailItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.detailText}>{service.duration}</Text>
            </View>

            <TouchableOpacity style={styles.detailItem}>
              <Phone size={16} color="#6B7280" />
              <Text style={styles.detailText}>Gọi ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceSection}>
          <View style={styles.priceInfo}>
            <Text style={styles.currentPrice}>{service.price}</Text>
            {service.originalPrice && (
              <Text style={styles.originalPrice}>{service.originalPrice}</Text>
            )}
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-25%</Text>
            </View>
          </View>
          <Text style={styles.priceNote}>Giá đã bao gồm VAT</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đặc điểm nổi bật</Text>
          <View style={styles.featuresContainer}>
            {service.features.map((f: string, i: number) =>
              renderFeature(f, i)
            )}
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ</Text>
          <View style={styles.servicesContainer}>
            {service.services.map(
              (
                s: { name: string; price: string; duration: string },
                i: number
              ) => renderServiceItem(s, i)
            )}
          </View>
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giờ hoạt động</Text>
          <View style={styles.workingHoursContainer}>
            <Clock size={20} color="#4F46E5" />
            <Text style={styles.workingHours}>{service.workingHours}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ</Text>
          <View style={styles.locationContainer}>
            <MapPin size={20} color="#4F46E5" />
            <Text style={styles.address}>{service.address}</Text>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              Đánh giá ({service.reviewCount})
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.reviewsContainer}>
            {service.reviews.map((r: any, i: number) => renderReview(r, i))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.bookButton}
        >
          {/**************************************/}
          {/* FIX LỖI NẰM NGAY TẠI ĐÂY   */}
          {/**************************************/}
          <TouchableOpacity
            style={styles.bookButtonContent}
          onPress={() =>
 router.push({
  pathname: "/booking",
  params: { serviceId: id?.toString() },
})

}


          >
            <Calendar size={20} color="#FFFFFF" />
            <Text style={styles.bookButtonText}>Đặt lịch ngay</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSection: {
    position: 'relative',
  },
  serviceImage: {
    // width: 390, // Xóa width cứng, dùng Dimensions
    height: 240,
    resizeMode: 'cover',
  },
  imageDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  imageDotActive: {
    backgroundColor: '#FFFFFF',
  },
  basicInfo: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  titleSection: {
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 16,
    color: '#6B7280',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap', // Thêm wrap
    gap: 8, // Thêm gap
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Đổi thành space-between
    alignItems: 'center', // Thêm align items
    flexWrap: 'wrap', // Thêm wrap
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12, // Thêm margin
    paddingVertical: 4, // Thêm padding
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceSection: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  priceNote: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  servicesContainer: {
    gap: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  serviceItemInfo: {
    flex: 1,
    marginRight: 8, // Thêm margin
  },
  serviceItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  serviceItemDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  workingHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workingHours: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  address: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  reviewsContainer: {
    gap: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    borderRadius: 12,
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});