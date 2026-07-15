import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/constants/theme';
import type { QuestItemType } from '../types';

interface QuestItemProps {
  quest: QuestItemType;
}

const QuestItem = React.memo<QuestItemProps>(function QuestItem({ quest }) {
  const { colors, isDark } = useTheme();

  const progressPercent = useMemo(
    () => Math.min(100, Math.round((quest.progress / quest.target) * 100)),
    [quest.progress, quest.target]
  );

  return (
    <GlassCard style={styles.questCard} accentColor={quest.color}>
      <View style={styles.questMainRow}>
        <TouchableOpacity
          style={styles.questClickableRow}
          activeOpacity={0.7}
          onPress={quest.onPress}
        >
          {/* Icon bubble */}
          <View style={[styles.iconBubble, { backgroundColor: quest.color + '15' }]}>
            {quest.iconLib === 'Ionicons' ? (
              <Ionicons name={quest.icon as any} size={20} color={quest.color} />
            ) : (
              <MaterialCommunityIcons name={quest.icon as any} size={20} color={quest.color} />
            )}
          </View>

          {/* Progress Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.metaTextRow}>
              <Text style={[styles.questTitle, { color: colors.text.primary }]}>
                {quest.title}
              </Text>
              <Text style={[styles.questSub, { color: colors.muted }]}>
                {quest.subtext}
              </Text>
            </View>

            {/* Progress Bar */}
            <View
              style={[
                styles.progressBarBg,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: quest.color,
                    width: `${progressPercent}%`,
                  },
                ]}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Checkbox button to complete remaining */}
        <TouchableOpacity
          style={[styles.completeCheckbox, { borderColor: quest.color + '60' }]}
          activeOpacity={0.6}
          onPress={quest.onCompleteRemaining}
        >
          <Ionicons name="checkmark" size={16} color="transparent" />
        </TouchableOpacity>
      </View>

      {/* Action Quick Logs */}
      <View style={[styles.actionsRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
        {quest.actions.map((act, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderColor: colors.cardBorder,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => quest.onQuickLog(act.amount)}
          >
            <Text style={[styles.actionLabel, { color: colors.text.secondary }]}>
              {act.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </GlassCard>
  );
});

const styles = StyleSheet.create({
  questCard: {
    marginBottom: 12,
  },
  questMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questClickableRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    gap: 8,
  },
  metaTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  questSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  completeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default QuestItem;
