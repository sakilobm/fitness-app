import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { AppProvider } from '@/store';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        {/* Light theme → dark status bar icons */}
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.bg },
            animation: 'slide_from_right',
          }}
        />
      </AppProvider>
    </SafeAreaProvider>
  );
}
