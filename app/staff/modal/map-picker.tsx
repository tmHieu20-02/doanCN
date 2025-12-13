import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { UrlTile } from "react-native-maps";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function MapPicker() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialLat = Number(params.lat) || 10.762622;
  const initialLng = Number(params.lng) || 106.660172;

  const [region, setRegion] = useState({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const handleSelect = () => {
    router.replace({
      pathname: "/staff/profile/edit",
      params: {
        selectedLat: region.latitude.toString(),
        selectedLng: region.longitude.toString(),
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChangeComplete={(r) => setRegion(r)}
      >
        <UrlTile
          urlTemplate="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          maximumZ={19}
        />
      </MapView>

      <View style={styles.markerFixed}>
        <Text style={styles.marker}>📍</Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSelect}>
        <Text style={styles.saveText}>Chọn vị trí này</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  markerFixed: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -35,
  },
  marker: { fontSize: 35 },
  saveBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
