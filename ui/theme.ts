// =======================
// 🎨 PREMIUM SOFT-GOLD THEME
// =======================

export const colors = {
  // 🎨 Vàng Soft-Gold premium
  primary: '#F7C948',      // vàng dịu – dùng cho header
  primaryDark: '#E8A200',  // vàng đậm – dùng cho button
  primaryLight: '#FAEAB1', // vàng pastel nhẹ – dùng cho nền badge/filter
  primaryAlt: '#F4D06F',   // vàng amber ấm – điểm nhấn

  // Nền & card
  bg: '#FFFDF7',           // nền cream sang trọng
  card: '#FFFFFF',         // nền card trắng

  // Text
  text: '#111827',
  textMuted: '#6B7280',

  // Border / Divider
  border: '#E5E7EB',

  // Trạng thái
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

// Bo góc
export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

// Shadow card
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

// Spacing helper
export const spacing = (n: number) => n * 4;
