import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DonutChart from '@/components/ui/DonutChart';
import GlassCard from '@/components/ui/GlassCard';
import AppIcon from '@/components/ui/AppIcon';
import { Colors } from '@/constants/theme';

export type WidgetType = 'radial_chart' | 'linear_progress' | 'numeric_delta' | 'compact_chip';

// Define strict data types for each visualization widget type
export interface RadialChartData {
  value: number; // Current value
  target: number; // Goal value
  segments: { value: number; color: string }[];
  centerLabel: string;
  centerSublabel: string;
}

export interface LinearProgressData {
  value: number;
  target: number;
  progressColor: string;
  unit: string;
}

export interface NumericDeltaData {
  currentValue: number;
  previousValue: number;
  unit: string;
  trend: 'losing' | 'gaining' | 'stable';
}

export interface CompactChipData {
  value: string;
  status: string;
  statusColor: string;
}

// Map the WidgetType to its specific TypeScript data shape
export type WidgetDataMap = {
  radial_chart: RadialChartData;
  linear_progress: LinearProgressData;
  numeric_delta: NumericDeltaData;
  compact_chip: CompactChipData;
};

// Generic widget config structure
export interface WidgetConfig<T extends WidgetType> {
  id: string;
  type: T;
  title: string;
  icon: { lib: 'Ionicons' | 'MCI'; name: string };
  color: string;
  data: WidgetDataMap[T];
  onPress?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget Visualizations
// ─────────────────────────────────────────────────────────────────────────────

// 1. Radial Chart Widget
export const RadialChartWidget = React.memo(function RadialChartWidget(
  { data, color: _color }: { data: RadialChartData; color: string }
) {
  const percentage = useMemo(
    () => Math.min(Math.round((data.value / data.target) * 100), 100),
    [data.value, data.target]
  );
  return (
    <View style={widgetStyles.radialContainer}>
      <DonutChart
        size={100}
        strokeWidth={10}
        gapSize={6}
        rounded
        trackColor="rgba(0,0,0,0.06)"
        innerFill="#F0EDE8"
        showInnerDots
        segments={data.segments}
      >
        <Text style={widgetStyles.radialPercent}>{percentage}%</Text>
        <Text style={widgetStyles.radialSub}>{data.centerSublabel}</Text>
      </DonutChart>
      <View style={widgetStyles.radialTexts}>
        <Text style={widgetStyles.radialBigVal}>{data.centerLabel}</Text>
        <Text style={widgetStyles.radialGoal}>Goal: {data.target}</Text>
      </View>
    </View>
  );
});

// 2. Linear Progress Widget
export const LinearProgressWidget = React.memo(function LinearProgressWidget(
  { data, color: _color }: { data: LinearProgressData; color: string }
) {
  const progress = useMemo(
    () => Math.min(data.value / data.target, 1),
    [data.value, data.target]
  );
  return (
    <View style={widgetStyles.linearContainer}>
      <View style={widgetStyles.linearHeader}>
        <Text style={widgetStyles.linearValue}>
          {data.value.toLocaleString()} <Text style={widgetStyles.linearUnit}>{data.unit}</Text>
        </Text>
        <Text style={widgetStyles.linearGoal}>/ {data.target.toLocaleString()}</Text>
      </View>
      <View style={widgetStyles.linearBarBg}>
        <View
          style={[
            widgetStyles.linearBarFill,
            { backgroundColor: data.progressColor, width: `${progress * 100}%` },
          ]}
        />
      </View>
    </View>
  );
});

// 3. Numeric Delta Widget
export const NumericDeltaWidget = React.memo(function NumericDeltaWidget(
  { data, color }: { data: NumericDeltaData; color: string }
) {
  const { isPositive, deltaText, trendIcon } = useMemo(() => {
    const d = data.currentValue - data.previousValue;
    const pos = d > 0;
    return {
      isPositive: pos,
      deltaText: pos ? `+${d.toFixed(1)}` : `${d.toFixed(1)}`,
      trendIcon: data.trend === 'gaining' ? 'arrow-up-outline'
               : data.trend === 'losing'  ? 'arrow-down-outline'
               : 'remove-outline',
    };
  }, [data.currentValue, data.previousValue, data.trend]);

  return (
    <View style={widgetStyles.deltaContainer}>
      <Text style={[widgetStyles.deltaBigValue, { color }]}>
        {data.currentValue.toFixed(1)} <Text style={widgetStyles.deltaUnit}>{data.unit}</Text>
      </Text>
      <View style={widgetStyles.deltaRow}>
        <AppIcon lib="Ionicons" name={trendIcon} size={14} color={isPositive ? Colors.lime : Colors.danger} />
        <Text style={[widgetStyles.deltaText, { color: isPositive ? Colors.lime : Colors.danger }]}>
          {deltaText} {data.unit} ({data.trend})
        </Text>
      </View>
    </View>
  );
});

// 4. Compact Chip Widget
export const CompactChipWidget = React.memo(function CompactChipWidget(
  { data, color: _color }: { data: CompactChipData; color: string }
) {
  return (
    <View style={widgetStyles.chipContainer}>
      <Text style={widgetStyles.chipValue}>{data.value}</Text>
      <View style={[widgetStyles.chipStatusBox, { backgroundColor: data.statusColor + '18' }]}>
        <Text style={[widgetStyles.chipStatusText, { color: data.statusColor }]}>{data.status}</Text>
      </View>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Registry Mapping & Container
// ─────────────────────────────────────────────────────────────────────────────

const REGISTRY: Record<WidgetType, React.FC<{ data: any; color: string }>> = {
  radial_chart: RadialChartWidget,
  linear_progress: LinearProgressWidget,
  numeric_delta: NumericDeltaWidget,
  compact_chip: CompactChipWidget,
};


function MetricCardInner<T extends WidgetType>({ config }: { config: WidgetConfig<T> }) {
  const WidgetComponent = REGISTRY[config.type] as React.FC<any>;
  if (!WidgetComponent) return null;

  return (
    <TouchableOpacity
      activeOpacity={config.onPress ? 0.85 : 1}
      onPress={config.onPress}
      style={widgetStyles.cardWrapper}
    >
      <GlassCard style={widgetStyles.glassShell}>
        <View style={widgetStyles.cardHeader}>
          <View style={[widgetStyles.iconContainer, { backgroundColor: config.color + '18' }]}>
            <AppIcon lib={config.icon.lib} name={config.icon.name} size={18} color={config.color} />
          </View>
          <Text style={widgetStyles.cardTitle}>{config.title}</Text>
          {config.onPress && (
            <AppIcon lib="Ionicons" name="chevron-forward-outline" size={14} color={Colors.muted} />
          )}
        </View>
        <View style={widgetStyles.cardBody}>
          <WidgetComponent data={config.data as any} color={config.color} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

export const MetricCard = React.memo(MetricCardInner, (prev, next) =>
  prev.config.id === next.config.id &&
  JSON.stringify(prev.config.data) === JSON.stringify(next.config.data) &&
  prev.config.color === next.config.color
) as typeof MetricCardInner;

const widgetStyles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    minWidth: 150,
    margin: 5,
  },
  glassShell: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: Colors.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  // Radial styles
  radialContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  radialPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  radialSub: {
    fontSize: 9,
    color: Colors.muted,
    fontWeight: '600',
  },
  radialTexts: {
    alignItems: 'center',
    gap: 2,
  },
  radialBigVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  radialGoal: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: '500',
  },
  // Linear styles
  linearContainer: {
    gap: 6,
    paddingVertical: 2,
  },
  linearHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  linearValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  linearUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.muted,
  },
  linearGoal: {
    fontSize: 11,
    color: Colors.muted,
    fontWeight: '500',
  },
  linearBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  linearBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Delta styles
  deltaContainer: {
    gap: 4,
    paddingVertical: 2,
  },
  deltaBigValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  deltaUnit: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deltaText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Chip styles
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  chipValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  chipStatusBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
