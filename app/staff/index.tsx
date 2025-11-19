import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, List, Star, User, ChevronRight } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";

export default function StaffHome() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang nhân viên</Text>
        <Text style={styles.headerSub}>Xin chào, {user?.numberPhone}</Text>
      </View>

      {/* THỐNG KÊ NHANH */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#FFD27F" }]}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Lịch hẹn hôm nay</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#FFB48A" }]}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Đang chờ</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#A0E7E5" }]}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#C4B5FD" }]}>
          <Text style={styles.statNumber}>4.9 ★</Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
      </View>

      {/* MENU CHÍNH */}
      <Text style={styles.sectionTitle}>Chức năng</Text>

   <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/staff/(tabs)/bookings")}>
  <Calendar color="#444" size={22} />
  <Text style={styles.menuLabel}>Quản lý lịch hẹn</Text>
  <ChevronRight color="#999" />
</TouchableOpacity>

<TouchableOpacity style={styles.menuItem} onPress={() => router.push("/staff/(tabs)/services")}>
  <List color="#444" size={22} />
  <Text style={styles.menuLabel}>Dịch vụ</Text>
  <ChevronRight color="#999" />
</TouchableOpacity>

<TouchableOpacity style={styles.menuItem} onPress={() => router.push("/staff/(tabs)/profile")}>
  <User color="#444" size={22} />
  <Text style={styles.menuLabel}>Hồ sơ nhân viên</Text>
  <ChevronRight color="#999" />
</TouchableOpacity>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F7F7",
    flex: 1,
  },

  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSub: {
    marginTop: 6,
    fontSize: 14,
    color: "#666",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 18,
  },
  statCard: {
    width: "48%",
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 6,
    color: "#444",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 26,
    marginBottom: 10,
    paddingHorizontal: 16,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  menuLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});
