import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function PressableRow({ onPress, children, style }: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleIn = () => {
    scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 80 });
  };

  const handleOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 120 });
  };

  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handleIn}
      onPressOut={handleOut}
      style={[aStyle, style]}
    >
      {children}
    </AnimatedTouchable>
  );
}
