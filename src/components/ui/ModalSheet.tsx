import React from 'react';
import {
  Modal, View, StyleSheet, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import KeyboardSlideView from './KeyboardSlideView';
import { Radius, useTheme } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  minHeight?: number;
}

export default function ModalSheet({ visible, onClose, children, minHeight = 400 }: Props) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.backdrop}>
          <KeyboardSlideView style={[
            styles.sheet,
            {
              backgroundColor: colors.ivory,
              borderColor: colors.lime + '20',
              minHeight,
            },
          ]}>
            <View style={[styles.handle, { backgroundColor: colors.muted + '44' }]} />
            {children}
          </KeyboardSlideView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(28, 28, 30, 0.60)',
  },
  keyboard: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
});
