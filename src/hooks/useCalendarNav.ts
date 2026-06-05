import { useState, useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface CalendarNavResult {
  viewYear:      number;
  viewMonth:     number;
  isCurrentMonth: boolean;
  calAnimStyle:  ReturnType<typeof useAnimatedStyle>;
  navigateMonth: (dir: 'prev' | 'next') => void;
  goToToday:     () => void;
}

export function useCalendarNav(): CalendarNavResult {
  const now = new Date();

  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const calOpacity = useSharedValue(1);
  const calTX      = useSharedValue(0);

  const applySwitch = useCallback((y: number, m: number, dir: 'prev' | 'next') => {
    setViewYear(y);
    setViewMonth(m);
    calTX.value      = dir === 'next' ? 40 : -40;
    calOpacity.value = withTiming(1, { duration: 200 });
    calTX.value      = withSpring(0, { damping: 16, stiffness: 200 });
  }, []);

  const navigateMonth = useCallback((dir: 'prev' | 'next') => {
    calOpacity.value = withTiming(0, { duration: 150 });
    calTX.value = withTiming(dir === 'next' ? -40 : 40, { duration: 150 }, (done) => {
      'worklet';
      if (!done) return;
      let m = viewMonth, y = viewYear;
      if (dir === 'next') { m++; if (m > 11) { m = 0; y++; } }
      else                { m--; if (m < 0)  { m = 11; y--; } }
      runOnJS(applySwitch)(y, m, dir);
    });
  }, [viewMonth, viewYear, applySwitch]);

  const goToToday = useCallback(() => {
    const t = new Date();
    applySwitch(t.getFullYear(), t.getMonth(), 'next');
  }, [applySwitch]);

  const calAnimStyle = useAnimatedStyle(() => ({
    opacity: calOpacity.value,
    transform: [{ translateX: calTX.value }],
  }));

  const isCurrentMonth =
    viewYear  === now.getFullYear() &&
    viewMonth === now.getMonth();

  return { viewYear, viewMonth, isCurrentMonth, calAnimStyle, navigateMonth, goToToday };
}
