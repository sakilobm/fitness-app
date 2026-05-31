import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { IconDef } from '../../types';

interface AppIconProps {
  lib: 'Ionicons' | 'MCI';
  name: string;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}

export default function AppIcon({ lib, name, size = 20, color, style }: AppIconProps) {
  if (lib === 'MCI') {
    return <MaterialCommunityIcons name={name as any} size={size} color={color} style={style} />;
  }
  return <Ionicons name={name as any} size={size} color={color} style={style} />;
}

interface AppIconDefProps {
  icon: IconDef;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
}

export function AppIconDef({ icon, size = 20, color, style }: AppIconDefProps) {
  return <AppIcon lib={icon.lib} name={icon.name} size={size} color={color} style={style} />;
}
