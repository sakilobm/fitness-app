import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, Radius } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ICONS: Record<string, string> = {
  index: '🏠',
  weight: '⚖️',
  nutrition: '🥗',
  reminders: '🔔',
  profile: '👤',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  weight: 'Weight',
  nutrition: 'Food',
  reminders: 'Reminders',
  profile: 'Profile',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{TAB_ICONS[name] ?? '●'}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {TAB_LABELS[name]}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ],
        tabBarShowLabel: false,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} /> }}
      />
      <Tabs.Screen
        name="weight"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="weight" focused={focused} /> }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="nutrition" focused={focused} /> }}
      />
      <Tabs.Screen
        name="reminders"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="reminders" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    height: 68,
    borderRadius: Radius.xl,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
    }),
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: '#1A2E1C',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 2,
    opacity: 0.5,
  },
  tabItemActive: {
    opacity: 1,
  },
  tabIcon: { fontSize: 20 },
  tabIconActive: {},
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: Colors.lime,
  },
});
