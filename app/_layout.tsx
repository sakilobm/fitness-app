import { Stack, useSegments, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors, ThemeProvider, useTheme } from '@/constants/theme';
import { useAuth, AuthProvider } from '@/providers/AuthProvider';
import { useEffect, useRef, useState } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import * as SplashScreen from 'expo-splash-screen';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => { });

function NavigationGate({ setIsAppReady }: { setIsAppReady: (r: boolean) => void }) {
  const { phase } = useAuth();
  const isAuthenticated = phase === 'SIGNED_IN';
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const setupCheckDone = useRef(false);
  const { colors } = useTheme();

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !segments[0] || phase === 'BOOTING') return;

    const inAuthGroup = segments[0] === '(auth)';
    const isSetup = (segments as string[])[1] === 'setup';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/onboarding');
      setTimeout(() => setIsAppReady(true), 100);
    } else if (isAuthenticated && !isSetup && !setupCheckDone.current) {
      // Run once per session — syncs DB, then gates on setupCompleted regardless
      // of whether user is in auth group or already at tabs.
      setupCheckDone.current = true;
      useFitnessStore.getState().initializeFromSupabase().then(() => {
        const user = useFitnessStore.getState().user;
        if (!user.setupCompleted) {
          router.replace('/(auth)/setup');
        } else if (inAuthGroup) {
          router.replace('/(tabs)');
        }
        setTimeout(() => setIsAppReady(true), 100);
      });
    } else {
      setTimeout(() => setIsAppReady(true), 100);
    }
  }, [isAuthenticated, segments, isReady, phase]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="steps" options={{ headerShown: false }} />
      <Stack.Screen name="water" options={{ headerShown: false }} />
      <Stack.Screen name="metabolism" options={{ headerShown: false }} />
      <Stack.Screen name="bmi" options={{ headerShown: false }} />
      <Stack.Screen name="rewards" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationGate setIsAppReady={setIsAppReady} />
          <AnimatedSplashScreen isAppReady={isAppReady} />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
