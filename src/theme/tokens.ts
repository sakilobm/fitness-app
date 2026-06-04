// ─────────────────────────────────────────────────────────────────────────────
//  FitForge — Theme Tokens
//  Same shape for both themes so `Colors.*` → `colors.*` is a drop-in swap.
// ─────────────────────────────────────────────────────────────────────────────

export interface ThemeColors {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  bg:           string;
  card:         string;
  cardBorder:   string;
  cardGlass:    string;
  ivory:        string;

  // ── Brand ────────────────────────────────────────────────────────────────
  lime:         string;   // primary accent
  amber:        string;
  danger:       string;
  muted:        string;
  white:        string;

  // ── Semantic overlays ────────────────────────────────────────────────────
  overlay:        string;
  amberOverlay:   string;
  dangerOverlay:  string;

  // ── Text ─────────────────────────────────────────────────────────────────
  text: {
    primary:   string;
    secondary: string;
    accent:    string;
    amber:     string;
    danger:    string;
  };

  // ── Chart colors (same in both themes — data should be consistent) ───────
  chart: {
    calories: string;
    protein:  string;
    carbs:    string;
    fibre:    string;
    water:    string;
  };

  // ── Icon bubble backgrounds ───────────────────────────────────────────────
  bubble: {
    green:  string;
    orange: string;
    blue:   string;
    pink:   string;
    purple: string;
    teal:   string;
  };

  // ── System ───────────────────────────────────────────────────────────────
  statusBar: 'light-content' | 'dark-content';
}

// ─────────────────────────────────────────────────────────────────────────────
//  Light Theme  (warm cream, white cards, deep teal accent)
// ─────────────────────────────────────────────────────────────────────────────
export const LightColors: ThemeColors = {
  bg:           '#EDEBE5',
  card:         '#FFFFFF',
  cardBorder:   'rgba(0,0,0,0.07)',
  cardGlass:    'rgba(255,255,255,0.80)',
  ivory:        '#F8F5F0',

  lime:         '#2E7D5E',
  amber:        '#F59E0B',
  danger:       '#EF4444',
  muted:        '#9CA3AF',
  white:        '#FFFFFF',

  overlay:       'rgba(46,125,94,0.10)',
  amberOverlay:  'rgba(245,158,11,0.10)',
  dangerOverlay: 'rgba(239,68,68,0.10)',

  text: {
    primary:   '#1C1C1E',
    secondary: '#6B7280',
    accent:    '#2E7D5E',
    amber:     '#F59E0B',
    danger:    '#EF4444',
  },

  chart: {
    calories: '#F59E0B',
    protein:  '#2E7D5E',
    carbs:    '#FB923C',
    fibre:    '#0EA5E9',
    water:    '#3B82F6',
  },

  bubble: {
    green:  '#D1FAE5',
    orange: '#FEF3C7',
    blue:   '#DBEAFE',
    pink:   '#FCE7F3',
    purple: '#EDE9FE',
    teal:   '#CCFBF1',
  },

  statusBar: 'dark-content',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Dark Theme  (deep forest-black, glass cards, brighter accent)
// ─────────────────────────────────────────────────────────────────────────────
export const DarkColors: ThemeColors = {
  bg:           '#0D0F0E',            // near-black with green tint
  card:         '#181C1A',            // dark card surface
  cardBorder:   'rgba(255,255,255,0.08)',
  cardGlass:    'rgba(255,255,255,0.06)',
  ivory:        '#131613',            // darkened ivory

  lime:         '#34D399',            // lighter green for dark bg readability
  amber:        '#FBBF24',
  danger:       '#F87171',
  muted:        '#6B7280',
  white:        '#FFFFFF',

  overlay:       'rgba(52,211,153,0.12)',
  amberOverlay:  'rgba(251,191,36,0.12)',
  dangerOverlay: 'rgba(248,113,113,0.12)',

  text: {
    primary:   '#F0F0F8',
    secondary: '#9CA3AF',
    accent:    '#34D399',
    amber:     '#FBBF24',
    danger:    '#F87171',
  },

  chart: {
    calories: '#FBBF24',
    protein:  '#34D399',
    carbs:    '#FB923C',
    fibre:    '#38BDF8',
    water:    '#60A5FA',
  },

  bubble: {
    green:  'rgba(52,211,153,0.15)',
    orange: 'rgba(251,191,36,0.15)',
    blue:   'rgba(96,165,250,0.15)',
    pink:   'rgba(244,114,182,0.15)',
    purple: 'rgba(167,139,250,0.15)',
    teal:   'rgba(45,212,191,0.15)',
  },

  statusBar: 'light-content',
};

/** Convenience — pick the right palette */
export const getColors = (isDark: boolean): ThemeColors =>
  isDark ? DarkColors : LightColors;
