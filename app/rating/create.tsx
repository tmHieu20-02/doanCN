import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius, shadow, spacing } from "../../ui/theme";

/* ================================
   STAR ICON SIMPLE
================================ */
const StarSVG = ({ size, color }: { size: number; color: string }) => (
  <Text style={{ fontSize: size, color }}>★</Text>
);

export default function RatingCreate() {
  const params = useLocalSearchParams();

  // ép kiểu param (fix undefined + must be number)
  const serviceId = params.serviceId ? Number(params.serviceId) : null;
  const bookingId = params.bookingId ? Number(params.bookingId) : null;

  const [service, setService] = useState<any>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  // Animated values for stars
  const animValues = [...Array(5)].map(() => new Animated.Value(1));

  const animateStar = (index: number) => {
    Animated.sequence([
      Animated.timing(animValues[index], {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(animValues[index], {
        toValue: 1.0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSetRating = (value: number) => {
    setRating(value);
    animateStar(value - 1);
  };

  /* ================================
      FETCH SERVICE INFO
  ================================= */
  const fetchService = async () => {
    if (!serviceId) return;

    try {
      const res = await axios.get(`https://phatdat.store/api/v1/service/${serviceId}`);
      setService(res.data?.data);
      console.log("SERVICE DATA => ", res.data?.data);
    } catch (error) {
      console.log("LOAD SERVICE ERROR =>", error);
    }
  };

  useEffect(() => {
    fetchService();
  }, []);

  /* ================================
      SUBMIT
  ================================= */
  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert("Thiếu đánh giá", "Vui lòng chọn số sao.");
      return;
    }

    if (!serviceId || !bookingId) {
      console.log("PARAM FAILED:", serviceId, bookingId);
      Alert.alert("Lỗi", "Thiếu serviceId hoặc bookingId.");
      return;
    }

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      const body = {
        service_id: serviceId,
        booking_id: bookingId,
        rating,
        comment,
      };

      await axios.post("https://phatdat.store/api/v1/rating/create", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!", [
        { text: "OK", onPress: () => router.replace("/(tabs)/bookings") },
      ]);
    } catch (err: any) {
      console.log("RATING ERROR:", err?.response?.data || err);
      Alert.alert("Lỗi", "Không thể gửi đánh giá.");
    }
  };

  /* ================================
      UI
  ================================= */
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Đánh giá dịch vụ</Text>

      {/* SERVICE CARD */}
      {service && (
        <View style={styles.serviceCard}>
          <Image
            source={{
              uri: service?.image
                ? service.image
                : "https://via.placeholder.com/150?text=No+Image",
            }}
            style={styles.serviceImg}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDesc}>{service.description}</Text>
          </View>
        </View>
      )}

      {/* RATING */}
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((s, i) => {
          const isActive = s <= rating;

          return (
            <TouchableOpacity key={s} onPress={() => handleSetRating(s)} activeOpacity={0.9}>
              <Animated.View
                style={{
                  transform: [{ scale: animValues[i] }],
                  marginHorizontal: 6,
                  opacity: isActive ? 1 : 0.4,
                }}
              >
                <StarSVG size={44} color={isActive ? "#FFD43B" : "#909090"} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* COMMENT */}
      <Text style={styles.label}>Nhận xét của bạn</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Viết nhận xét..."
        placeholderTextColor={colors.textMuted}
        multiline
        value={comment}
        onChangeText={setComment}
      />

      {/* SUBMIT */}
      <TouchableOpacity onPress={handleSubmit} style={{ marginTop: 20 }}>
        <LinearGradient colors={[colors.primary, colors.primaryAlt]} style={styles.submitButton}>
          <Text style={styles.submitText}>Gửi đánh giá</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ================================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing(5),
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing(6),
    marginTop: spacing(4),
  },

  /* SERVICE */
  serviceCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    ...shadow.card,
  },
  serviceImg: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 14,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  serviceDesc: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },

  /* RATING */
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing(6),
  },

  /* COMMENT */
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing(2),
  },
  textArea: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    minHeight: 120,
    fontSize: 15,
    color: colors.text,
    ...shadow.card,
  },

  /* SUBMIT */
  submitButton: {
    paddingVertical: spacing(4),
    borderRadius: radius.lg,
    alignItems: "center",
    ...shadow.card,
  },
  submitText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
});
