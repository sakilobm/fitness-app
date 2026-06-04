// ─────────────────────────────────────────────────────────────────────────────
//  FitForge — Light Theme
//  Warm cream backgrounds · white cards · deep forest-teal accents
// ─────────────────────────────────────────────────────────────────────────────

import { LightColors } from '@/theme/tokens';

export const Colors = LightColors;
export { useTheme, ThemeProvider } from '@/theme';

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
