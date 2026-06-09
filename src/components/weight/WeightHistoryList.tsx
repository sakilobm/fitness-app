import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { kgToLbs } from '@/utils/units';
import { MONTH_LABELS, TIME_OF_DAY_SHORT, TIME_OF_DAY_EMOJIS } from '@/constants/weight';
import type { WeightLog } from '@/types';

interface Props {
  logs: WeightLog[];
  isLbs: boolean;
  onDelete: (id: string) => void;
}

interface RowProps {
  log: WeightLog;
  isLbs: boolean;
  onDelete: (id: string) => void;
}

// Isolated row so the delete handler is stable via useCallback on `id`, not on index.
const WeightLogRow = React.memo(function WeightLogRow({ log, isLbs, onDelete }: RowProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const handleDelete = useCallback(() => onDelete(log.id), [onDelete, log.id]);

  const [, mo, dy] = log.date.split('-');
  const formattedDate = `${parseInt(dy, 10)} ${MONTH_LABELS[parseInt(mo, 10) - 1]}`;
  const displayWeight = (isLbs ? kgToLbs(log.weight) : log.weight).toFixed(1);
  const emoji = TIME_OF_DAY_EMOJIS[log.timeOfDay] ?? '';
  const shortLabel = TIME_OF_DAY_SHORT[log.timeOfDay] ?? log.timeOfDay;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View>
          <Text style={styles.timeTag}>{shortLabel}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>
      <View style={styles.center}>
        <Text style={styles.weight}>
          {displayWeight}
          <Text style={styles.unit}>{isLbs ? ' lbs' : ' kg'}</Text>
        </Text>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
        <Ionicons name="trash-outline" size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
});

export default React.memo(function WeightHistoryList({ logs, isLbs, onDelete }: Props) {
  const reversed = React.useMemo(() => [...logs].reverse(), [logs]);

  return (
    <>
      {reversed.map((log) => (
        <WeightLogRow key={log.id} log={log} isLbs={isLbs} onDelete={onDelete} />
      ))}
    </>
  );
});

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder, paddingVertical: 10, paddingHorizontal: 12 },
  left:      { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconWrap:  { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  emoji:     { fontSize: 14 },
  timeTag:   { fontSize: 11, fontWeight: '700', color: colors.text.primary },
  date:      { fontSize: 9, color: colors.muted, fontWeight: '500' },
  center:    { alignItems: 'flex-end', marginRight: 16 },
  weight:    { fontSize: 15, fontWeight: '800', color: colors.text.primary },
  unit:      { fontSize: 11, color: colors.muted, fontWeight: '500' },
  deleteBtn: { width: 30, height: 30, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger + '08' },
});
