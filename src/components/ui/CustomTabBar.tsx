import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform,
  Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { TabName, ALL_TABS, TAB_LABELS, TAB_META } from '@/constants/tabs';
import { TabIcon } from './TabIcon';
import { useTabLayoutStore } from '@/store/tabLayoutStore';
import { CustomizeTabSheet } from './CustomizeTabSheet';

const { width: W } = Dimensions.get('window');
const BAR_H  = 64;
const PILL_H = 42;

// ── Single tab button ─────────────────────────────────────────────────────────
function TabButton({
  name, focused, onPress, tabWidth, colors,
}: { name: TabName; focused: boolean; onPress: () => void; tabWidth: number; colors: ThemeColors }) {
  const iconScale  = useSharedValue(focused ? 1.12 : 1);
  const pressScale = useSharedValue(1);
  const labelOp    = useSharedValue(focused ? 1 : 0);
  const labelH     = useSharedValue(focused ? 14 : 0);

  useEffect(() => {
    iconScale.value = withSpring(focused ? 1.12 : 1, { damping: 14, stiffness: 220 });
    labelOp.value   = withTiming(focused ? 1 : 0, { duration: 180 });
    labelH.value    = withTiming(focused ? 14 : 0, { duration: 180 });
  }, [focused]);

  const iconAnimStyle  = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const pressAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }));
  const labelWrapStyle = useAnimatedStyle(() => ({
    maxHeight: labelH.value,
    opacity:   labelOp.value,
  }));

  const iconColor = focused ? colors.lime : colors.muted;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { pressScale.value = withSpring(0.88, { damping: 10, stiffness: 400 }); }}
      onPressOut={() => { pressScale.value = withSpring(1,    { damping: 12, stiffness: 280 }); }}
      activeOpacity={1}
      style={[st.tabBtn, { width: tabWidth }]}
    >
      <Animated.View style={[st.tabInner, pressAnimStyle]}>
        <Animated.View style={[st.iconWrap, iconAnimStyle]}>
          <TabIcon name={name} focused={focused} color={iconColor} />
        </Animated.View>
        <Animated.View style={[{ overflow: 'hidden' }, labelWrapStyle]}>
          <Text style={[st.label, { color: iconColor }]}>
            {TAB_LABELS[name]}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── More button ───────────────────────────────────────────────────────────────
function MoreButton({
  active, onPress, tabWidth, colors,
}: { active: boolean; onPress: () => void; tabWidth: number; colors: ThemeColors }) {
  const pressScale = useSharedValue(1);
  const iconScale  = useSharedValue(active ? 1.12 : 1);
  const labelOp    = useSharedValue(active ? 1 : 0);
  const labelH     = useSharedValue(active ? 14 : 0);

  useEffect(() => {
    iconScale.value = withSpring(active ? 1.12 : 1, { damping: 14, stiffness: 220 });
    labelOp.value   = withTiming(active ? 1 : 0, { duration: 180 });
    labelH.value    = withTiming(active ? 14 : 0, { duration: 180 });
  }, [active]);

  const iconAnimStyle  = useAnimatedStyle(() => ({ transform: [{ scale: iconScale.value }] }));
  const pressAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }));
  const labelWrapStyle = useAnimatedStyle(() => ({
    maxHeight: labelH.value,
    opacity:   labelOp.value,
  }));

  const color = active ? colors.lime : colors.muted;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { pressScale.value = withSpring(0.88, { damping: 10, stiffness: 400 }); }}
      onPressOut={() => { pressScale.value = withSpring(1,    { damping: 12, stiffness: 280 }); }}
      activeOpacity={1}
      style={[st.tabBtn, { width: tabWidth }]}
    >
      <Animated.View style={[st.tabInner, pressAnimStyle]}>
        <Animated.View style={[st.iconWrap, iconAnimStyle]}>
          <Ionicons name={active ? 'grid' : 'grid-outline'} size={22} color={color} />
        </Animated.View>
        <Animated.View style={[{ overflow: 'hidden' }, labelWrapStyle]}>
          <Text style={[st.label, { color }]}>More</Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── More sheet ────────────────────────────────────────────────────────────────
const SHEET_H = 280;

function MoreSheet({
  visible, onClose, onNavigate, onCustomize, currentTab, insets, colors,
}: {
  visible:     boolean;
  onClose:     () => void;
  onNavigate:  (name: TabName) => void;
  onCustomize: () => void;
  currentTab:  TabName;
  insets:      { bottom: number };
  colors:      ThemeColors;
}) {
  const primaryTabs  = useTabLayoutStore(s => s.primaryTabs);
  const secondaryTabs = ALL_TABS.filter(t => !primaryTabs.includes(t));

  const [rendered, setRendered] = useState(visible);
  const translateY  = useSharedValue(visible ? 0 : SHEET_H);
  const backdropOp  = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      translateY.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.9 });
      backdropOp.value = withTiming(1, { duration: 220 });
    } else {
      backdropOp.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(SHEET_H, { damping: 22, stiffness: 260, mass: 0.9 });
      const t = setTimeout(() => setRendered(false), 380);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const bgStyle    = useAnimatedStyle(() => ({ opacity: backdropOp.value }));

  if (!rendered) return null;

  const TAB_BAR_BOTTOM = Math.max(insets.bottom, 6) + 10 + BAR_H + 8;

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[st.backdrop, bgStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          st.sheet,
          {
            backgroundColor: colors.card,
            borderColor:      colors.cardBorder,
            bottom: TAB_BAR_BOTTOM,
          },
          sheetStyle,
        ]}
      >
        {/* Handle + header row */}
        <View style={[st.handle, { backgroundColor: colors.muted + '50' }]} />
        <View style={st.sheetHeader}>
          <Text style={[st.sheetTitle, { color: colors.muted }]}>MORE</Text>
          <TouchableOpacity onPress={onCustomize} style={st.editBtn} activeOpacity={0.75}>
            <Ionicons name="settings-outline" size={13} color={colors.muted} />
            <Text style={[st.editTxt, { color: colors.muted }]}>Customize</Text>
          </TouchableOpacity>
        </View>

        {/* 2×2 Grid */}
        <View style={st.grid}>
          {secondaryTabs.map(name => {
            const meta   = TAB_META[name];
            const active = currentTab === name;
            return (
              <TouchableOpacity
                key={name}
                onPress={() => { onNavigate(name); onClose(); }}
                activeOpacity={0.78}
                style={[
                  st.gridCard,
                  {
                    backgroundColor: active ? meta.color + '15' : colors.bg,
                    borderColor:     active ? meta.color        : colors.cardBorder,
                  },
                ]}
              >
                <View style={[st.iconBubble, { backgroundColor: meta.color + '20' }]}>
                  <TabIcon name={name} focused={active} size={20} color={meta.color} />
                </View>
                <View style={st.cardText}>
                  <Text style={[st.cardLabel, { color: active ? meta.color : colors.text.primary }]}>
                    {TAB_LABELS[name]}
                  </Text>
                  <Text style={[st.cardDesc, { color: colors.muted }]} numberOfLines={1}>
                    {meta.desc}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}

// ── Main CustomTabBar ─────────────────────────────────────────────────────────
type TabBarProps = {
  state:      { index: number; routes: { key: string; name: string }[] };
  navigation: any;
};

export default function CustomTabBar({ state, navigation }: TabBarProps) {
  const { colors }    = useTheme();
  const insets        = useSafeAreaInsets();
  const [moreOpen,       setMoreOpen]       = useState(false);
  const [customizeOpen,  setCustomizeOpen]  = useState(false);

  const primaryTabs  = useTabLayoutStore(s => s.primaryTabs);
  const setPrimary   = useTabLayoutStore(s => s.setPrimaryTabs);

  const barWidth  = W - 32;
  const tabWidth  = barWidth / 5;   // always 5 slots: 4 primary + More
  const PILL_W    = tabWidth - 16;

  const currentRouteName = (state.routes[state.index]?.name ?? 'index') as TabName;
  const secondaryTabs    = ALL_TABS.filter(t => !primaryTabs.includes(t));
  const isPrimary        = primaryTabs.includes(currentRouteName);
  const isSecondary      = secondaryTabs.includes(currentRouteName);

  const visibleIndex = isPrimary ? primaryTabs.indexOf(currentRouteName) : 4;

  const pillX = useSharedValue(visibleIndex * tabWidth + (tabWidth - PILL_W) / 2);

  useEffect(() => {
    pillX.value = withSpring(
      visibleIndex * tabWidth + (tabWidth - PILL_W) / 2,
      { damping: 22, stiffness: 180, mass: 0.8 },
    );
  }, [visibleIndex, tabWidth]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  function navigate(routeName: string) {
    const route = state.routes.find(r => r.name === routeName);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(routeName);
  }

  function handleCustomize() {
    setMoreOpen(false);
    // slight delay so MoreSheet can close first
    setTimeout(() => setCustomizeOpen(true), 120);
  }

  return (
    <>
      <View style={[st.wrapper, { bottom: Math.max(insets.bottom, 6) + 10 }]}>
        {Platform.OS === 'ios' && (
          <View style={[st.outerGlow, { shadowColor: colors.lime }]} />
        )}

        <View style={[
          st.glass,
          {
            backgroundColor: colors.card + 'F4',
            borderColor:     colors.cardBorder,
            shadowColor:     colors.text.primary,
          },
        ]}>
          <View style={st.topShine} />
          <Animated.View style={[
            st.pill,
            {
              top:             (BAR_H - PILL_H) / 2,
              width:           PILL_W,
              backgroundColor: colors.overlay,
              borderColor:     colors.lime + '35',
            },
            pillStyle,
          ]} />

          <View style={st.row}>
            {primaryTabs.map(name => {
              const route = state.routes.find(r => r.name === name);
              if (!route) return null;
              return (
                <TabButton
                  key={name}
                  name={name}
                  focused={currentRouteName === name}
                  tabWidth={tabWidth}
                  colors={colors}
                  onPress={() => navigate(name)}
                />
              );
            })}

            <MoreButton
              active={isSecondary || moreOpen}
              onPress={() => setMoreOpen(v => !v)}
              tabWidth={tabWidth}
              colors={colors}
            />
          </View>
        </View>
      </View>

      <MoreSheet
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        onNavigate={name => { setMoreOpen(false); navigate(name); }}
        onCustomize={handleCustomize}
        currentTab={currentRouteName}
        insets={insets}
        colors={colors}
      />

      <CustomizeTabSheet
        visible={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        primaryTabs={primaryTabs}
        onSave={setPrimary}
        colors={colors}
      />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16, right: 16,
  },
  outerGlow: {
    position: 'absolute',
    top: 6, left: 10, right: 10, bottom: -6,
    borderRadius: Radius.xl,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 0,
  },
  glass: {
    height: BAR_H,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  topShine: {
    position: 'absolute',
    top: 0, left: 20, right: 20, height: 1,
    backgroundColor: 'rgba(46,125,94,0.25)',
    borderRadius: 1,
  },
  pill: {
    position: 'absolute',
    height: PILL_H,
    borderRadius: 18,
    borderWidth: 1,
  },
  row: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_H,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 2,
  },

  // ── More sheet ─────────────────────────────────────────────────────────────
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  sheet: {
    position: 'absolute',
    left: 16, right: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 16,
    elevation: 24,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 10, fontWeight: '800', letterSpacing: 1.2,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  editTxt: { fontSize: 11, fontWeight: '600' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  iconBubble: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cardText:  { flex: 1 },
  cardLabel: { fontSize: 13, fontWeight: '800' },
  cardDesc:  { fontSize: 10, marginTop: 2 },
});
