import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/ui/CustomTabBar';
import { RewardCelebrationOverlay } from '@/components/rewards';
import { useRewardWatcher } from '@/hooks/useRewardWatcher';
import { useTheme } from '@/constants/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { pending, dismiss } = useRewardWatcher();

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          // Themed scene background prevents a white/wrong-color flash
          // behind the screen during tab-switch transitions.
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="weight" />
        <Tabs.Screen name="nutrition" />
        <Tabs.Screen name="calendar" />
        <Tabs.Screen name="sleep" />
        <Tabs.Screen name="vitals" />
        <Tabs.Screen name="reminders" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="cycle" />
      </Tabs>

      <RewardCelebrationOverlay event={pending} onDismiss={dismiss} colors={colors} />
    </>
  );
}
