import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Show a back-button circle on the left (detail screens) */
  showBack?: boolean;
  onBack?: () => void;
  /** Icon name for an optional right action button */
  rightIcon?: IoniconName;
  onRightPress?: () => void;
  /** Completely custom right element */
  rightElement?: React.ReactNode;
}

export default function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
  rightElement,
}: ScreenHeaderProps) {

  const RightSlot = () => {
    if (rightElement) return <>{rightElement}</>;
    if (rightIcon) {
      return (
        <TouchableOpacity style={styles.iconBtn} onPress={onRightPress} activeOpacity={0.75}>
          <Ionicons name={rightIcon} size={19} color={Colors.text.primary} />
        </TouchableOpacity>
      );
    }
    return <View style={styles.iconBtn} pointerEvents="none" />;
  };

  if (showBack) {
    // ── Detail-screen layout (back button left, title+subtitle left, optional right) ──
    return (
      <View style={styles.row}>
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color={Colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.centerBlock}>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          <Text style={styles.titleDetail} numberOfLines={1}>{title}</Text>
        </View>

        <RightSlot />
      </View>
    );
  }

  // ── Tab-screen layout (large left title, subtitle below, optional right icon) ──
  return (
    <View style={styles.col}>
      <View style={styles.colTop}>
        <Text style={styles.titleTab}>{title}</Text>
        <RightSlot />
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Detail (horizontal) ────────────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },

  centerBlock: {
    flex: 1,
    justifyContent: 'center',
  },

  titleDetail: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },

  // ── Tab (vertical stack) ───────────────────────────────────────────────────
  col: {
    gap: 4,
  },
  colTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleTab: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.8,
    flex: 1,
  },

  // ── Shared subtitle ────────────────────────────────────────────────────────
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.1,
  },
});
