import { HeartRateContext, BPPosition, GlucoseContext, GlucoseUnit } from '@/types';

// ── Vital type identifier ─────────────────────────────────────────────────────
export type VitalType = 'heartRate' | 'bloodPressure' | 'bloodGlucose' | 'oxygen';

// ── Clinical category definitions ─────────────────────────────────────────────

export const HR_CATEGORIES = [
  { label: 'Bradycardia', max: 59,  color: '#38BDF8', bg: '#38BDF820' },
  { label: 'Normal',      max: 100, color: '#34D399', bg: '#34D39920' },
  { label: 'Elevated',    max: 150, color: '#FBBF24', bg: '#FBBF2420' },
  { label: 'Tachycardia', max: 999, color: '#F87171', bg: '#F8717120' },
] as const;

// AHA 2017 guidelines
export const BP_CATEGORIES = [
  { label: 'Normal',              maxSys: 119, maxDia: 79,  color: '#34D399', bg: '#34D39920' },
  { label: 'Elevated',            maxSys: 129, maxDia: 79,  color: '#FBBF24', bg: '#FBBF2420' },
  { label: 'High BP Stage 1',     maxSys: 139, maxDia: 89,  color: '#FB923C', bg: '#FB923C20' },
  { label: 'High BP Stage 2',     maxSys: 179, maxDia: 119, color: '#F87171', bg: '#F8717120' },
  { label: 'Hypertensive Crisis', maxSys: 999, maxDia: 999, color: '#EF4444', bg: '#EF444420' },
] as const;

// ADA guidelines for fasting glucose (mg/dL)
export const GLUCOSE_CATEGORIES = [
  { label: 'Hypoglycemic', max: 69,  color: '#38BDF8', bg: '#38BDF820' },
  { label: 'Normal',       max: 99,  color: '#34D399', bg: '#34D39920' },
  { label: 'Pre-Diabetic', max: 125, color: '#FBBF24', bg: '#FBBF2420' },
  { label: 'Diabetic',     max: 999, color: '#F87171', bg: '#F8717120' },
] as const;

export const SPO2_CATEGORIES = [
  { label: 'Critical',  max: 89,  color: '#EF4444', bg: '#EF444420' },
  { label: 'Low',       max: 94,  color: '#FB923C', bg: '#FB923C20' },
  { label: 'Normal',    max: 100, color: '#34D399', bg: '#34D39920' },
] as const;

// ── Category helpers ──────────────────────────────────────────────────────────

export function hrCategory(bpm: number) {
  return HR_CATEGORIES.find(c => bpm <= c.max) ?? HR_CATEGORIES[HR_CATEGORIES.length - 1];
}

export function bpCategory(sys: number, dia: number) {
  return BP_CATEGORIES.find(c => sys <= c.maxSys && dia <= c.maxDia)
    ?? BP_CATEGORIES[BP_CATEGORIES.length - 1];
}

export function glucoseCategory(mgdl: number) {
  return GLUCOSE_CATEGORIES.find(c => mgdl <= c.max) ?? GLUCOSE_CATEGORIES[GLUCOSE_CATEGORIES.length - 1];
}

export function spo2Category(spo2: number) {
  return SPO2_CATEGORIES.find(c => spo2 <= c.max) ?? SPO2_CATEGORIES[SPO2_CATEGORIES.length - 1];
}

// ── Unit conversion ───────────────────────────────────────────────────────────

export function mgdlToMmol(mgdl: number): number {
  return parseFloat((mgdl / 18.0182).toFixed(1));
}
export function mmolToMgdl(mmol: number): number {
  return Math.round(mmol * 18.0182);
}
export function formatGlucose(mgdl: number, unit: GlucoseUnit): string {
  return unit === 'mmol/L' ? `${mgdlToMmol(mgdl)}` : `${mgdl}`;
}
export function formatBP(sys: number, dia: number): string {
  return `${sys}/${dia}`;
}

// ── Context / position labels ─────────────────────────────────────────────────

export const HR_CONTEXTS: { key: HeartRateContext; label: string }[] = [
  { key: 'resting',      label: 'Resting'     },
  { key: 'active',       label: 'Active'      },
  { key: 'post-workout', label: 'Post-Workout'},
  { key: 'sleeping',     label: 'Sleeping'    },
];

export const BP_POSITIONS: { key: BPPosition; label: string }[] = [
  { key: 'sitting',  label: 'Sitting'  },
  { key: 'standing', label: 'Standing' },
  { key: 'lying',    label: 'Lying'    },
];

export const GLUCOSE_CONTEXTS: { key: GlucoseContext; label: string }[] = [
  { key: 'fasting',   label: 'Fasting'   },
  { key: 'pre-meal',  label: 'Pre-Meal'  },
  { key: 'post-meal', label: 'Post-Meal' },
  { key: 'bedtime',   label: 'Bedtime'   },
  { key: 'random',    label: 'Random'    },
];

// ── Per-type UI config ────────────────────────────────────────────────────────

export const VITAL_CONFIG = {
  heartRate: {
    label:       'Heart Rate',
    unit:        'bpm',
    icon:        'heart' as const,
    color:       '#F87171',
    chartMin:    40,
    chartMax:    180,
    refLow:      60,
    refHigh:     100,
    description: 'Normal resting: 60–100 bpm',
  },
  bloodPressure: {
    label:       'Blood Pressure',
    unit:        'mmHg',
    icon:        'fitness' as const,
    color:       '#A78BFA',
    chartMin:    60,
    chartMax:    200,
    refLow:      80,
    refHigh:     120,
    description: 'Optimal: <120/80 mmHg',
  },
  bloodGlucose: {
    label:       'Blood Glucose',
    unit:        'mg/dL',
    icon:        'water-outline' as const,
    color:       '#FBBF24',
    chartMin:    60,
    chartMax:    300,
    refLow:      70,
    refHigh:     99,
    description: 'Normal fasting: 70–99 mg/dL',
  },
  oxygen: {
    label:       'SpO2',
    unit:        '%',
    icon:        'pulse' as const,
    color:       '#38BDF8',
    chartMin:    88,
    chartMax:    100,
    refLow:      95,
    refHigh:     100,
    description: 'Normal: 95–100%',
  },
} as const;

// ── Time helpers ──────────────────────────────────────────────────────────────

export function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export function timeAgoLabel(date: string, time: string): string {
  const then = new Date(`${date}T${time}`);
  const diff = Date.now() - then.getTime();
  const min  = Math.round(diff / 60000);
  if (min < 1)   return 'just now';
  if (min < 60)  return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h  < 24)   return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

// ── SVG chart utilities ───────────────────────────────────────────────────────

export interface ChartPt { x: number; y: number; }

export function makeChartPoints(
  values:  number[],
  w:       number,
  h:       number,
  padX:    number,
  padY:    number,
  minVal:  number,
  maxVal:  number,
): ChartPt[] {
  const range = maxVal - minVal || 1;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  return values.map((v, i) => ({
    x: padX + (values.length > 1 ? (i / (values.length - 1)) * innerW : innerW / 2),
    y: padY + (1 - (v - minVal) / range) * innerH,
  }));
}

export function smoothLinePath(pts: ChartPt[]): string {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const cpx = ((p0.x + p1.x) / 2).toFixed(1);
    d += ` C ${cpx},${p0.y.toFixed(1)} ${cpx},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }
  return d;
}

export function areaPath(pts: ChartPt[], h: number, padY: number): string {
  if (pts.length < 2) return '';
  const bottom = h - padY;
  const line = smoothLinePath(pts);
  return `${line} L ${pts[pts.length - 1].x.toFixed(1)},${bottom} L ${pts[0].x.toFixed(1)},${bottom} Z`;
}

// ── Range bar config ──────────────────────────────────────────────────────────

export interface RangeZone {
  label: string;
  color: string;
  min:   number;
  max:   number;
}

export function getHRRangeZones(): RangeZone[] {
  return [
    { label: 'Bradycardia', color: '#38BDF8', min: 40,  max: 59  },
    { label: 'Normal',      color: '#34D399', min: 60,  max: 100 },
    { label: 'Elevated',    color: '#FBBF24', min: 101, max: 150 },
    { label: 'Tachy',       color: '#F87171', min: 151, max: 180 },
  ];
}

export function getBPRangeZones(): RangeZone[] {
  return [
    { label: 'Normal',   color: '#34D399', min: 90,  max: 119 },
    { label: 'Elevated', color: '#FBBF24', min: 120, max: 129 },
    { label: 'Stage 1',  color: '#FB923C', min: 130, max: 139 },
    { label: 'Stage 2',  color: '#F87171', min: 140, max: 179 },
    { label: 'Crisis',   color: '#EF4444', min: 180, max: 220 },
  ];
}

export function getGlucoseRangeZones(): RangeZone[] {
  return [
    { label: 'Low',         color: '#38BDF8', min: 60,  max: 69  },
    { label: 'Normal',      color: '#34D399', min: 70,  max: 99  },
    { label: 'Pre-Diabetic',color: '#FBBF24', min: 100, max: 125 },
    { label: 'Diabetic',    color: '#F87171', min: 126, max: 280 },
  ];
}

export function getSpO2RangeZones(): RangeZone[] {
  return [
    { label: 'Critical', color: '#EF4444', min: 80,  max: 89  },
    { label: 'Low',      color: '#FB923C', min: 90,  max: 94  },
    { label: 'Normal',   color: '#34D399', min: 95,  max: 100 },
  ];
}
