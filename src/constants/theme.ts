export const Colors = {
  bg: '#0D1F0F',
  card: '#142016',
  cardBorder: 'rgba(255,255,255,0.06)',
  lime: '#A8FF3E',
  amber: '#FF9500',
  danger: '#FF4757',
  muted: '#8B9E8C',
  white: '#F5F5F0',
  ivory: '#EEF0E8',
  overlay: 'rgba(168,255,62,0.08)',
  amberOverlay: 'rgba(255,149,0,0.08)',
  dangerOverlay: 'rgba(255,71,87,0.08)',
  cardGlass: 'rgba(255,255,255,0.04)',
  text: {
    primary: '#F5F5F0',
    secondary: '#8B9E8C',
    accent: '#A8FF3E',
    amber: '#FF9500',
    danger: '#FF4757',
  },
  chart: {
    calories: '#FF4757',
    protein: '#A8FF3E',
    carbs: '#FF9500',
    fibre: '#4ECDC4',
    water: '#4DA6FF',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 100,
};

export const Typography = {
  hero: { fontSize: 48, fontWeight: '800' as const, letterSpacing: -1 },
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const },
  h3: { fontSize: 20, fontWeight: '600' as const },
  h4: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  captionBold: { fontSize: 12, fontWeight: '600' as const },
  micro: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const Shadows = {
  lime: {
    shadowColor: '#A8FF3E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  amber: {
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
