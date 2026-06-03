import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuth, AuthProvider } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

function NavigationGate({ setIsAppReady }: { setIsAppReady: (r: boolean) => void }) {
  const { phase } = useAuth();
  const isAuthenticated = phase === 'SIGNED_IN';
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !segments[0] || phase === 'BOOTING') return;

    // Resolve what page the user is currently targeting
    const inAuthGroup = segments[0] === '(auth)';
    const isSetup = (segments as string[])[1] === 'setup';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to onboarding
      router.replace('/(auth)/onboarding');
      setTimeout(() => setIsAppReady(true), 100);
    } else if (isAuthenticated && inAuthGroup && !isSetup) {
      // Sync from DB before redirecting to dashboard or setup
      useFitnessStore.getState().initializeFromSupabase().then(() => {
        const user = useFitnessStore.getState().user;
        // Simple heuristic for new user: default stats
        if (user.level === 1 && user.xp === 0 && user.weight === 70 && user.height === 170) {
          router.replace('/(auth)/setup');
        } else {
          router.replace('/(tabs)');
        }
        setTimeout(() => setIsAppReady(true), 100);
      });
    } else {
      // Already authenticated and in the correct place
      setTimeout(() => setIsAppReady(true), 100);
    }
  }, [isAuthenticated, segments, isReady, phase]);

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
  const [isAppReady, setIsAppReady] = useState(false);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* Light theme → dark status bar icons */}
        <StatusBar style="dark" />
        <NavigationGate setIsAppReady={setIsAppReady} />
        <AnimatedSplashScreen isAppReady={isAppReady} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
