import { View, Text, StyleSheet } from "react-native";

export default function StaffBooking() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý lịch hẹn</Text>
      <Text style={styles.sub}>Tính năng đang được phát triển...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  sub: {
    fontSize: 16,
    color: "#666",
  },
});
