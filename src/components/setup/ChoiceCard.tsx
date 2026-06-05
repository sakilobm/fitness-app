import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming,
  FadeInUp, interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useT } from './SetupThemeContext';

export interface ChoiceCardProps {
  selected: boolean;
  onPress: () => void;
  color: string;
  icon: string;
  label: string;
  subtitle?: string;
  delay?: number;
}

export default function ChoiceCard({ selected, onPress, color, icon, label, subtitle, delay = 0 }: ChoiceCardProps) {
  const D = useT();
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(selected ? 1.03 : 1, { damping: 14, stiffness: 200 });
    glow.value = withTiming(selected ? 1 : 0, { duration: 250 });
  }, [selected]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolate(glow.value, [0, 1], [0, 1]) === 1 ? color + '80' : D.glassBorder,
    shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.35]),
    shadowRadius: interpolate(glow.value, [0, 1], [0, 18]),
    shadowColor: color,
    elevation: selected ? 8 : 2,
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(18)}
      style={[{
        borderRadius: 18,
        borderWidth: 1.5,
        backgroundColor: D.card,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 4 },
      }, cardStyle]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 }}
      >
        <View style={[{
          width: 46, height: 46, borderRadius: 14,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: selected ? color + '30' : D.glass,
          borderColor: selected ? color + '50' : 'transparent',
          borderWidth: 1,
        }]}>
          <Ionicons name={icon as any} size={22} color={selected ? color : D.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[
            { fontSize: 16, fontWeight: '600', color: D.textSecondary, marginBottom: 2 },
            selected && { color: D.textPrimary, fontWeight: '700' },
          ]}>{label}</Text>
          {subtitle && (
            <Text style={[
              { fontSize: 13, color: D.textMuted },
              selected && { color },
            ]}>{subtitle}</Text>
          )}
        </View>
        <View style={[{
          width: 26, height: 26, borderRadius: 13,
          borderWidth: 1.5, borderColor: D.cardBorder,
          alignItems: 'center', justifyContent: 'center',
        }, selected && { backgroundColor: color, borderColor: color }]}>
          {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
