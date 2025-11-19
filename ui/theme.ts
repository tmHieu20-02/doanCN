// ui/theme.ts

export const colors = {
  // Vàng chủ đạo kiểu Chợ Tốt
  primary: '#FFCC00',      // màu chính (button, icon active, tabbar)
  primaryDark: '#F4B000',  // đậm hơn chút, dùng cho gradient hoặc border
  primaryLight: '#FFF3C4', // nền vàng nhạt (filter, badge…)
  primaryAlt: '#FFA000',   // vàng cam, dùng cho text nổi bật, gradient 2

  // Nền & card
  bg: '#FFFDF5',           // nền tổng thể app
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

// Shadow dùng chung cho card
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Spacing helper
export const spacing = (n: number) => n * 4;
