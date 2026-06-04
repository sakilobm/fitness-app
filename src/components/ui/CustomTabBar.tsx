import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Typography, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const { width: W } = Dimensions.get('window');
const BAR_H = 64;
const PILL_W = 54;
const PILL_H = 42;

type TabName = 'index' | 'weight' | 'nutrition' | 'reminders' | 'profile';

const TAB_LABELS: Record<TabName, string> = {
  index: 'Home',
  weight: 'Weight',
  nutrition: 'Food',
  reminders: 'Remind',
  profile: 'Profile',
};

function TabIcon({ name, focused, size = 22 }: { name: TabName; focused: boolean; size?: number }) {
  const { colors } = useTheme();
  const color = focused ? colors.lime : colors.muted;
  switch (name) {
    case 'index':
      return <Ionicons name={(focused ? 'home' : 'home-outline') as IoniconName} size={size} color={color} />;
    case 'weight':
      return <MaterialCommunityIcons name="scale-bathroom" size={size} color={color} />;
    case 'nutrition':
      return <MaterialCommunityIcons name={(focused ? 'food-apple' : 'food-apple-outline') as MCIName} size={size} color={color} />;
    case 'reminders':
      return <Ionicons name={(focused ? 'notifications' : 'notifications-outline') as IoniconName} size={size} color={color} />;
    case 'profile':
      return <Ionicons name={(focused ? 'person' : 'person-outline') as IoniconName} size={size} color={color} />;
  }
}

function TabButton({
  name, focused, onPress, tabWidth,
}: { name: TabName; focused: boolean; onPress: () => void; tabWidth: number }) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const iconScale = useSharedValue(focused ? 1.1 : 1);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    iconScale.value = withSpring(focused ? 1.12 : 1, { damping: 14, stiffness: 220 });
  }, [focused]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));
  const pressAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => { pressScale.value = withSpring(0.88, { damping: 10, stiffness: 400 }); }}
      onPressOut={() => { pressScale.value = withSpring(1, { damping: 12, stiffness: 280 }); }}
      activeOpacity={1}
      style={[styles.tabBtn, { width: tabWidth }]}
    >
      <Animated.View style={pressAnimStyle}>
        <Animated.View style={[styles.iconWrap, iconAnimStyle]}>
          <TabIcon name={name} focused={focused} />
        </Animated.View>
        <Text style={[styles.label, focused && styles.labelActive]}>
          {TAB_LABELS[name]}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: any;
};

export default function CustomTabBar({ state, navigation }: TabBarProps) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const barWidth = W - 32;
  const tabWidth = barWidth / state.routes.length;

  const pillX = useSharedValue(state.index * tabWidth + (tabWidth - PILL_W) / 2);

  useEffect(() => {
    pillX.value = withSpring(
      state.index * tabWidth + (tabWidth - PILL_W) / 2,
      { damping: 22, stiffness: 180, mass: 0.8 },
    );
  }, [state.index, tabWidth]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 6) + 10 }]}>
      {/* Soft teal glow — iOS only */}
      {Platform.OS === 'ios' && <View style={styles.outerGlow} />}

      <View style={styles.glass}>
        {/* Subtle top border highlight */}
        <View style={styles.topShine} />
        {/* Sliding active pill */}
        <Animated.View style={[styles.pill, pillStyle]} />
        {/* Tabs */}
        <View style={styles.row}>
          {state.routes.map((route, index) => (
            <TabButton
              key={route.key}
              name={route.name as TabName}
              focused={state.index === index}
              tabWidth={tabWidth}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!event.defaultPrevented) navigation.navigate(route.name);
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },

  // Soft teal ambient glow (iOS only)
  outerGlow: {
    position: 'absolute',
    top: 6, left: 10, right: 10, bottom: -6,
    borderRadius: Radius.xl,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },

  glass: {
    height: BAR_H,
    backgroundColor: colors.card + 'F2',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    // Android depth
    elevation: 16,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },

  topShine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(46,125,94,0.25)',
    borderRadius: 1,
  },

  pill: {
    position: 'absolute',
    top: (BAR_H - PILL_H) / 2,
    width: PILL_W,
    height: PILL_H,
    borderRadius: 18,
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.lime + '35',
  },

  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_H,
  },

  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
  },

  label: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 0.4,
    textAlign: 'center',
    marginTop: 3,
  },

  labelActive: {
    color: colors.lime,
  },
});
