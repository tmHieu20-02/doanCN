import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import MapView, { UrlTile, Region } from "react-native-maps";
import { MapPin, Target } from "lucide-react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

const MAP_RESULT_KEY = "map-picker-result";

export default function MapPicker() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [moving, setMoving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 10.762622,
    longitude: 106.660172,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const moveToCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        ...region,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      mapRef.current?.animateToRegion(newRegion, 800);
      setRegion(newRegion);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async () => {
    await SecureStore.setItemAsync(
      MAP_RESULT_KEY,
      JSON.stringify({
        lat: region.latitude.toString(),
        lng: region.longitude.toString(),
      })
    );
    router.back();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onRegionChange={() => setMoving(true)}
        onRegionChangeComplete={(r) => {
          setRegion(r);
          setMoving(false);
        }}
      >
        <UrlTile
  urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
  tileSize={256}          // ⬅️ DÒNG QUYẾT ĐỊNH
  maximumZ={19}
/>

      </MapView>

      <View style={[styles.marker, { transform: [{ translateY: moving ? -12 : 0 }] }]}>
        <MapPin size={42} color="#EF4444" />
      </View>

      <TouchableOpacity style={styles.locateBtn} onPress={moveToCurrentLocation}>
        {loading ? <ActivityIndicator /> : <Target size={22} />}
      </TouchableOpacity>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleSelect}>
        <Text style={styles.confirmText}>Xác nhận vị trí này</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  marker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -21,
    marginTop: -42,
  },
  locateBtn: {
    position: "absolute",
    right: 16,
    bottom: 110,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 30,
    elevation: 6,
  },
  confirmBtn: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 30,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  confirmText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
