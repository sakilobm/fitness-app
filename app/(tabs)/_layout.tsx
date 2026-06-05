import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/ui/CustomTabBar';

export default function TabsLayout() {
  return (
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
  );
}
