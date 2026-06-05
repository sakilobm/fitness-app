import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabName, TAB_META } from '@/constants/tabs';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName     = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Props {
  name:     TabName;
  focused:  boolean;
  size?:    number;
  color:    string;
}

export function TabIcon({ name, focused, size = 22, color }: Props) {
  const meta = TAB_META[name];
  if (meta.lib === 'MCI') {
    return (
      <MaterialCommunityIcons
        name={(focused ? meta.iconFill : meta.icon) as MCIName}
        size={size}
        color={color}
      />
    );
  }
  return (
    <Ionicons
      name={(focused ? meta.iconFill : meta.icon) as IoniconName}
      size={size}
      color={color}
    />
  );
}
