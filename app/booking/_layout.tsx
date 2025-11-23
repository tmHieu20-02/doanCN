import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Clock, MapPin, Star } from "lucide-react-native";
import { colors, radius, shadow } from "@/ui/theme";
import { Link } from "expo-router";

export default function ServiceItem({ item }: any) {
  return (
    <View style={styles.itemWrapper}>
      {/* IMAGE LEFT */}
      <Image source={{ uri: item.image }} style={styles.serviceImage} />

      {/* TEXT RIGHT */}
      <View style={styles.infoWrapper}>
        <Text style={styles.serviceName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.categoryText}>
          {item.categoryName || "Danh mục"}
        </Text>

        {/* Rating + Distance */}
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <Star size={14} color={colors.warning} fill={colors.warning} />
            <Text style={styles.rating}>{item.rating ?? 4.8}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount ?? 120})</Text>
          </View>

          <View style={styles.rowCenter}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={styles.distance}>0.5km</Text>
          </View>
        </View>

        {/* Price + Duration */}
        <View style={[styles.rowBetween, { marginTop: 6 }]}>
          <Text style={styles.price}>{item.price}đ</Text>

          <View style={styles.rowCenter}>
            <Clock size={14} color={colors.textMuted} />
            <Text style={styles.duration}>{item.duration}</Text>
          </View>
        </View>

        {/* BOOK BUTTON */}
        <Link
          href={{
            pathname: "/booking/create",
            params: { serviceId: item.id.toString() },
          }}
          asChild
        >
          <TouchableOpacity style={styles.bookBtn}>
            <Text style={styles.bookBtnText}>Đặt lịch</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  itemWrapper: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 14,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },

  serviceImage: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    backgroundColor: "#eee",
  },

  infoWrapper: {
    flex: 1,
    marginLeft: 12,
  },

  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  categoryText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.text,
  },

  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textMuted,
  },

  distance: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textMuted,
  },

  price: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryAlt,
  },

  duration: {
    marginLeft: 4,
    fontSize: 12,
    color: colors.textMuted,
  },

  bookBtn: {
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: radius.md,
  },

  bookBtnText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
});
