import React from 'react';
import { View } from 'react-native';
import { useT } from './SetupThemeContext';

interface Props {
  currentStep: number;
  totalSteps: number;
  activeColor: string;
}

export default function StepDots({ currentStep, totalSteps, activeColor }: Props) {
  const D = useT();
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <View
            key={i}
            style={[
              { width: 8, height: 8, borderRadius: 4, backgroundColor: D.cardBorder },
              isDone && { backgroundColor: activeColor },
              isCurrent && {
                backgroundColor: activeColor,
                width: 24,
                borderRadius: 4,
                shadowColor: activeColor,
                shadowRadius: 6,
                shadowOpacity: 0.7,
                elevation: 4,
              },
            ]}
          />
        );
      })}
    </View>
  );
}
