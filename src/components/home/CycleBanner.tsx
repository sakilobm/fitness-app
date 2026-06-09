import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface Props {
  onEnable: () => void;
  onDismiss: () => void;
}

export default React.memo(function CycleBanner({ onEnable, onDismiss }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Ionicons name="flower" size={22} color="#F87171" />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>Cycle Tracking Available 🌸</Text>
          <Text style={styles.sub}>
            Track your period, ovulation & symptoms. Enable it to add Cycle to your tab bar, or find it in Profile → Preferences.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={onEnable} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle" size={13} color="#fff" />
            <Text style={styles.btnTxt}>Enable Now</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.close}>
        <Ionicons name="close" size={16} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
});

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  banner:    { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', backgroundColor: '#F8717110', borderRadius: Radius.lg, borderWidth: 1, borderColor: '#F8717135', padding: 14, gap: 8 },
  left:      { flexDirection: 'row', gap: 12, flex: 1 },
  iconWrap:  { width: 40, height: 40, borderRadius: 13, backgroundColor: '#F8717118', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textBlock: { flex: 1, gap: 4 },
  title:     { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  sub:       { fontSize: 12, fontWeight: '400', color: colors.text.secondary, lineHeight: 17 },
  btn:       { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, backgroundColor: '#F87171', borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 7 },
  btnTxt:    { fontSize: 12, fontWeight: '700', color: '#fff' },
  close:     { padding: 2 },
});
