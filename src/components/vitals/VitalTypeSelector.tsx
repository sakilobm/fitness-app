import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/theme';
import { VitalType, VITAL_CONFIG } from '@/constants/vitals';

interface Props {
  selected: VitalType;
  onChange: (type: VitalType) => void;
  colors:   ThemeColors;
}

const TYPES: VitalType[] = ['heartRate', 'bloodPressure', 'bloodGlucose', 'oxygen'];

export function VitalTypeSelector({ selected, onChange, colors }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[st.row, { paddingHorizontal: 16 }]}
      >
        {TYPES.map(type => {
          const cfg     = VITAL_CONFIG[type];
          const active  = selected === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => onChange(type)}
              activeOpacity={0.78}
              style={[
                st.pill,
                active
                  ? { backgroundColor: cfg.color + '22', borderColor: cfg.color }
                  : { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <Ionicons
                name={cfg.icon as any}
                size={14}
                color={active ? cfg.color : colors.muted}
              />
              <Text style={[st.label, { color: active ? cfg.color : colors.muted }]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  row:   { gap: 8, paddingVertical: 4 },
  pill:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  label: { fontSize: 12, fontWeight: '700' },
});
