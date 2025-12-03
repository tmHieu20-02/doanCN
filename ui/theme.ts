// =======================
// 🎨 SOFT ORANGE PREMIUM THEME (MATCH INDEX UI)
// =======================

export const colors = {
  // PRIMARY GRADIENT (header)
  primary: '#FFE7C2',     // vàng pastel nhạt – đầu gradient
  primaryAlt: '#FFD08A',  // vàng cam nhẹ – cuối gradient

  // PRIMARY ACTION
  primaryDark: '#F59E0B',   // vàng đậm – dùng cho text button "Xem tất cả", price
  primaryLight: '#FFF4D0',  // vàng kem – dùng cho filter button, badge rating

  // HEART ICON COLOR
  accent: '#F97316',        // màu cam của biểu tượng favorite

  // BACKGROUND
  bg: '#F8F8F8',            // màu nền index
  card: '#FFFFFF',          // background của service card + avatar background

  // TEXT
  text: '#111827',
  textMuted: '#6B7280',

  // BORDER
  border: '#E5E7EB',

  // STATES
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

// RADII
export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

// SHADOWS STATELY PREMIUM
export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

// SPACING HELPER
export const spacing = (n: number) => n * 4;
