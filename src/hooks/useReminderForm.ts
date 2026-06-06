import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from '@/constants/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { ReminderItem } from '@/types';
import {
  ALL_DAYS, ReminderFrequency, SmartSuggestion,
  getCategoryIcon, daysForFrequency, parseTimeString, formTimeTo24h,
} from '@/constants/reminders';
import { ToastType } from '@/hooks/useToast';

export interface ReminderFormResult {
  visible:    boolean;
  isEditing:  boolean;
  error:      string;

  title:      string;
  setTitle:   (v: string) => void;
  category:   string;
  setCategory: (v: string) => void;
  hour:       string;
  setHour:    (v: string) => void;
  minute:     string;
  setMinute:  (v: string) => void;
  ampm:       'AM' | 'PM';
  setAmPm:    (v: 'AM' | 'PM') => void;
  frequency:  ReminderFrequency;
  setFrequency: (v: ReminderFrequency) => void;
  days:       string[];
  accent:     string;
  setAccent:  (v: string) => void;

  openAdd:        () => void;
  openEdit:       (reminder: ReminderItem) => void;
  applySuggestion: (suggestion: SmartSuggestion) => void;
  toggleDay:      (day: string) => void;
  adjustTime:     (hours: number, minutes: number) => void;
  save:           () => void;
  close:          () => void;
  removeEditing:  () => void;
}

interface Params {
  categoryColors: Record<string, string>;
  showToast: (message: string, type?: ToastType) => void;
}

/** Owns all add/edit-reminder modal state: fields, validation, and save/delete handlers. */
export function useReminderForm({ categoryColors, showToast }: Params): ReminderFormResult {
  const { colors } = useTheme();
  const { addReminder, updateReminder, deleteReminder } = useFitnessStore(useShallow((s) => ({
    addReminder: s.addReminder,
    updateReminder: s.updateReminder,
    deleteReminder: s.deleteReminder,
  })));

  const [visible,   setVisible]   = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [error,     setError]     = useState('');

  const [title,     setTitle]     = useState('');
  const [category,  setCategory]  = useState('Water');
  const [hour,      setHour]      = useState('08');
  const [minute,    setMinute]    = useState('00');
  const [ampm,      setAmPm]      = useState<'AM' | 'PM'>('AM');
  const [frequency, setFrequency] = useState<ReminderFrequency>('Daily');
  const [days,      setDays]      = useState<string[]>(ALL_DAYS);
  const [accent,    setAccent]    = useState(colors.chart.water);

  // Preset frequencies drive the active-day selection automatically.
  useEffect(() => {
    if (frequency !== 'Custom') setDays(daysForFrequency(frequency));
  }, [frequency]);

  // New reminders default their accent to the category's theme color.
  useEffect(() => {
    if (!isEditing) setAccent(categoryColors[category] || colors.lime);
  }, [category, isEditing, categoryColors, colors.lime]);

  function resetFields() {
    setTitle('');
    setCategory('Water');
    setHour('08');
    setMinute('00');
    setAmPm('AM');
    setFrequency('Daily');
    setDays(ALL_DAYS);
    setAccent(colors.chart.water);
    setError('');
  }

  function openAdd() {
    setIsEditing(false);
    setEditId(null);
    resetFields();
    setVisible(true);
  }

  function openEdit(reminder: ReminderItem) {
    setIsEditing(true);
    setEditId(reminder.id);
    setTitle(reminder.title);
    setCategory(reminder.category);

    const t = parseTimeString(reminder.time);
    setHour(t.hour);
    setMinute(t.minute);
    setAmPm(t.ampm);

    setFrequency(reminder.frequency as ReminderFrequency);
    setDays(reminder.days);
    setAccent(reminder.accentColor);
    setError('');
    setVisible(true);
  }

  function applySuggestion(suggestion: SmartSuggestion) {
    setIsEditing(false);
    setEditId(null);
    setTitle(suggestion.title);
    setCategory(suggestion.category);

    const t = parseTimeString(suggestion.time);
    setHour(t.hour);
    setMinute(t.minute);
    setAmPm(t.ampm);

    setFrequency(suggestion.frequency as ReminderFrequency);
    setDays(daysForFrequency(suggestion.frequency));
    setAccent(suggestion.color);
    setError('');
    setVisible(true);
    showToast(`Pre-populated: ${suggestion.title}`, 'info');
  }

  function toggleDay(day: string) {
    setFrequency('Custom');
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function adjustTime(hours: number, minutes: number) {
    let hr = parseInt(hour, 10) + hours;
    let mn = parseInt(minute, 10) + minutes;

    if (mn >= 60) { hr += 1; mn -= 60; }
    if (mn < 0)   { hr -= 1; mn += 60; }
    if (hr > 12) hr = 1;
    if (hr < 1)  hr = 12;

    setHour(hr.toString().padStart(2, '0'));
    setMinute(mn.toString().padStart(2, '0'));
  }

  function save() {
    if (!title.trim()) {
      setError('Please enter a reminder title');
      return;
    }

    const hrVal = parseInt(hour, 10);
    if (isNaN(hrVal) || hrVal < 1 || hrVal > 12) {
      setError('Invalid hour input (use 01-12)');
      return;
    }
    const minVal = parseInt(minute, 10);
    if (isNaN(minVal) || minVal < 0 || minVal > 59) {
      setError('Invalid minute input (use 00-59)');
      return;
    }
    if (days.length === 0) {
      setError('Select at least one day for repeat schedule');
      return;
    }

    const payload = {
      category,
      icon: getCategoryIcon(category, title),
      title,
      time: formTimeTo24h(hour, minute, ampm),
      days,
      frequency,
      enabled: true,
      accentColor: accent,
    };

    if (isEditing && editId) {
      updateReminder(editId, payload);
      showToast(`Updated reminder "${title}"`, 'success');
    } else {
      addReminder(payload);
      showToast(`Added reminder "${title}"`, 'success');
    }

    setVisible(false);
  }

  function removeEditing() {
    if (!editId) return;
    deleteReminder(editId);
    showToast(`Deleted reminder "${title}"`, 'alert');
    setVisible(false);
  }

  function close() {
    setVisible(false);
  }

  return {
    visible, isEditing, error,
    title, setTitle,
    category, setCategory,
    hour, setHour,
    minute, setMinute,
    ampm, setAmPm,
    frequency, setFrequency,
    days,
    accent, setAccent,
    openAdd, openEdit, applySuggestion, toggleDay, adjustTime, save, close, removeEditing,
  };
}
