import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Radius } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { TabName, ALL_TABS, TAB_LABELS, TAB_META } from '@/constants/tabs';
import { TabIcon } from './TabIcon';

const MAX_PRIMARY = 4;
const SHEET_H     = 560;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  visible:      boolean;
  onClose:      () => void;
  primaryTabs:  TabName[];
  onSave:       (tabs: TabName[]) => void;
  colors:       ThemeColors;
}

// ── Tab row item (in main bar) ────────────────────────────────────────────────
function MainItem({
  name, index, total, onRemove, onLeft, onRight, colors,
}: {
  name:    TabName;
  index:   number;
  total:   number;
  onRemove: () => void;
  onLeft:  () => void;
  onRight: () => void;
  colors:  ThemeColors;
}) {
  const meta = TAB_META[name];
  return (
    <View style={[st.rowItem, { backgroundColor: colors.bg, borderColor: colors.cardBorder }]}>
      <View style={[st.iconBubble, { backgroundColor: meta.color + '20' }]}>
        <TabIcon name={name} focused size={18} color={meta.color} />
      </View>
      <Text style={[st.rowLabel, { color: colors.text.primary }]}>{TAB_LABELS[name]}</Text>
      <View style={st.rowActions}>
        <TouchableOpacity
          onPress={onLeft}
          disabled={index === 0}
          style={[st.arrowBtn, { opacity: index === 0 ? 0.25 : 1 }]}
        >
          <Ionicons name="chevron-back" size={14} color={colors.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRight}
          disabled={index === total - 1}
          style={[st.arrowBtn, { opacity: index === total - 1 ? 0.25 : 1 }]}
        >
          <Ionicons name="chevron-forward" size={14} color={colors.muted} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRemove}
          disabled={total <= 1}
          style={[st.removeBtn, { opacity: total <= 1 ? 0.25 : 1 }]}
        >
          <Ionicons name="remove-circle" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── More item (available to add) ──────────────────────────────────────────────
function MoreItem({
  name, canAdd, onAdd, colors,
}: {
  name:   TabName;
  canAdd: boolean;
  onAdd:  () => void;
  colors: ThemeColors;
}) {
  const meta = TAB_META[name];
  return (
    <View style={[st.rowItem, { backgroundColor: colors.bg, borderColor: colors.cardBorder }]}>
      <View style={[st.iconBubble, { backgroundColor: meta.color + '20' }]}>
        <TabIcon name={name} focused={false} size={18} color={meta.color} />
      </View>
      <View style={st.rowMeta}>
        <Text style={[st.rowLabel, { color: colors.text.primary }]}>{TAB_LABELS[name]}</Text>
        <Text style={[st.rowDesc,  { color: colors.muted }]}>{meta.desc}</Text>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        disabled={!canAdd}
        style={[
          st.addBtn,
          {
            backgroundColor: canAdd ? colors.lime + '20' : colors.muted + '18',
            borderColor:     canAdd ? colors.lime       : colors.muted + '30',
          },
        ]}
      >
        <Ionicons name="add" size={16} color={canAdd ? colors.lime : colors.muted} />
        <Text style={[st.addBtnTxt, { color: canAdd ? colors.lime : colors.muted }]}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main sheet ────────────────────────────────────────────────────────────────
export function CustomizeTabSheet({ visible, onClose, primaryTabs, onSave, colors }: Props) {
  const [local, setLocal] = useState<TabName[]>([...primaryTabs]);

  const translateY = useSharedValue(SHEET_H);
  const backdropOp = useSharedValue(0);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocal([...primaryTabs]);
      setRendered(true);
      translateY.value = withSpring(0, { damping: 22, stiffness: 240, mass: 0.9 });
      backdropOp.value = withTiming(1, { duration: 220 });
    } else {
      backdropOp.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(SHEET_H, { damping: 22, stiffness: 240, mass: 0.9 });
      const t = setTimeout(() => setRendered(false), 380);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const sheetStyle  = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const bgStyle     = useAnimatedStyle(() => ({ opacity: backdropOp.value }));

  if (!rendered) return null;

  const secondary = ALL_TABS.filter(t => !local.includes(t));
  const canAdd    = local.length < MAX_PRIMARY;

  function addToMain(name: TabName) {
    if (!canAdd) return;
    setLocal(prev => [...prev, name]);
  }

  function removeFromMain(name: TabName) {
    if (local.length <= 1) return;
    setLocal(prev => prev.filter(t => t !== name));
  }

  function moveLeft(i: number) {
    if (i === 0) return;
    setLocal(prev => {
      const n = [...prev];
      [n[i - 1], n[i]] = [n[i], n[i - 1]];
      return n;
    });
  }

  function moveRight(i: number) {
    if (i === local.length - 1) return;
    setLocal(prev => {
      const n = [...prev];
      [n[i], n[i + 1]] = [n[i + 1], n[i]];
      return n;
    });
  }

  function handleDone() {
    onSave(local);
    onClose();
  }

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={handleDone}>
      <Animated.View style={[st.backdrop, bgStyle]}>
        <Pressable style={{ flex: 1 }} onPress={handleDone} />
      </Animated.View>

      <Animated.View style={[st.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }, sheetStyle]}>
        {/* Handle */}
        <View style={[st.handle, { backgroundColor: colors.muted + '50' }]} />

        {/* Header */}
        <View style={st.header}>
          <View>
            <Text style={[st.title,    { color: colors.text.primary }]}>Customize Tab Bar</Text>
            <Text style={[st.subtitle, { color: colors.muted }]}>Arrange up to 4 tabs in the main bar</Text>
          </View>
          <TouchableOpacity onPress={handleDone} style={[st.doneBtn, { backgroundColor: colors.lime }]}>
            <Text style={st.doneTxt}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>
          {/* Main bar section */}
          <View style={st.section}>
            <View style={st.sectionHead}>
              <Text style={[st.sectionTitle, { color: colors.text.primary }]}>Main Bar</Text>
              <View style={[st.badge, { backgroundColor: local.length === MAX_PRIMARY ? colors.lime + '20' : colors.muted + '18' }]}>
                <Text style={[st.badgeTxt, { color: local.length === MAX_PRIMARY ? colors.lime : colors.muted }]}>
                  {local.length} / {MAX_PRIMARY}
                </Text>
              </View>
            </View>

            {local.map((name, i) => (
              <MainItem
                key={name}
                name={name}
                index={i}
                total={local.length}
                colors={colors}
                onRemove={() => removeFromMain(name)}
                onLeft={() => moveLeft(i)}
                onRight={() => moveRight(i)}
              />
            ))}
          </View>

          {/* More section */}
          {secondary.length > 0 && (
            <View style={st.section}>
              <View style={st.sectionHead}>
                <Text style={[st.sectionTitle, { color: colors.text.primary }]}>More Menu</Text>
                {!canAdd && (
                  <Text style={[st.fullTxt, { color: colors.danger }]}>Main bar full — remove a tab first</Text>
                )}
              </View>
              {secondary.map(name => (
                <MoreItem
                  key={name}
                  name={name}
                  canAdd={canAdd}
                  colors={colors}
                  onAdd={() => addToMain(name)}
                />
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius:  Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 10,
    maxHeight: SHEET_H,
    elevation: 24,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 12,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 4,
  },
  title:    { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 2 },
  doneBtn:  {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  doneTxt: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  scroll: { paddingHorizontal: 16, paddingTop: 12 },

  section: { marginBottom: 16 },
  sectionHead: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 10,
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  fullTxt:  { fontSize: 10, fontWeight: '600' },

  // Row items
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconBubble: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: 14, fontWeight: '700' },
  rowMeta:  { flex: 1 },
  rowDesc:  { fontSize: 10, marginTop: 1 },

  // Main item controls
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  arrowBtn: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  removeBtn: {
    width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 4,
  },

  // More item add button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1,
  },
  addBtnTxt: { fontSize: 12, fontWeight: '700' },
});
