// ─────────────────────────────────────────────────────────────────────────────
//  FitForge — Light Theme
//  Warm cream backgrounds · white cards · deep forest-teal accents
// ─────────────────────────────────────────────────────────────────────────────

export const Colors = {
  bg: '#EDEBE5',             // warm cream — main app background
  card: '#FFFFFF',            // pure white card surface
  cardBorder: 'rgba(0,0,0,0.07)',
  cardGlass: 'rgba(255,255,255,0.80)',

  lime: '#2E7D5E',            // deep forest teal (primary accent)
  amber: '#F59E0B',           // warm amber
  danger: '#EF4444',          // red
  muted: '#9CA3AF',           // medium gray
  white: '#FFFFFF',
  ivory: '#F8F5F0',

  overlay: 'rgba(46,125,94,0.10)',
  amberOverlay: 'rgba(245,158,11,0.10)',
  dangerOverlay: 'rgba(239,68,68,0.10)',

  text: {
    primary: '#1C1C1E',
    secondary: '#6B7280',
    accent: '#2E7D5E',
    amber: '#F59E0B',
    danger: '#EF4444',
  },

  chart: {
    calories: '#F59E0B',
    protein: '#2E7D5E',
    carbs: '#FB923C',
    fibre: '#0EA5E9',
    water: '#3B82F6',
  },

  // Pastel icon-bubble backgrounds (used for exercise / metric icon circles)
  bubble: {
    green:  '#D1FAE5',
    orange: '#FEF3C7',
    blue:   '#DBEAFE',
    pink:   '#FCE7F3',
    purple: '#EDE9FE',
    teal:   '#CCFBF1',
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
  hero:        { fontSize: 48, fontWeight: '800' as const, letterSpacing: -1.5 },
  h1:          { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.8 },
  h2:          { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3:          { fontSize: 20, fontWeight: '700' as const },
  h4:          { fontSize: 17, fontWeight: '600' as const },
  body:        { fontSize: 15, fontWeight: '400' as const },
  bodyBold:    { fontSize: 15, fontWeight: '600' as const },
  caption:     { fontSize: 12, fontWeight: '400' as const },
  captionBold: { fontSize: 12, fontWeight: '600' as const },
  micro:       { fontSize: 10, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const Shadows = {
  lime: {
    shadowColor: '#2E7D5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  amber: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 4,
  },
};
