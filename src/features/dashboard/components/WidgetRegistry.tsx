import React from 'react';
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
  trend: 'up' | 'down' | 'stable';
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
export function RadialChartWidget({ data, color }: { data: any; color: string }) {
  const radialData = data as RadialChartData;
  const percentage = Math.min(Math.round((radialData.value / radialData.target) * 100), 100);
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
        segments={radialData.segments}
      >
        <Text style={widgetStyles.radialPercent}>{percentage}%</Text>
        <Text style={widgetStyles.radialSub}>{radialData.centerSublabel}</Text>
      </DonutChart>
      <View style={widgetStyles.radialTexts}>
        <Text style={widgetStyles.radialBigVal}>{radialData.centerLabel}</Text>
        <Text style={widgetStyles.radialGoal}>Goal: {radialData.target}</Text>
      </View>
    </View>
  );
}

// 2. Linear Progress Widget
export function LinearProgressWidget({ data, color }: { data: any; color: string }) {
  const linearData = data as LinearProgressData;
  const progress = Math.min(linearData.value / linearData.target, 1);
  return (
    <View style={widgetStyles.linearContainer}>
      <View style={widgetStyles.linearHeader}>
        <Text style={widgetStyles.linearValue}>
          {linearData.value.toLocaleString()} <Text style={widgetStyles.linearUnit}>{linearData.unit}</Text>
        </Text>
        <Text style={widgetStyles.linearGoal}>/ {linearData.target.toLocaleString()}</Text>
      </View>
      <View style={widgetStyles.linearBarBg}>
        <View
          style={[
            widgetStyles.linearBarFill,
            { backgroundColor: linearData.progressColor, width: `${progress * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

// 3. Numeric Delta Widget
export function NumericDeltaWidget({ data, color }: { data: any; color: string }) {
  const deltaData = data as NumericDeltaData;
  const delta = deltaData.currentValue - deltaData.previousValue;
  const isPositive = delta > 0;
  const deltaText = isPositive ? `+${delta.toFixed(1)}` : `${delta.toFixed(1)}`;
  const trendIcon = deltaData.trend === 'up' ? 'arrow-up-outline' : deltaData.trend === 'down' ? 'arrow-down-outline' : 'remove-outline';

  return (
    <View style={widgetStyles.deltaContainer}>
      <Text style={[widgetStyles.deltaBigValue, { color }]}>
        {deltaData.currentValue.toFixed(1)} <Text style={widgetStyles.deltaUnit}>{deltaData.unit}</Text>
      </Text>
      <View style={widgetStyles.deltaRow}>
        <AppIcon lib="Ionicons" name={trendIcon} size={14} color={isPositive ? Colors.lime : Colors.danger} />
        <Text style={[widgetStyles.deltaText, { color: isPositive ? Colors.lime : Colors.danger }]}>
          {deltaText} {deltaData.unit} ({deltaData.trend})
        </Text>
      </View>
    </View>
  );
}

// 4. Compact Chip Widget
export function CompactChipWidget({ data, color }: { data: any; color: string }) {
  const chipData = data as CompactChipData;
  return (
    <View style={widgetStyles.chipContainer}>
      <Text style={widgetStyles.chipValue}>{chipData.value}</Text>
      <View style={[widgetStyles.chipStatusBox, { backgroundColor: chipData.statusColor + '18' }]}>
        <Text style={[widgetStyles.chipStatusText, { color: chipData.statusColor }]}>{chipData.status}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry Mapping & Container
// ─────────────────────────────────────────────────────────────────────────────

const REGISTRY: Record<WidgetType, React.FC<{ data: any; color: string }>> = {
  radial_chart: RadialChartWidget,
  linear_progress: LinearProgressWidget,
  numeric_delta: NumericDeltaWidget,
  compact_chip: CompactChipWidget,
};


/**
 * MetricCard is a highly reusable, type-safe widget container.
 * Generics enforce that config.data structure matches the layout type config.type.
 */
export function MetricCard<T extends WidgetType>({ config }: { config: WidgetConfig<T> }) {
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
