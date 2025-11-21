import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Theme
import { colors, radius, shadow, spacing } from "../../ui/theme";

export default function RatingCreate() {
  const { serviceId, bookingId } = useLocalSearchParams();

  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!rating) {
      Alert.alert("Thiếu đánh giá", "Vui lòng chọn số sao.");
      return;
    }

    try {
      const stored = await SecureStore.getItemAsync("my-user-session");
      const token = stored ? JSON.parse(stored).token : null;

      const body = {
        service_id: Number(serviceId),
        booking_id: Number(bookingId),
        rating,
        comment,
      };

      await axios.post("https://phatdat.store/api/v1/rating/create", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)/bookings"),
        },
      ]);
    } catch (err: any) {
      console.log("RATING ERROR:", err?.response?.data || err);
      Alert.alert("Lỗi", "Không thể gửi đánh giá.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Đánh giá dịch vụ</Text>

      {/* STAR RATING */}
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity key={s} onPress={() => setRating(s)}>
            <Star
              size={42}
              color={s <= rating ? colors.primary : colors.textMuted}
              fill={s <= rating ? colors.primary : "none"}
              style={{ marginHorizontal: 6 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* COMMENT INPUT */}
      <Text style={styles.label}>Nhận xét của bạn</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Viết nhận xét..."
        placeholderTextColor={colors.textMuted}
        multiline
        value={comment}
        onChangeText={setComment}
      />

      {/* SUBMIT BUTTON */}
      <TouchableOpacity onPress={handleSubmit} style={{ marginTop: 20 }}>
        <LinearGradient
          colors={[colors.primary, colors.primaryAlt]}
          style={styles.submitButton}
        >
          <Text style={styles.submitText}>Gửi đánh giá</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing(6),
  },
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
