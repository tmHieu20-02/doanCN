import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

const MAP_RESULT_KEY = "map-picker-result";
const DRAFT_KEY = "staff-edit-profile-draft";

export default function MapPicker() {
  const router = useRouter();
  const mapRef = useRef<any>(null); 
  const [center, setCenter] = useState<[number, number]>([106.660172, 10.762622]);

  // Load tọa độ hiện tại nếu đã có để không bị nhảy map về mặc định
  useEffect(() => {
    (async () => {
      const draft = await SecureStore.getItemAsync(DRAFT_KEY);
      if (draft) {
        const d = JSON.parse(draft);
        if (d.storeLat && d.storeLng) setCenter([parseFloat(d.storeLng), parseFloat(d.storeLat)]);
      }
    })();
  }, []);

  // Cập nhật tọa độ tâm liên tục khi di chuyển
  const onRegionDidChange = (e: any) => {
    const coords = e.geometry.coordinates;
    if (coords) setCenter([coords[0], coords[1]]);
  };

  const handleConfirm = async () => {
    // SỬA TẠI ĐÂY: Lấy trực tiếp từ state center đã update
    const data = JSON.stringify({
      lat: center[1].toString(),
      lng: center[0].toString(),
    });
    await SecureStore.setItemAsync(MAP_RESULT_KEY, data);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <MapLibreGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onRegionDidChange={onRegionDidChange}
      >
        <MapLibreGL.Camera zoomLevel={15} centerCoordinate={center} />
      </MapLibreGL.MapView>

      <SafeAreaView style={styles.topOverlay} pointerEvents="none">
        <View style={styles.coordBadge}>
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>LONGITUDE</Text>
            <Text style={styles.coordValue}>{center[0].toFixed(7)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.coordItem}>
            <Text style={styles.coordLabel}>LATITUDE</Text>
            <Text style={styles.coordValue}>{center[1].toFixed(7)}</Text>
          </View>
        </View>
      </SafeAreaView>

      <View pointerEvents="none" style={styles.pinWrapper}>
        <View style={styles.pinBody}><View style={styles.pinInner} /></View>
        <View style={styles.pinTip} />
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Xác nhận vị trí này</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ... Giữ nguyên styles của MapPicker ...
const styles = StyleSheet.create({
  topOverlay: { position: "absolute", top: 60, left: 0, right: 0, alignItems: "center", zIndex: 10 },
  coordBadge: { flexDirection: "row", backgroundColor: "rgba(15, 23, 42, 0.9)", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, alignItems: "center" },
  coordItem: { alignItems: "center", minWidth: 100 },
  coordLabel: { color: "#64748b", fontSize: 9, fontWeight: "800", marginBottom: 2 },
  coordValue: { color: "#34d399", fontSize: 16, fontWeight: "700", fontFamily: "monospace" },
  divider: { width: 1, height: 24, backgroundColor: "#334155", marginHorizontal: 10 },
  pinWrapper: { position: "absolute", top: "50%", left: "50%", alignItems: "center", justifyContent: "center", marginTop: -22, marginLeft: -1 },
  pinBody: { width: 34, height: 34, backgroundColor: "#EF4444", borderRadius: 17, borderWidth: 3, borderColor: "#fff", justifyContent: "center", alignItems: "center", zIndex: 2 },
  pinInner: { width: 8, height: 8, backgroundColor: "#fff", borderRadius: 4 },
  pinTip: { width: 4, height: 12, backgroundColor: "#EF4444", marginTop: -4, zIndex: 1 },
  pinShadow: { width: 12, height: 4, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 10, marginTop: 2 },
  bottomContainer: { position: "absolute", bottom: 40, left: 20, right: 20 },
  confirmBtn: { backgroundColor: "#2563EB", paddingVertical: 18, borderRadius: 20, alignItems: "center" },
  confirmText: { color: "#fff", fontWeight: "800", fontSize: 17 },
});