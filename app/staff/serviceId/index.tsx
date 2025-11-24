import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { getMyServices } from "./serviceService";

export default function StaffServices() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  const fetchServices = async () => {
    try {
      const res = await getMyServices();
      setServices(res.data.data);
   } catch (err: any) {
  console.log("SERVICE ERROR:", err?.response?.data || err);
}
 finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!services.length) {
    return (
      <View style={styles.center}>
        <Text>Không có dịch vụ nào</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {services.map((item: any) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title}>{item.name}</Text>
          <Text>{item.description}</Text>
          <Text>Giá: {item.price} đ</Text>
          <Text>Thời gian: {item.duration_minutes} phút</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" }
});
