import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Modal, TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { AppIcon, AppIconDef } from '@/components/ui';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { ReminderItem, IconDef, IoniconName, MCIName } from '@/types';

const ALL_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_MAP: Record<string, string> = {
  'M': 'Mon', 'T': 'Tue', 'W': 'Wed', 'F': 'Fri', 'S': 'Sat'
};

const CATEGORIES = ['All', 'Water', 'Meals', 'Weigh-in', 'Body Photo', 'Workout', 'Supplements'];







const getCategoryIcon = (cat: string, titleStr?: string): IconDef => {
  const t = (titleStr || '').toLowerCase();
  if (cat === 'Water') {
    return { lib: 'Ionicons', name: t.includes('afternoon') || t.includes('evening') ? 'water-outline' : 'water' };
  }
  if (cat === 'Meals') {
    return { lib: 'Ionicons', name: t.includes('dinner') || t.includes('night') ? 'restaurant-outline' : 'restaurant' };
  }
  if (cat === 'Weigh-in') {
    return { lib: 'MCI', name: 'scale-bathroom' };
  }
  if (cat === 'Body Photo') {
    return { lib: 'Ionicons', name: 'camera' };
  }
  if (cat === 'Workout') {
    return { lib: 'MCI', name: 'dumbbell' };
  }
  return { lib: 'MCI', name: 'pill' };
};

function DayPills({ days, selected, onToggle }: { days: string[]; selected: string[]; onToggle?: (day: string) => void }) {
  const { colors, isDark } = useTheme();
  const dayS = React.useMemo(() => getDayS(colors, isDark), [colors, isDark]);
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {days.map((d, i) => {
        const isSel = selected.includes(d);
        const Component = onToggle ? TouchableOpacity : View;
        return (
          <Component
            key={i}
            onPress={onToggle ? () => onToggle(d) : undefined}
            style={[dayS.pill, isSel && dayS.pillActive]}
            activeOpacity={onToggle ? 0.75 : 1}
          >
            <Text style={[dayS.text, isSel && dayS.textActive]}>{d}</Text>
          </Component>
        );
      })}
    </View>
  );
}

const getDayS = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  pill: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  pillActive: { backgroundColor: colors.lime + '33', borderColor: colors.lime },
  text: { ...Typography.micro, color: colors.muted },
  textActive: { color: colors.lime },
});

export default function RemindersScreen() {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const remS = React.useMemo(() => getRemS(colors), [colors]);

  const categoryColors: Record<string, string> = React.useMemo(() => ({
    All: colors.lime,
    Water: colors.chart.water,
    Meals: colors.amber,
    'Weigh-in': colors.lime,
    'Body Photo': colors.lime,
    Workout: colors.lime,
    Supplements: colors.chart.fibre,
  }), [colors]);

  const accentColors = React.useMemo(() => [
    colors.chart.water,
    colors.amber,
    colors.lime,
    colors.chart.fibre,
    '#A78BFA', // Purple
    '#EC4899', // Pink
  ], [colors]);

  const smartSuggestions = React.useMemo(() => [
    { category: 'Water', title: 'Late Afternoon Hydration', time: '16:30', frequency: 'Daily', text: 'You usually forget water after 4 PM', color: colors.chart.water },
    { category: 'Weigh-in', title: 'Weekend Weigh-in check', time: '08:00', frequency: 'Weekends', text: 'Weigh-in consistency drops on weekends', color: colors.amber },
    { category: 'Meals', title: 'Log Lunch Tracker', time: '13:00', frequency: 'Weekdays', text: 'Lunch log is often skipped on Tuesdays', color: colors.chart.calories },
  ], [colors]);
  const insets = useSafeAreaInsets();
  
  // Expose global state provider
  const {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
  } = useFitnessStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  
  // Modal controllers
  const [showConfig, setShowConfig] = useState(false);
  
  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'alert'>('info');

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Water');
  const [formHour, setFormHour] = useState('08');
  const [formMinute, setFormMinute] = useState('00');
  const [formAmPm, setFormAmPm] = useState<'AM' | 'PM'>('AM');
  const [formFrequency, setFormFrequency] = useState<'Daily' | 'Weekdays' | 'Weekends' | 'Custom'>('Daily');
  const [formDays, setFormDays] = useState<string[]>(ALL_DAYS);
  const [formAccent, setFormAccent] = useState(colors.chart.water);
  const [formError, setFormError] = useState('');

  // Handle active frequency day updates
  useEffect(() => {
    if (formFrequency === 'Daily') {
      setFormDays(ALL_DAYS);
    } else if (formFrequency === 'Weekdays') {
      setFormDays(['M', 'T', 'W', 'T', 'F']);
    } else if (formFrequency === 'Weekends') {
      setFormDays(['S', 'S']);
    }
  }, [formFrequency]);

  // Handle category accent defaults
  useEffect(() => {
    if (!isEditing) {
      setFormAccent(categoryColors[formCategory] || colors.lime);
    }
  }, [formCategory, isEditing]);

  const showToast = (message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditId(null);
    setFormTitle('');
    setFormCategory('Water');
    setFormHour('08');
    setFormMinute('00');
    setFormAmPm('AM');
    setFormFrequency('Daily');
    setFormDays(ALL_DAYS);
    setFormAccent(colors.chart.water);
    setFormError('');
    setShowConfig(true);
  };

  const handleOpenEdit = (r: ReminderItem) => {
    setIsEditing(true);
    setEditId(r.id);
    setFormTitle(r.title);
    setFormCategory(r.category);
    
    // Parse time string (HH:MM -> Hour, Min, AmPm)
    const [hStr, mStr] = r.time.split(':');
    let hNum = parseInt(hStr, 10);
    const ampmVal = hNum >= 12 ? 'PM' : 'AM';
    if (hNum > 12) hNum -= 12;
    if (hNum === 0) hNum = 12;
    
    setFormHour(hNum.toString().padStart(2, '0'));
    setFormMinute(mStr);
    setFormAmPm(ampmVal);
    
    setFormFrequency(r.frequency as any);
    setFormDays(r.days);
    setFormAccent(r.accentColor);
    setFormError('');
    setShowConfig(true);
  };

  const handleApplySuggestion = (s: typeof smartSuggestions[0]) => {
    setIsEditing(false);
    setEditId(null);
    setFormTitle(s.title);
    setFormCategory(s.category);
    
    const [hStr, mStr] = s.time.split(':');
    let hNum = parseInt(hStr, 10);
    const ampmVal = hNum >= 12 ? 'PM' : 'AM';
    if (hNum > 12) hNum -= 12;
    if (hNum === 0) hNum = 12;
    
    setFormHour(hNum.toString().padStart(2, '0'));
    setFormMinute(mStr);
    setFormAmPm(ampmVal);
    setFormFrequency(s.frequency as any);
    setFormDays(s.frequency === 'Daily' ? ALL_DAYS : s.frequency === 'Weekdays' ? ['M', 'T', 'W', 'T', 'F'] : ['S', 'S']);
    setFormAccent(s.color);
    setFormError('');
    setShowConfig(true);
    showToast(`Pre-populated: ${s.title}`, 'info');
  };

  const handleSave = () => {
    if (!formTitle.trim()) {
      setFormError('Please enter a reminder title');
      return;
    }

    // Convert AM/PM hour to 24 hour string format
    let hrVal = parseInt(formHour, 10);
    if (isNaN(hrVal) || hrVal < 1 || hrVal > 12) {
      setFormError('Invalid hour input (use 01-12)');
      return;
    }
    let minVal = parseInt(formMinute, 10);
    if (isNaN(minVal) || minVal < 0 || minVal > 59) {
      setFormError('Invalid minute input (use 00-59)');
      return;
    }

    if (formAmPm === 'PM' && hrVal < 12) hrVal += 12;
    if (formAmPm === 'AM' && hrVal === 12) hrVal = 0;
    
    const finalTimeStr = `${hrVal.toString().padStart(2, '0')}:${minVal.toString().padStart(2, '0')}`;

    if (formDays.length === 0) {
      setFormError('Select at least one day for repeat schedule');
      return;
    }

    const payload = {
      category: formCategory,
      icon: getCategoryIcon(formCategory, formTitle),
      title: formTitle,
      time: finalTimeStr,
      days: formDays,
      frequency: formFrequency,
      enabled: true,
      accentColor: formAccent,
    };

    if (isEditing && editId) {
      updateReminder(editId, payload);
      showToast(`Updated reminder "${formTitle}"`, 'success');
    } else {
      addReminder(payload);
      showToast(`Added reminder "${formTitle}"`, 'success');
    }

    setShowConfig(false);
  };

  const handleDelete = (id: string, titleName: string) => {
    deleteReminder(id);
    setExpandedId(null);
    showToast(`Deleted reminder "${titleName}"`, 'alert');
  };

  const handleSimulateTrigger = (r: ReminderItem) => {
    showToast(`🔔 [SIMULATION] ${r.title}! (${r.time})`, 'info');
  };

  const toggleDay = (d: string) => {
    setFormFrequency('Custom');
    setFormDays((prev) =>
      prev.includes(d) ? prev.filter((day) => day !== d) : [...prev, d]
    );
  };

  const handleQuickTimeAdjust = (hours: number, mins: number) => {
    let hr = parseInt(formHour, 10) + hours;
    let mn = parseInt(formMinute, 10) + mins;
    
    if (mn >= 60) { hr += 1; mn -= 60; }
    if (mn < 0) { hr -= 1; mn += 60; }
    if (hr > 12) hr = 1;
    if (hr < 1) hr = 12;

    setFormHour(hr.toString().padStart(2, '0'));
    setFormMinute(mn.toString().padStart(2, '0'));
  };

  const filtered = category === 'All' ? reminders : reminders.filter((r) => r.category === category);
  const activeCount = reminders.filter((r) => r.enabled).length;

  return (
    <View style={styles.container}>
      {/* Dynamic Simulated Notification Toast Banner */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: insets.top + 10 }]}>
          <GlassCard noPadding style={StyleSheet.flatten([styles.toastCard, { borderColor: toastType === 'success' ? colors.lime + '40' : toastType === 'alert' ? colors.danger + '40' : colors.chart.water + '40' }])}>
            <View style={[styles.toastAccentBar, { backgroundColor: toastType === 'success' ? colors.lime : toastType === 'alert' ? colors.danger : colors.chart.water }]} />
            <View style={styles.toastBody}>
              <Ionicons
                name={toastType === 'success' ? 'checkmark-circle' : toastType === 'alert' ? 'trash-outline' : 'notifications'}
                size={18}
                color={toastType === 'success' ? colors.lime : toastType === 'alert' ? colors.danger : colors.chart.water}
              />
              <Text numberOfLines={2} style={styles.toastText}>{toastMessage}</Text>
            </View>
          </GlassCard>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Reminders"
          subtitle={`${activeCount} ACTIVE`}
          icon={{ lib: 'Ionicons', name: 'notifications' }}
          accentColor="#6366F1"
          rightIcon="settings-outline"
        />

        {/* Category filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          <View style={styles.catRow}>
            {CATEGORIES.map((c) => {
              const isActive = category === c;
              const color = categoryColors[c] || colors.lime;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.catPill,
                    isActive && { backgroundColor: color + '18', borderColor: color },
                  ]}
                  onPress={() => setCategory(c)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.catText, isActive && { color }]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.reminderList}>
          {filtered.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="notifications-off-outline" size={32} color={colors.muted} />
              <Text style={styles.emptyTitle}>No reminders in this category</Text>
              <Text style={styles.emptySub}>Tap "Add Reminder" below to create one!</Text>
            </GlassCard>
          ) : (
            filtered.map((r) => {
              const expanded = expandedId === r.id;
              return (
                <GlassCard key={r.id} noPadding style={styles.card}>
                  <View style={[remS.accentBar, { backgroundColor: r.accentColor }]} />
                  <TouchableOpacity style={remS.main} onPress={() => setExpandedId(expanded ? null : r.id)} activeOpacity={0.8}>
                    <View style={[remS.iconWrap, { backgroundColor: r.accentColor + '15', borderColor: r.accentColor + '30' }]}>
                      <AppIconDef icon={r.icon} color={r.accentColor} size={20} />
                    </View>
                    <View style={remS.info}>
                      <Text style={[remS.title, !r.enabled && { color: colors.muted }]}>{r.title}</Text>
                      <View style={remS.metaRow}>
                        <View style={[remS.timeBadge, { backgroundColor: r.accentColor + '12' }]}>
                          <Ionicons name="time-outline" size={10} color={r.accentColor} />
                          <Text style={[remS.timeTxt, { color: r.accentColor }]}>{r.time}</Text>
                        </View>
                        <Text style={remS.subtitle}>{r.frequency}</Text>
                      </View>
                    </View>
                    <Switch
                      value={r.enabled}
                      onValueChange={() => {
                        toggleReminder(r.id);
                        showToast(`${r.enabled ? 'Disabled' : 'Enabled'} reminder "${r.title}"`, 'info');
                      }}
                      trackColor={{ false: 'rgba(0,0,0,0.10)', true: r.accentColor + '88' }}
                      thumbColor={r.enabled ? r.accentColor : colors.muted}
                    />
                  </TouchableOpacity>

                  {expanded && (
                    <View style={remS.expanded}>
                      <View style={remS.expandRow}>
                        <Text style={remS.expandLabel}>Scheduled Time</Text>
                        <Text style={[remS.expandValue, { color: r.accentColor }]}>{r.time}</Text>
                      </View>
                      <View style={remS.expandRow}>
                        <Text style={remS.expandLabel}>Days Repeat</Text>
                        <DayPills days={ALL_DAYS} selected={r.days} />
                      </View>
                      <View style={remS.expandRow}>
                        <Text style={remS.expandLabel}>Frequency</Text>
                        <Text style={remS.expandValue}>{r.frequency}</Text>
                      </View>
                      <View style={remS.expandRow}>
                        <Text style={remS.expandLabel}>Actions</Text>
                        <View style={remS.btnGroup}>
                          <TouchableOpacity
                            onPress={() => handleSimulateTrigger(r)}
                            style={[remS.actionIconBtn, { backgroundColor: colors.chart.water + '15', borderColor: colors.chart.water + '30' }]}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="play" size={12} color={colors.chart.water} />
                            <Text style={[remS.actionIconText, { color: colors.chart.water }]}>Test</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleOpenEdit(r)}
                            style={[remS.actionIconBtn, { backgroundColor: colors.lime + '15', borderColor: colors.lime + '30' }]}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="pencil" size={12} color={colors.lime} />
                            <Text style={[remS.actionIconText, { color: colors.lime }]}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDelete(r.id, r.title)}
                            style={[remS.actionIconBtn, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '30' }]}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="trash-outline" size={12} color={colors.danger} />
                            <Text style={[remS.actionIconText, { color: colors.danger }]}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </GlassCard>
              );
            })
          )}
        </View>

        <SectionHeader title="Smart Suggestions" accentColor="#6366F1" />
        <View style={styles.suggestionsCol}>
          {smartSuggestions.map((s, i) => (
            <TouchableOpacity key={i} style={[styles.suggChip, { borderColor: s.color + '25' }]} activeOpacity={0.8} onPress={() => handleApplySuggestion(s)}>
              <View style={[styles.suggIconWrap, { backgroundColor: s.color + '15' }]}>
                <AppIconDef icon={getCategoryIcon(s.category, s.title)} color={s.color} size={18} />
              </View>
              <View style={styles.suggTexts}>
                <Text style={styles.suggText}>{s.text}</Text>
                <Text style={styles.suggSubText}>{s.title} • {s.time}</Text>
              </View>
              <View style={[styles.suggAddBtn, { backgroundColor: s.color + '18', borderColor: s.color + '40' }]}>
                <Ionicons name="add" size={12} color={s.color} />
                <Text style={[styles.suggAddText, { color: s.color }]}>Setup</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Primary Floating Add Trigger */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={handleOpenAdd}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={18} color={colors.bg} />
        <Text style={styles.fabText}>Add Reminder</Text>
      </TouchableOpacity>

      {/* Config Form Sheet Modal */}
      <Modal visible={showConfig} transparent animationType="slide" onRequestClose={() => setShowConfig(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Reminder' : 'New Reminder'}</Text>
              {isEditing && (
                <TouchableOpacity
                  onPress={() => {
                    if (editId) handleDelete(editId, formTitle);
                    setShowConfig(false);
                  }}
                  style={styles.modalDeleteHeader}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              )}
            </View>

            {formError ? <Text style={styles.formErrorText}>⚠️ {formError}</Text> : null}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollBody}>
              {/* Category Picker Grid */}
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.modalCategoryGrid}>
                {CATEGORIES.slice(1).map((c) => {
                  const color = categoryColors[c] || colors.lime;
                  const isSel = formCategory === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.modalCatBtn,
                        { borderColor: color + '40' },
                        isSel && { backgroundColor: color + '18', borderColor: color },
                      ]}
                      onPress={() => setFormCategory(c)}
                    >
                      <Text style={[styles.modalCatBtnText, { color }, isSel && { fontWeight: '800' }]}>{c}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Title input */}
              <Text style={styles.fieldLabel}>Reminder Label</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="e.g. Drink 250ml Water"
                placeholderTextColor={colors.muted}
                value={formTitle}
                onChangeText={(t) => {
                  setFormTitle(t);
                  setFormError('');
                }}
              />

              {/* Custom Segmented Time Selector */}
              <Text style={styles.fieldLabel}>Scheduled Time</Text>
              <View style={styles.timeSelectorCard}>
                <View style={styles.timePickerRow}>
                  {/* Hours */}
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeColumnLabel}>HR</Text>
                    <TextInput
                      style={styles.timeValueInput}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={formHour}
                      onChangeText={(h) => {
                        setFormHour(h);
                        setFormError('');
                      }}
                      selectTextOnFocus
                    />
                  </View>
                  <Text style={styles.timeSeparator}>:</Text>
                  {/* Minutes */}
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeColumnLabel}>MIN</Text>
                    <TextInput
                      style={styles.timeValueInput}
                      keyboardType="number-pad"
                      maxLength={2}
                      value={formMinute}
                      onChangeText={(m) => {
                        setFormMinute(m);
                        setFormError('');
                      }}
                      selectTextOnFocus
                    />
                  </View>
                  {/* AM/PM Switcher */}
                  <View style={styles.timeAmPmWrapper}>
                    <TouchableOpacity
                      onPress={() => setFormAmPm('AM')}
                      style={[styles.ampmBtn, formAmPm === 'AM' && [styles.ampmBtnActive, { backgroundColor: formAccent }]]}
                    >
                      <Text style={[styles.ampmText, formAmPm === 'AM' && styles.ampmTextActive]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setFormAmPm('PM')}
                      style={[styles.ampmBtn, formAmPm === 'PM' && [styles.ampmBtnActive, { backgroundColor: formAccent }]]}
                    >
                      <Text style={[styles.ampmText, formAmPm === 'PM' && styles.ampmTextActive]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Micro time adjust buttons */}
                <View style={styles.adjustRow}>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => handleQuickTimeAdjust(0, -15)}>
                    <Text style={styles.adjustText}>-15m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => handleQuickTimeAdjust(-1, 0)}>
                    <Text style={styles.adjustText}>-1h</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => handleQuickTimeAdjust(1, 0)}>
                    <Text style={styles.adjustText}>+1h</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.adjustBtn} onPress={() => handleQuickTimeAdjust(0, 15)}>
                    <Text style={styles.adjustText}>+15m</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Repeat Frequency Preset pills */}
              <Text style={styles.fieldLabel}>Repeat Frequency</Text>
              <View style={styles.frequencyRow}>
                {['Daily', 'Weekdays', 'Weekends', 'Custom'].map((freq) => {
                  const isSel = formFrequency === freq;
                  return (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => setFormFrequency(freq as any)}
                      style={[
                        styles.freqPill,
                        isSel && { backgroundColor: formAccent + '18', borderColor: formAccent },
                      ]}
                    >
                      <Text style={[styles.freqText, isSel && { color: formAccent }]}>{freq}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Days multi selector row */}
              <View style={styles.daysSection}>
                <Text style={styles.fieldSubLabel}>Days of Week</Text>
                <View style={styles.daysSelectorPills}>
                  <DayPills days={ALL_DAYS} selected={formDays} onToggle={toggleDay} />
                </View>
              </View>

              {/* Color accent Picker */}
              <Text style={styles.fieldLabel}>Indicator Theme Color</Text>
              <View style={styles.accentColorsRow}>
                {accentColors.map((col) => {
                  const isSel = formAccent === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      onPress={() => setFormAccent(col)}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: col },
                        isSel && styles.colorCircleSelected,
                      ]}
                    />
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity onPress={() => setShowConfig(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.modalSaveBtn, { backgroundColor: formAccent }]}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSaveText}>Save Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const getRemS = (colors: ThemeColors) => StyleSheet.create({
  accentBar: { height: 2.5 },
  main: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  info: { flex: 1, gap: 4 },
  title: { ...Typography.bodyBold, color: colors.text.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  timeTxt: { ...Typography.micro },
  subtitle: { ...Typography.caption, color: colors.muted },
  expanded: {
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: colors.cardBorder, gap: 12,
    paddingTop: 12,
  },
  expandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expandLabel: { ...Typography.caption, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  expandValue: { ...Typography.captionBold, color: colors.text.primary },
  btnGroup: { flexDirection: 'row', gap: 6 },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  actionIconText: { ...Typography.captionBold },
});

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  catScroll: { marginHorizontal: -16 },
  catRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 2 },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  catText: { ...Typography.captionBold, color: colors.muted },

  reminderList: { gap: 8 },
  card: { marginBottom: 0, overflow: 'hidden' },

  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
    borderStyle: 'dashed',
    borderColor: colors.muted + '40',
  },
  emptyTitle: { ...Typography.bodyBold, color: colors.text.primary, marginTop: 4 },
  emptySub: { ...Typography.caption, color: colors.muted, textAlign: 'center' },

  suggestionsCol: { gap: 8 },
  suggChip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: colors.cardBorder, padding: 14,
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  suggIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  suggTexts: { flex: 1, gap: 2 },
  suggText: { ...Typography.captionBold, color: colors.text.primary },
  suggSubText: { ...Typography.micro, color: colors.muted },
  suggAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  suggAddText: { ...Typography.captionBold },

  fab: {
    position: 'absolute', right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#6366F1',
    borderRadius: Radius.pill,
    paddingHorizontal: 20, paddingVertical: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { ...Typography.bodyBold, color: colors.bg },

  // Toast Styles
  toastContainer: {
    position: 'absolute',
    left: 16, right: 16,
    zIndex: 9999,
  },
  toastCard: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  toastAccentBar: {
    height: 3,
  },
  toastBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  toastText: {
    ...Typography.captionBold,
    color: colors.text.primary,
    flex: 1,
  },

  // Modal Styles
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    gap: 14,
    borderWidth: 1, borderColor: colors.cardBorder,
    maxHeight: '94%',
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4,
    backgroundColor: colors.muted + '55', borderRadius: 2,
    marginBottom: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { ...Typography.h3, color: colors.text.primary },
  modalDeleteHeader: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.danger + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  formErrorText: {
    ...Typography.captionBold,
    color: colors.danger,
    backgroundColor: colors.danger + '10',
    padding: 8,
    borderRadius: Radius.md,
  },
  modalScrollBody: {
    gap: 14,
    paddingBottom: 24,
  },
  fieldLabel: {
    ...Typography.caption,
    fontWeight: '800',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  fieldSubLabel: {
    ...Typography.micro,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  modalCategoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  modalCatBtn: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  modalCatBtnText: { ...Typography.captionBold },
  titleInput: {
    ...Typography.body,
    color: colors.text.primary,
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  // Custom picker time selector
  timeSelectorCard: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 12,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  timeColumn: {
    alignItems: 'center',
    gap: 4,
  },
  timeColumnLabel: {
    ...Typography.micro,
    color: colors.muted,
  },
  timeValueInput: {
    ...Typography.h2,
    color: colors.text.primary,
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    width: 64,
    height: 52,
    textAlign: 'center',
  },
  timeSeparator: {
    ...Typography.h2,
    color: colors.muted,
    paddingBottom: 4,
  },
  timeAmPmWrapper: {
    flexDirection: 'column',
    gap: 4,
    justifyContent: 'center',
  },
  ampmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  ampmBtnActive: {
    borderColor: 'transparent',
  },
  ampmText: {
    ...Typography.micro,
    fontWeight: '700',
    color: colors.muted,
  },
  ampmTextActive: {
    color: colors.bg,
  },
  adjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  adjustBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  adjustText: {
    ...Typography.micro,
    color: colors.text.secondary,
    fontWeight: '600',
  },

  // Repeat Schedule repeat styles
  frequencyRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  freqPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  freqText: {
    ...Typography.captionBold,
    color: colors.muted,
  },
  daysSection: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderRadius: Radius.md,
    padding: 10,
    marginTop: 4,
  },
  daysSelectorPills: {
    alignItems: 'center',
    paddingVertical: 4,
  },

  // Colors grid
  accentColorsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  colorCircle: {
    width: 32, height: 32, borderRadius: 16,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: colors.bg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },

  // Bottom action buttons
  modalActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  modalCancelText: {
    ...Typography.bodyBold,
    color: colors.text.secondary,
  },
  modalSaveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  modalSaveText: {
    ...Typography.bodyBold,
    color: colors.bg,
  },
});
