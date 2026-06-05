import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useT } from './SetupThemeContext';

interface Props {
  icon: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
  delay?: number;
}

export default function MetricInput({ icon, label, unit, value, onChange, color, delay = 0 }: Props) {
  const D = useT();
  const [focused, setFocused] = useState(false);

  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify().damping(18)}
      style={[{
        backgroundColor: D.card,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: focused ? color + '70' : D.cardBorder,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 14,
        gap: 14,
      }]}
    >
      <View style={{
        width: 44, height: 44, borderRadius: 13,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: color + '20',
      }}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: D.textMuted, letterSpacing: 0.5, marginBottom: 4 }}>
          {label}
        </Text>
        <TextInput
          style={{ fontSize: 28, fontWeight: '700', color: focused ? color : D.textPrimary, padding: 0, margin: 0 }}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          maxLength={5}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={D.textMuted}
        />
      </View>
      <View style={{ backgroundColor: D.glass, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: D.textSecondary }}>{unit}</Text>
      </View>
    </Animated.View>
  );
}
