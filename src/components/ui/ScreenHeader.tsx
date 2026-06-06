import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconDef =
  | { lib: 'Ionicons'; name: IoniconName }
  | { lib: 'MCI'; name: MCIName };

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Accent color for icon bubble and decorative elements */
  accentColor?: string;
  /** Icon to show next to the title */
  icon?: IconDef;
  /** Show a back-button circle on the left (detail screens) */
  showBack?: boolean;
  onBack?: () => void;
  /** Icon name for an optional right action button */
  rightIcon?: IoniconName;
  onRightPress?: () => void;
  /** Completely custom right element */
  rightElement?: React.ReactNode;
}

function HeaderIcon({ icon, color, size }: { icon: IconDef; color: string; size: number }) {
  if (icon.lib === 'MCI') return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  return <Ionicons name={icon.name} size={size} color={color} />;
}

export default function ScreenHeader({
  title,
  subtitle,
  accentColor,
  icon,
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
  rightElement,
}: ScreenHeaderProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const activeAccent = accentColor || colors.lime;

  const RightSlot = () => {
    if (rightElement) return <>{rightElement}</>;
    if (rightIcon) {
      return (
        <TouchableOpacity style={styles.iconBtn} onPress={onRightPress} activeOpacity={0.75}>
          <Ionicons name={rightIcon} size={19} color={colors.text.primary} />
        </TouchableOpacity>
      );
    }
    return <View style={styles.iconBtn} pointerEvents="none" />;
  };

  if (showBack) {
    // ── Detail-screen layout (back button left, icon bubble + title, optional right) ──
    return (
      <View style={styles.detailContainer}>
        {/* Row with back button, title, and right slot */}
        <View style={styles.detailRow}>
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: activeAccent + '30' }]}
            onPress={onBack}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={20} color={activeAccent} />
          </TouchableOpacity>

          <View style={styles.detailTitleBlock}>
            {icon && (
              <View style={[styles.detailIconBubble, { backgroundColor: activeAccent }]}>
                <HeaderIcon icon={icon} color={colors.white} size={18} />
              </View>
            )}
            <View style={styles.detailTitleText}>
              {subtitle && <Text style={[styles.detailSubtitle, { color: activeAccent }]}>{subtitle}</Text>}
              <Text style={styles.detailTitle} numberOfLines={1}>{title}</Text>
            </View>
          </View>

          <View style={{ width: 40 }}>
            {(rightElement || rightIcon) && <RightSlot />}
          </View>
        </View>

        {/* Decorative accent bar */}
        <View style={[styles.accentBar, { backgroundColor: activeAccent + '18' }]}>
          <View style={[styles.accentBarFill, { backgroundColor: activeAccent, width: '35%' }]} />
        </View>
      </View>
    );
  }

  // ── Tab-screen layout (large title with icon bubble + accent underline) ──
  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabRow}>
        {/* Icon bubble */}
        {icon && (
          <View style={[styles.tabIconBubble, { backgroundColor: activeAccent, shadowColor: activeAccent }]}>
            <HeaderIcon icon={icon} color={colors.white} size={22} />
          </View>
        )}

        {/* Title block */}
        <View style={styles.tabTitleBlock}>
          {subtitle && <Text style={[styles.tabSubtitle, { color: activeAccent }]}>{subtitle}</Text>}
          <Text style={styles.tabTitle}>{title}</Text>
        </View>

        {/* Right slot */}
        {(rightElement || rightIcon) && <RightSlot />}
      </View>

      {/* Decorative accent bar */}
      <View style={[styles.accentBar, { backgroundColor: activeAccent + '12' }]}>
        <View style={[styles.accentBarFill, { backgroundColor: activeAccent, width: '25%' }]} />
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  // ── Detail (horizontal, back-button variant) ──────────────────────────────
  detailContainer: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitleBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitleText: {
    flex: 1,
    gap: 1,
  },
  detailSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },

  // ── Icon btn (shared) ─────────────────────────────────────────────────────
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },

  // ── Tab-screen (large title variant) ──────────────────────────────────────
  tabContainer: {
    gap: 10,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tabIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  tabTitleBlock: {
    flex: 1,
    gap: 2,
  },
  tabSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tabTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.8,
  },

  // ── Shared accent bar ─────────────────────────────────────────────────────
  accentBar: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  accentBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
