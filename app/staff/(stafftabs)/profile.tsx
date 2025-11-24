import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react-native";

export default function StaffProfile() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/login"); // Quay lại login
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <Text style={styles.header}>Hồ sơ nhân viên</Text>

      {/* AVATAR + INFO */}
      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <User size={42} color="#fff" />
        </View>

        <Text style={styles.name}>Nhân viên #{user?.id}</Text>
        <Text style={styles.phone}>{user?.numberPhone}</Text>

        <View style={styles.roleTag}>
          <Text style={styles.roleText}>Staff</Text>
        </View>
      </View>

      {/* INFO BOX */}
      <View style={styles.infoBox}>
        <Text style={styles.infoItem}>
          <Text style={styles.label}>ID: </Text>
          {user?.id}
        </Text>

        <Text style={styles.infoItem}>
          <Text style={styles.label}>Số điện thoại: </Text>
          {user?.numberPhone}
        </Text>

        <Text style={styles.infoItem}>
          <Text style={styles.label}>Vai trò: </Text>
          Nhân viên (Staff)
        </Text>
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F7F7F7",
    flex: 1,
  },

  header: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  profileBox: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    backgroundColor: "#FFB300",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },

  phone: {
    color: "#666",
    fontSize: 15,
    marginTop: 4,
  },

  roleTag: {
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },

  roleText: {
    color: "#444",
    fontWeight: "600",
  },

  infoBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },

  infoItem: {
    fontSize: 15,
    marginBottom: 10,
  },

  label: {
    fontWeight: "700",
    color: "#333",
  },

  logoutBtn: {
    marginTop: 10,
    paddingVertical: 14,
    backgroundColor: "#E53935",
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
});
