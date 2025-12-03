import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from '../Skeleton';
const HomeSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Giả lập thanh Search */}
      <Skeleton height={50} borderRadius={10} style={{ marginBottom: 20 }} />

      {/* Giả lập danh mục (Categories) - Hình tròn */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ alignItems: 'center' }}>
            <Skeleton width={60} height={60} borderRadius={30} />
            <Skeleton width={40} height={10} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>

      {/* Giả lập danh sách dịch vụ dọc */}
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.cardItem}>
          <Skeleton width={80} height={80} borderRadius={8} />
          <View style={{ marginLeft: 15, flex: 1, justifyContent: 'center' }}>
            <Skeleton width="80%" height={16} style={{ marginBottom: 10 }} />
            <Skeleton width="40%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  cardItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
  }
});

export default HomeSkeleton;