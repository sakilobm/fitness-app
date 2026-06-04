import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import AppIcon from '@/components/ui/AppIcon';
import { Typography, Spacing, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

export interface TimelineItem {
  time: string;
  label: string;
  kcal: number;
  lib: 'Ionicons' | 'MCI';
  icon: string;
  color: string;
}

const TimelineRow = React.memo(function TimelineRow({ item }: { item: TimelineItem }) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const isNegative = item.kcal < 0;
  return (
    <View style={styles.row}>
      <View style={[styles.iconBubble, { backgroundColor: item.color + '18' }]}>
        <AppIcon lib={item.lib} name={item.icon} size={16} color={item.color} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{item.label}</Text>
        <Text style={styles.rowTime}>{item.time}</Text>
      </View>
      {item.kcal !== 0 && (
        <Text style={[styles.rowKcal, { color: isNegative ? colors.lime : colors.amber }]}>
          {isNegative ? '' : '+'}{item.kcal} kcal
        </Text>
      )}
    </View>
  );
});

interface Props {
  items: TimelineItem[];
  scrollEnabled?: boolean;
}

export function TimelineFeed({ items, scrollEnabled = false }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const renderItem = useCallback(
    ({ item }: { item: TimelineItem }) => <TimelineRow item={item} />,
    []
  );

  const keyExtractor = useCallback(
    (item: TimelineItem) => `${item.time}-${item.label}`,
    []
  );

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No activity yet today</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, minHeight: 200 }}>
      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    ...Typography.captionBold,
    color: colors.text.primary,
  },
  rowTime: {
    ...Typography.micro,
    color: colors.text.secondary,
  },
  rowKcal: {
    ...Typography.captionBold,
  },
  empty: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.caption,
    color: colors.muted,
  },
});
