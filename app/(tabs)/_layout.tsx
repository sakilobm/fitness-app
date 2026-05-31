import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/ui/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* Explicit order: Home → Weight → Food → Reminders → Profile */}
      <Tabs.Screen name="index" />
      <Tabs.Screen name="weight" />
      <Tabs.Screen name="nutrition" />
      <Tabs.Screen name="reminders" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
