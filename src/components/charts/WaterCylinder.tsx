import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

const CYLINDER_W = 120;
const CYLINDER_H = 220;

interface Props {
  filled: number;
}

export default function WaterCylinder({ filled }: Props) {
  const { colors } = useTheme();
  const cyS = React.useMemo(() => getStyles(colors), [colors]);
  const fillHeight = useSharedValue(0);

  useEffect(() => {
    fillHeight.value = withTiming(filled, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [filled]);

  const fillStyle = useAnimatedStyle(() => ({
    height: fillHeight.value * CYLINDER_H,
  }));

  return (
    <View style={{ alignItems: 'center', width: CYLINDER_W, height: CYLINDER_H }}>
      <View style={cyS.track}>
        <Animated.View style={[cyS.fill, fillStyle]} />
        <View style={[cyS.waveRow, { bottom: filled * CYLINDER_H - 10 }]}>
          <Text style={cyS.wave}>〰〰〰</Text>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  track: {
    width: CYLINDER_W,
    height: CYLINDER_H,
    borderRadius: 60,
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderWidth: 1.5,
    borderColor: colors.chart.water + '66',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    backgroundColor: colors.chart.water + 'BB',
  },
  waveRow: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
  },
  wave: { color: colors.chart.water, opacity: 0.4, fontSize: 16, letterSpacing: -2 },
});
