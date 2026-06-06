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
        screenOptions={{ headerShown: false }}
      >
        {/* Explicit order: Home → Weight → Food → Calendar → Sleep → Vitals → Reminders → Profile */}
        <Tabs.Screen name="index" />
        <Tabs.Screen name="weight" />
        <Tabs.Screen name="nutrition" />
        <Tabs.Screen name="calendar" />
        <Tabs.Screen name="sleep" />
        <Tabs.Screen name="vitals" />
        <Tabs.Screen name="reminders" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <RewardCelebrationOverlay event={pending} onDismiss={dismiss} colors={colors} />
    </>
  );
}
