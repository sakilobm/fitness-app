import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuth, AuthProvider } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';

function NavigationGate() {
  const { phase } = useAuth();
  const isAuthenticated = phase === 'SIGNED_IN';
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !segments[0]) return;

    // Resolve what page the user is currently targeting
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to onboarding
      router.replace('/(auth)/onboarding');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to core tab home dashboard
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isReady]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="steps" options={{ headerShown: false }} />
      <Stack.Screen name="water" options={{ headerShown: false }} />
      <Stack.Screen name="metabolism" options={{ headerShown: false }} />
      <Stack.Screen name="bmi" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* Light theme → dark status bar icons */}
        <StatusBar style="dark" />
        <NavigationGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
