import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AppIcon from '@/components/ui/AppIcon';
import { Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface Metric {
  lib: 'Ionicons' | 'MCI';
  icon: string;
  color: string;
  value: string;
  unit: string;
  label: string;
  onPress: () => void;
}

interface Props {
  metrics: Metric[];
}

export default React.memo(function ActivityStrip({ metrics }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.strip}>
      {metrics.map((m, i) => (
        <TouchableOpacity
          key={m.label}
          style={[
            styles.cell,
            i === 0 && styles.cellFirst,
            i === metrics.length - 1 && styles.cellLast,
            i > 0 && styles.cellBorder,
          ]}
          activeOpacity={0.75}
          onPress={m.onPress}
        >
          <View style={[styles.iconBubble, { backgroundColor: m.color + '18' }]}>
            <AppIcon lib={m.lib as any} name={m.icon as any} size={17} color={m.color} />
          </View>
          <Text style={[styles.value, { color: m.color }]}>{m.value}</Text>
          <Text style={styles.unit}>{m.unit}</Text>
          <Text style={styles.label}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  strip: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cell:       { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 3 },
  cellFirst:  { borderTopLeftRadius: Radius.lg },
  cellLast:   { borderTopRightRadius: Radius.lg },
  cellBorder: { borderLeftWidth: 1, borderLeftColor: colors.cardBorder },
  iconBubble: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  value:      { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  unit:       { fontSize: 11, fontWeight: '500', color: colors.muted },
  label:      { fontSize: 10, fontWeight: '600', color: colors.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
});
