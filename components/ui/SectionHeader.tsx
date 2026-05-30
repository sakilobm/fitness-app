import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export default function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  title: { ...Typography.h4, color: Colors.text.primary },
  action: { ...Typography.captionBold, color: Colors.lime, textTransform: 'uppercase', letterSpacing: 0.8 },
});
