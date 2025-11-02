import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, shadow, spacing } from './theme';

export function AppHeader(props: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <LinearGradient colors={[colors.primary, colors.primaryAlt]} style={s.header}>
      <View style={s.headerRow}>
        <View style={{flex:1}}>
          <Text style={s.headerTitle}>{props.title}</Text>
          {props.subtitle ? <Text style={s.headerSubtitle}>{props.subtitle}</Text> : null}
        </View>
        {props.right}
      </View>
    </LinearGradient>
  );
}

export function Section(props: { title: string; rightText?: string; onRightPress?: () => void; style?: ViewStyle; children?: React.ReactNode }) {
  return (
    <View style={[{ paddingHorizontal: spacing(5), marginTop: spacing(6) }, props.style]}>
      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>{props.title}</Text>
        {props.rightText ? (
          <TouchableOpacity onPress={props.onRightPress}>
            <Text style={s.seeAll}>{props.rightText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {props.children}
    </View>
  );
}

export function CategoryPill(props: { emoji: string; name: string; active?: boolean }) {
  return (
    <View style={[s.catPill, props.active && s.catPillActive]}>
      <Text style={{ fontSize: 18, marginRight: 6 }}>{props.emoji}</Text>
      <Text style={[s.catText, props.active && { color: colors.primary }]}>{props.name}</Text>
    </View>
  );
}

export function ServiceCard(props: {
  image: string; name: string; category: string; price: string;
  rating: string; distance: string; right?: React.ReactNode; onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={props.onPress} style={[s.card, shadow.card]}>
      <Image source={{ uri: props.image }} style={s.cardImg} />
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={1}>{props.name}</Text>
        <Text style={s.cardCat} numberOfLines={1}>{props.category}</Text>
        <View style={s.rowBetween}>
          <Text style={s.price}>{props.price}</Text>
          <Text style={s.mute}>{props.rating} • {props.distance}</Text>
        </View>
      </View>
      {props.right}
    </TouchableOpacity>
  );
}

export function EmptyState(props: { icon?: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <View style={s.emptyWrap}>
      {props.icon}
      <Text style={s.emptyTitle}>{props.title}</Text>
      {props.subtitle ? <Text style={s.emptySub}>{props.subtitle}</Text> : null}
      {props.action}
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingTop: spacing(5), paddingBottom: spacing(6), paddingHorizontal: spacing(5), borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  headerRow:{ flexDirection:'row', alignItems:'flex-start' },
  headerTitle:{ fontSize:28, fontWeight:'700', color:'#FFF', marginBottom:4 },
  headerSubtitle:{ fontSize:16, color:'#E0E7FF' },

  sectionRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: spacing(4) },
  sectionTitle:{ fontSize:20, fontWeight:'700', color: colors.text },
  seeAll:{ fontSize:14, fontWeight:'600', color: colors.primary },

  catPill:{ flexDirection:'row', alignItems:'center', backgroundColor:'#FFF', borderRadius: radius.lg, borderWidth:1, borderColor: colors.border, paddingHorizontal: spacing(4), paddingVertical: spacing(3), marginRight: spacing(3) },
  catPillActive:{ backgroundColor:'#EEF2FF', borderColor: colors.primary },
  catText:{ fontSize:12, fontWeight:'600', color: colors.textMuted },

  card:{ backgroundColor: colors.card, borderRadius: radius.lg, overflow:'hidden', width:'48%', marginBottom: spacing(4) },
  cardImg:{ width:'100%', height:120 },
  cardBody:{ padding: spacing(3) },
  cardName:{ fontSize:16, fontWeight:'700', color: colors.text, marginBottom: 4 },
  cardCat:{ fontSize:12, color: colors.textMuted, marginBottom: 8 },
  rowBetween:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  price:{ fontSize:16, fontWeight:'700', color: colors.primary },
  mute:{ fontSize:12, color: colors.textMuted },

  emptyWrap:{ alignItems:'center', justifyContent:'center', paddingVertical: spacing(20), paddingHorizontal: spacing(10) },
  emptyTitle:{ fontSize:20, fontWeight:'700', color: colors.text, textAlign:'center', marginTop: spacing(4), marginBottom: spacing(2) },
  emptySub:{ fontSize:16, color: colors.textMuted, textAlign:'center' },
});
