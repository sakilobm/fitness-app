import { useState, useMemo, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch,
  TextInput, KeyboardAvoidingView, Platform, Modal, Image, Share, Alert, ActivityIndicator,
} from 'react-native';
import KeyboardSlideView from '@/components/ui/KeyboardSlideView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import PressableRow from '@/components/ui/PressableRow';
import GoalDialRow from '@/components/ui/GoalDialRow';
import { Typography, Radius, Shadows, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import * as ImagePicker from 'expo-image-picker';
import { useProfileSettings, useFitnessStore } from '@/store/fitnessStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
import { triggerHaptic } from '@/utils/haptics';
import { kgToLbs, mlToOz, ozToMl } from '@/utils/units';
import { formatErrorMessage } from '@/utils/errorUtils';
import Animated, {
  FadeInUp, FadeInDown, FadeIn, ZoomIn,
  useSharedValue, useAnimatedStyle, withSpring, withDelay, withSequence, interpolate,
} from 'react-native-reanimated';
import { useSettingsForm, useHealthConnect } from '@/hooks';

// â”€â”€â”€ Preset Avatars for Fast Selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AVATAR_PRESETS = [
  { id: 'av1', label: 'Strength', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Runner', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=150&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Yoga', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Trainer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'Boxing', url: 'https://images.unsplash.com/photo-1491756906593-95123989ad30?w=150&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Cyclist', url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=150&auto=format&fit=crop&q=80' },
];

// â”€â”€â”€ Main Settings Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Theme context
  const { colors, isDark: isDarkMode, setIsDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  // Zustand stores
  const { user } = useProfileSettings();

  const {
    formName, setFormName,
    formAge, setFormAge,
    formHeight, setFormHeight,
    formWeight, setFormWeight,
    formGoal, setFormGoal,
    formMotto, setFormMotto,
    formProfilePic, setFormProfilePic,
    formCalorieGoal, setFormCalorieGoal,
    formWaterGoal, setFormWaterGoal,
    formStepsGoal, setFormStepsGoal,
    formWorkoutGoal, setFormWorkoutGoal,
    weightUnit, setWeightUnit, volumeUnit, setVolumeUnit,
    notifications, setNotifications,
    haptics, setHaptics,
    privateProfile, setPrivateProfile,
    appLock, setAppLock,
    formErrors, setFormErrors,
    handleWeightUnitChange,
    handleSave,
    toastMessage, toastType, showToast,
    pickImageFromGallery,
    takePhotoWithCamera,
    handleManualSync,
    handleChangePassword,
    handleExportData,
    handleClearLocal: handleClearLocalHook,
    handleClearCloud: handleClearCloudHook,
    handleLogout: handleLogoutHook,
  } = useSettingsForm();

  // Health Connect
  const hc = useHealthConnect();

  const handleHealthConnect = async () => {
    triggerHaptic('medium');
    const ok = await hc.connect();
    if (ok) showToast('Health Connect linked — tap Sync Now to import data.', 'success');
    else showToast('Permission denied or Health Connect unavailable.', 'alert');
  };

  const handleHealthSync = async () => {
    triggerHaptic('selection');
    const result = await hc.syncAll();
    const total = result.steps + result.weightLogs + result.waterLogs;
    if (total > 0) {
      showToast(`Synced ${result.steps.toLocaleString()} steps · ${result.weightLogs} weight · ${result.waterLogs} water records.`, 'success');
    } else {
      showToast('Synced — no new records found since last import.', 'info');
    }
  };

  const formatSyncTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  // Modal / Overlay Controls
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const onCloseActionSheet = () => setActionSheetVisible(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [clearTarget, setClearTarget] = useState<'local' | 'cloud' | null>(null);
  const [showSplashPreview, setShowSplashPreview] = useState(false);
  const [showSyncing, setShowSyncing] = useState(false);
  const [showDocModal, setShowDocModal] = useState<{ visible: boolean; title: string; content: string }>({
    visible: false, title: '', content: ''
  });

  const [hapticTestIndex, setHapticTestIndex] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const [clearResult, setClearResult] = useState<'success' | 'error' | null>(null);

  const confirmBtnScale = useSharedValue(0.95);
  const isReadyToConfirm = clearConfirmText === 'CLEAR';

  useEffect(() => {
    confirmBtnScale.value = withSpring(isReadyToConfirm ? 1 : 0.95, { damping: 12, stiffness: 200 });
  }, [isReadyToConfirm]);

  const confirmBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmBtnScale.value }],
    opacity: interpolate(confirmBtnScale.value, [0.95, 1], [0.3, 1]),
  }));

  // —— Result animation ——————————————————————————————————————————————————————
  const resultIconScale = useSharedValue(0);
  const resultGlowScale = useSharedValue(0);

  useEffect(() => {
    if (clearResult) {
      resultGlowScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      resultIconScale.value = withDelay(60,
        withSequence(
          withSpring(1.18, { damping: 7, stiffness: 220 }),
          withSpring(1,    { damping: 14, stiffness: 160 }),
        ),
      );
    } else {
      resultIconScale.value = 0;
      resultGlowScale.value = 0;
    }
  }, [clearResult]);

  const resultIconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultIconScale.value }],
  }));

  const resultGlowAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultGlowScale.value }],
    opacity: interpolate(resultGlowScale.value, [0, 1], [0, 0.2]),
  }));

  const handleTestHaptic = () => {
    const patterns = ['light', 'medium', 'heavy', 'success', 'warning', 'error'] as const;
    const type = patterns[hapticTestIndex % patterns.length];
    triggerHaptic(type);
    showToast(`Triggered ${type.toUpperCase()} haptic pattern ⚡`, 'info');
    setHapticTestIndex(hapticTestIndex + 1);
  };

  const onPickImage = () => {
    setActionSheetVisible(false);
    pickImageFromGallery();
  };

  const onTakePhoto = () => {
    setActionSheetVisible(false);
    takePhotoWithCamera();
  };

  const onManualSync = () => {
    handleManualSync(setShowSyncing);
  };

  const onResetPassword = () => {
    handleChangePassword();
  };

  const onExportData = () => {
    handleExportData();
  };

  const EMPTY_MEALS = [
    { id: 'breakfast', label: 'Breakfast', icon: 'ðŸŒ…', expanded: true,  items: [] },
    { id: 'lunch',     label: 'Lunch',     icon: 'â˜€ï¸',  expanded: false, items: [] },
    { id: 'dinner',    label: 'Dinner',    icon: 'ðŸŒ™',  expanded: false, items: [] },
    { id: 'snacks',    label: 'Snacks',    icon: 'ðŸŽ',  expanded: false, items: [] },
  ];

  const closeClearModal = () => {
    setShowClearModal(false);
    setClearConfirmText('');
    setClearTarget(null);
    setClearResult(null);
    setIsClearing(false);
  };

  const onClearLocal = () => {
    if (clearConfirmText !== 'CLEAR') return;
    handleClearLocalHook(setIsClearing, () => {
      setClearResult('success');
      setTimeout(() => {
        closeClearModal();
      }, 1600);
    });
  };

  const onClearCloud = () => {
    if (clearConfirmText !== 'CLEAR') return;
    handleClearCloudHook(setIsClearing, (res) => {
      setClearResult(res);
      if (res === 'success') {
        setTimeout(() => {
          closeClearModal();
        }, 1600);
      } else {
        setTimeout(() => setClearResult(null), 2000);
      }
    }, closeClearModal);
  };

  const onLogout = () => {
    handleLogoutHook();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
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
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Settings"
          subtitle="PREFERENCES"
          icon={{ lib: 'Ionicons', name: 'settings' }}
          accentColor={colors.lime}
          showBack
          onBack={() => router.back()}
        />

        {/* â”€â”€â”€ Profile Overview Card â”€â”€â”€ */}
        <Animated.View entering={FadeInUp.delay(50).springify().damping(18)}>
          <GlassCard accentColor={colors.lime}>
            <View style={styles.profileHeader}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setActionSheetVisible(true)}>
                <View style={styles.avatar}>
                  {formProfilePic ? (
                    <Image source={{ uri: formProfilePic }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {formName.split(' ').map((n) => n[0] || '').join('').toUpperCase().slice(0, 2)}
                    </Text>
                  )}
                  <View style={styles.avatarCameraBadge}>
                    <Ionicons name="camera" size={11} color={colors.white} />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{formName || 'User Settings'}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{user.email || 'Local Account'}</Text>
                <View style={styles.levelBadge}>
                  <Ionicons name="flash" size={10} color={colors.lime} />
                  <Text style={styles.levelText}>Active Fitness Profile</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* â”€â”€â”€ Profile Basic Metrics â”€â”€â”€ */}
        <Animated.View entering={FadeInUp.delay(100).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: colors.lime }]} />
            <Text style={styles.groupLabelText}>Basic Metrics</Text>
          </View>

          <GlassCard>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Display Motto</Text>
              <View style={styles.inputFieldWrap}>
                <Ionicons name="chatbox-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formMotto}
                  onChangeText={setFormMotto}
                  placeholder="Set your motivational motto..."
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[styles.inputFieldWrap, formErrors.name && styles.inputFieldError]}>
                <Ionicons name="person-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formName}
                  onChangeText={(t) => {
                    setFormName(t);
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="Alex Rivera"
                  placeholderTextColor={colors.muted}
                />
              </View>
            </View>
            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}

            <View style={styles.inputRow}>
              {/* Age */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Age</Text>
                <View style={[styles.inputFieldWrap, formErrors.age && styles.inputFieldError]}>
                  <TextInput
                    style={styles.textInput}
                    value={formAge}
                    onChangeText={(t) => {
                      setFormAge(t);
                      if (formErrors.age) setFormErrors({ ...formErrors, age: undefined });
                    }}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Height */}
              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <View style={[styles.inputFieldWrap, formErrors.height && styles.inputFieldError]}>
                  <TextInput
                    style={styles.textInput}
                    value={formHeight}
                    onChangeText={(t) => {
                      setFormHeight(t);
                      if (formErrors.height) setFormErrors({ ...formErrors, height: undefined });
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              {/* Weight */}
              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={styles.inputLabel}>Weight ({weightUnit})</Text>
                <View style={[styles.inputFieldWrap, formErrors.weight && styles.inputFieldError]}>
                  <TextInput
                    style={styles.textInput}
                    value={formWeight}
                    onChangeText={(t) => {
                      setFormWeight(t);
                      if (formErrors.weight) setFormErrors({ ...formErrors, weight: undefined });
                    }}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>
            </View>
            {formErrors.age && <Text style={styles.errorText}>{formErrors.age}</Text>}
            {formErrors.height && <Text style={styles.errorText}>{formErrors.height}</Text>}
            {formErrors.weight && <Text style={styles.errorText}>{formErrors.weight}</Text>}

            {/* Avatar Preset Scroller */}
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Change Profile Avatar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
              {AVATAR_PRESETS.map((preset) => {
                const isActive = formProfilePic === preset.url;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => { setFormProfilePic(preset.url); triggerHaptic('selection'); }}
                    style={styles.presetItem}
                  >
                    <Image source={{ uri: preset.url }} style={[styles.presetImage, isActive && { borderColor: colors.lime, borderWidth: 2 }]} />
                    <Text style={[styles.presetLabel, isActive && { color: colors.lime, fontWeight: '700' }]}>{preset.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </GlassCard>
        </Animated.View>

        {/* â”€â”€â”€ Advanced Goal Calibrators â”€â”€â”€ */}
        <Animated.View entering={FadeInUp.delay(150).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: colors.amber }]} />
            <Text style={styles.groupLabelText}>Advanced Goals Calibration</Text>
          </View>

          <GlassCard accentColor={colors.amber}>
            <GoalDialRow
              icon="flame"
              iconColor={colors.amber}
              title="Daily Calories Target"
              displayValue={`${formCalorieGoal} kcal`}
              onDecrement={() => setFormCalorieGoal(Math.max(1000, formCalorieGoal - 100))}
              onIncrement={() => setFormCalorieGoal(Math.min(6000, formCalorieGoal + 100))}
              quickOptions={[1800, 2200, 2500, 3000].map((c) => ({
                key: c, label: `${c}`, selected: formCalorieGoal === c, onPress: () => setFormCalorieGoal(c),
              }))}
            />

            <View style={styles.divider} />

            <GoalDialRow
              icon="water"
              iconColor={colors.chart.water}
              title="Daily Hydration Target"
              displayValue={volumeUnit === 'oz' ? `${mlToOz(formWaterGoal)} oz` : `${formWaterGoal} ml`}
              onDecrement={() => {
                if (volumeUnit === 'oz') {
                  setFormWaterGoal(ozToMl(Math.max(16, mlToOz(formWaterGoal) - 8))); // min 16 oz
                } else {
                  setFormWaterGoal(Math.max(500, formWaterGoal - 250));
                }
              }}
              onIncrement={() => {
                if (volumeUnit === 'oz') {
                  setFormWaterGoal(ozToMl(Math.min(340, mlToOz(formWaterGoal) + 8))); // max ~10L (340 oz)
                } else {
                  setFormWaterGoal(Math.min(10000, formWaterGoal + 250));
                }
              }}
              quickOptions={volumeUnit === 'oz'
                ? [50, 70, 90, 100].map((ozVal) => ({
                  key: ozVal, label: `${ozVal}oz`, selected: mlToOz(formWaterGoal) === ozVal, onPress: () => setFormWaterGoal(ozToMl(ozVal)),
                }))
                : [1500, 2000, 2500, 3000].map((w) => ({
                  key: w, label: `${w}`, selected: formWaterGoal === w, onPress: () => setFormWaterGoal(w),
                }))}
            />

            <View style={styles.divider} />

            <GoalDialRow
              icon="footsteps"
              iconColor={colors.lime}
              title="Daily Steps Target"
              displayValue={formStepsGoal.toLocaleString()}
              onDecrement={() => setFormStepsGoal(Math.max(2000, formStepsGoal - 1000))}
              onIncrement={() => setFormStepsGoal(Math.min(50000, formStepsGoal + 1000))}
              quickOptions={[5000, 8000, 10000, 12000].map((s) => ({
                key: s, label: `${s / 1000}k`, selected: formStepsGoal === s, onPress: () => setFormStepsGoal(s),
              }))}
            />

            <View style={styles.divider} />

            <GoalDialRow
              icon="fitness"
              iconColor={colors.amber}
              title="Weekly Workouts Target"
              displayValue={`${formWorkoutGoal} days`}
              onDecrement={() => setFormWorkoutGoal(Math.max(1, formWorkoutGoal - 1))}
              onIncrement={() => setFormWorkoutGoal(Math.min(7, formWorkoutGoal + 1))}
              quickOptions={[3, 4, 5, 6].map((w) => ({
                key: w, label: `${w}d`, selected: formWorkoutGoal === w, onPress: () => setFormWorkoutGoal(w),
              }))}
            />
          </GlassCard>
        </Animated.View>

        {/* â”€â”€â”€ Preferences Switches â”€â”€â”€ */}
        <Animated.View entering={FadeInUp.delay(200).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: '#6366F1' }]} />
            <Text style={styles.groupLabelText}>System Settings & Preferences</Text>
          </View>

          <GlassCard>
            {/* Dark Theme toggle */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
                <Ionicons name="moon" size={18} color="#6366F1" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Dark Theme Mode</Text>
                <Text style={styles.rowSub}>{isDarkMode ? 'Themed in dark mode' : 'Themed in light mode'}</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={(val) => { setIsDarkMode(val); triggerHaptic('medium'); }}
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={isDarkMode ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* Notifications toggle */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: colors.lime + '15' }]}>
                <Ionicons name="notifications" size={18} color={colors.lime} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Push Notifications Alerts</Text>
                <Text style={styles.rowSub}>{notifications ? 'Receive daily logs reminders' : 'Alerts are disabled'}</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={(val) => { setNotifications(val); triggerHaptic('light'); }}
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={notifications ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* Haptic feedback toggle */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: colors.amber + '15' }]}>
                <Ionicons name="pulse" size={18} color={colors.amber} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Micro Haptic Feedback</Text>
                <Text style={styles.rowSub}>{haptics ? 'Satisfying clicks enabled' : 'Touch feedback off'}</Text>
              </View>
              <Switch
                value={haptics}
                onValueChange={(val) => { setHaptics(val); triggerHaptic('light'); }}
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={haptics ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* Weight unit selector */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: colors.chart.protein + '15' }]}>
                <MaterialCommunityIcons name="scale-bathroom" size={18} color={colors.chart.protein} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Weight Unit Type</Text>
              </View>
              <View style={styles.pillToggle}>
                <TouchableOpacity style={[styles.pill, weightUnit === 'kg' && styles.pillActive]} onPress={() => { handleWeightUnitChange('kg'); triggerHaptic('selection'); }}>
                  <Text style={[styles.pillText, weightUnit === 'kg' && styles.pillTextActive]}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pill, weightUnit === 'lbs' && styles.pillActive]} onPress={() => { handleWeightUnitChange('lbs'); triggerHaptic('selection'); }}>
                  <Text style={[styles.pillText, weightUnit === 'lbs' && styles.pillTextActive]}>lbs</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Volume unit selector */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: colors.chart.water + '15' }]}>
                <Ionicons name="water" size={18} color={colors.chart.water} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Volume Liquid Unit</Text>
              </View>
              <View style={styles.pillToggle}>
                <TouchableOpacity style={[styles.pill, volumeUnit === 'ml' && styles.pillActive]} onPress={() => { setVolumeUnit('ml'); triggerHaptic('selection'); }}>
                  <Text style={[styles.pillText, volumeUnit === 'ml' && styles.pillTextActive]}>ml</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.pill, volumeUnit === 'oz' && styles.pillActive]} onPress={() => { setVolumeUnit('oz'); triggerHaptic('selection'); }}>
                  <Text style={[styles.pillText, volumeUnit === 'oz' && styles.pillTextActive]}>oz</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Diagnostic Haptic Test */}
            <PressableRow style={styles.row} onPress={handleTestHaptic}>
              <View style={[styles.iconBubble, { backgroundColor: colors.lime + '15' }]}>
                <Ionicons name="pulse" size={18} color={colors.lime} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Diagnostic Haptic Test</Text>
                <Text style={styles.rowSub}>Cycle and test mobile haptic vibrations</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>
          </GlassCard>
        </Animated.View>

        {/* â”€â”€â”€ Privacy & Security Preferences â”€â”€â”€ */}
        <Animated.View entering={FadeInUp.delay(220).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.groupLabelText}>Privacy & Security</Text>
          </View>

          <GlassCard>
            {/* Private profile mode toggle */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: colors.danger + '12' }]}>
                <Ionicons name="lock-closed" size={18} color={colors.danger} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Private Profile Mode</Text>
                <Text style={styles.rowSub}>{privateProfile ? 'Profile details hidden locally' : 'Public sharing active'}</Text>
              </View>
              <Switch
                value={privateProfile}
                onValueChange={(val) => { setPrivateProfile(val); triggerHaptic('medium'); }}
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={privateProfile ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* App lock toggle */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: '#6366F115' }]}>
                <Ionicons name="shield-checkmark" size={18} color="#6366F1" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>App Passcode Lock</Text>
                <Text style={styles.rowSub}>{appLock ? 'Require passcode on start' : 'App lock disabled'}</Text>
              </View>
              <Switch
                value={appLock}
                onValueChange={(val) => { setAppLock(val); triggerHaptic('medium'); }}
                trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
                thumbColor={appLock ? colors.lime : '#ccc'}
              />
            </View>

            <View style={styles.divider} />

            {/* Change password button */}
            <PressableRow style={styles.row} onPress={onResetPassword}>
              <View style={[styles.iconBubble, { backgroundColor: colors.amber + '15' }]}>
                <Ionicons name="key" size={18} color={colors.amber} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Change Account Password</Text>
                <Text style={styles.rowSub}>Send password reset instructions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>
          </GlassCard>
        </Animated.View>

        {/* â”€â”€â”€ Health & Fitness Apps â”€â”€â”€ */}
        <Animated.View entering={FadeInUp.delay(235).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.groupLabelText}>Health & Fitness Apps</Text>
          </View>

          <GlassCard accentColor="#EF4444">
            {/* Status row */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: '#EF444415' }]}>
                <Ionicons name="heart" size={18} color="#EF4444" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Health Connect</Text>
                <Text style={styles.rowSub}>
                  {hc.isAvailable === false
                    ? 'Not available on this device'
                    : 'Steps Â· Weight Â· Hydration Â· Heart Rate'}
                </Text>
              </View>
              <View style={[
                styles.hcStatusBadge,
                { backgroundColor: hc.isConnected ? colors.lime + '15' : colors.card, borderColor: hc.isConnected ? colors.lime + '30' : colors.cardBorder },
              ]}>
                <View style={[styles.hcStatusDot, { backgroundColor: hc.isConnected ? colors.lime : colors.muted + '50' }]} />
                <Text style={[styles.hcStatusText, { color: hc.isConnected ? colors.lime : colors.muted }]}>
                  {hc.isConnected ? 'On' : 'Off'}
                </Text>
              </View>
            </View>

            {/* Data chips */}
            <View style={styles.hcChipsRow}>
              {([
                { icon: 'footsteps', label: 'Steps' },
                { icon: 'barbell-outline', label: 'Weight' },
                { icon: 'water-outline', label: 'Water' },
                { icon: 'heart-outline', label: 'Heart Rate' },
              ] as const).map(({ icon, label }) => (
                <View key={label} style={styles.hcChip}>
                  <Ionicons name={icon} size={11} color={hc.isConnected ? colors.lime : colors.muted} />
                  <Text style={[styles.hcChipText, { color: hc.isConnected ? colors.lime : colors.muted }]}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Connect / Sync action */}
            <View style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowSub}>
                  {hc.lastSyncTime
                    ? `Last synced ${formatSyncTime(hc.lastSyncTime)}`
                    : hc.isConnected
                      ? 'Ready to sync your health data'
                      : 'Connect to import data from Health Connect'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.syncBtn,
                  { borderColor: '#EF4444', backgroundColor: '#EF444415' },
                  (hc.status === 'connecting' || hc.status === 'syncing') && { opacity: 0.6 },
                ]}
                onPress={hc.isConnected ? handleHealthSync : handleHealthConnect}
                disabled={hc.status === 'connecting' || hc.status === 'syncing' || hc.isAvailable === false}
              >
                {(hc.status === 'connecting' || hc.status === 'syncing') ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Text style={[styles.syncBtnTxt, { color: '#EF4444' }]}>
                    {hc.isConnected ? 'Sync Now' : 'Connect'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Last sync result summary */}
            {hc.lastSyncResult && hc.status === 'idle' && (
              <Animated.View entering={FadeIn.duration(300)} style={styles.hcResultRow}>
                <View style={styles.hcResultItem}>
                  <Text style={styles.hcResultValue}>{hc.lastSyncResult.steps.toLocaleString()}</Text>
                  <Text style={styles.hcResultLabel}>steps today</Text>
                </View>
                <View style={styles.hcResultDivider} />
                <View style={styles.hcResultItem}>
                  <Text style={styles.hcResultValue}>{hc.lastSyncResult.weightLogs}</Text>
                  <Text style={styles.hcResultLabel}>weight added</Text>
                </View>
                <View style={styles.hcResultDivider} />
                <View style={styles.hcResultItem}>
                  <Text style={styles.hcResultValue}>{hc.lastSyncResult.waterLogs}</Text>
                  <Text style={styles.hcResultLabel}>water added</Text>
                </View>
              </Animated.View>
            )}
          </GlassCard>
        </Animated.View>

        {/* â”€â”€â”€ Privacy, Data & Actions â”€â”€â”€ */}
        <Animated.View entering={FadeInUp.delay(250).springify().damping(18)}>
          <View style={styles.groupLabel}>
            <View style={[styles.groupDot, { backgroundColor: colors.danger }]} />
            <Text style={styles.groupLabelText}>Privacy & Data Actions</Text>
          </View>

          <GlassCard>
            {/* Sync DB Status */}
            <View style={styles.row}>
              <View style={[styles.iconBubble, { backgroundColor: 'rgba(52,211,153,0.12)' }]}>
                <Ionicons name="cloud-done-outline" size={18} color={colors.lime} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Database Cloud Backup</Text>
                <Text style={styles.rowSub}>{user.email ? 'Connected & active' : 'Offline local database mode'}</Text>
              </View>
              <TouchableOpacity style={styles.syncBtn} onPress={onManualSync} disabled={showSyncing}>
                <Text style={styles.syncBtnTxt}>{showSyncing ? 'Syncing...' : 'Sync Now'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Export JSON logs */}
            <PressableRow style={styles.row} onPress={onExportData}>
              <View style={[styles.iconBubble, { backgroundColor: colors.chart.fibre + '15' }]}>
                <Ionicons name="download-outline" size={18} color={colors.chart.fibre} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Export Fitness Data Logs</Text>
                <Text style={styles.rowSub}>Share JSON file containing all logs</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>

            <View style={styles.divider} />

            {/* Replay splash screen */}
            <PressableRow style={styles.row} onPress={() => setShowSplashPreview(true)}>
              <View style={[styles.iconBubble, { backgroundColor: colors.lime + '15' }]}>
                <Ionicons name="play-circle-outline" size={18} color={colors.lime} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Replay Splash Entrance</Text>
                <Text style={styles.rowSub}>Watch startup animations</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>

            <View style={styles.divider} />

            {/* Clear history */}
            <PressableRow style={styles.row} onPress={() => { setClearConfirmText(''); setShowClearModal(true); }}>
              <View style={[styles.iconBubble, { backgroundColor: colors.danger + '12' }]}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowTitle, { color: colors.danger }]}>Clear Data History</Text>
                <Text style={styles.rowSub}>Wipe all local and cloud logs</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.danger + '88'} />
            </PressableRow>
          </GlassCard>
        </Animated.View>

        {/* â”€â”€â”€ Legal / Privacy Policy â”€â”€â”€ */}
        <Animated.View entering={FadeInUp.delay(300).springify().damping(18)}>
          <GlassCard>
            <PressableRow style={styles.row} onPress={() => setShowDocModal({ visible: true, title: 'Privacy Policy', content: 'Your health and workout logs are stored locally on your device using encrypted sandbox directories. Vividly does not sell, distribute, or trace your personal telemetry logs. Backups are stored in Supabase with standard TLS encryption protocols.' })}>
              <View style={[styles.iconBubble, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.muted} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>

            <View style={styles.divider} />

            <PressableRow style={styles.row} onPress={() => setShowDocModal({ visible: true, title: 'Terms of Service', content: 'By utilizing Vividly, you acknowledge that all metabolic calculations (BMR, TDEE, BMI, macro targets) are estimated based on mathematical algorithms (Mifflin-St Jeor). Always consult a healthcare professional before starting extreme dieting regimes.' })}>
              <View style={[styles.iconBubble, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.muted} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </PressableRow>
          </GlassCard>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(320).springify()}>
          <TouchableOpacity style={styles.saveMainBtn} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            <Text style={styles.saveMainBtnTxt}>Save Settings Changes</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Log Out */}
        <Animated.View entering={FadeInDown.delay(340).springify()}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={styles.logoutBtnTxt}>Log Out of Account</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Version */}
        <View style={styles.versionBlock}>
          <Text style={styles.versionText}>Vividly Premium v1.0.0</Text>
          <Text style={styles.versionSub}>Made with ðŸ’š and spring physics</Text>
        </View>
      </ScrollView>

      {/* â”€â”€â”€ Camera / Gallery Action Sheet DP â”€â”€â”€ */}
      <Modal visible={actionSheetVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCloseActionSheet}>
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle}>Select Display Photo</Text>

            <TouchableOpacity style={styles.actionRow} onPress={onPickImage}>
              <Ionicons name="image" size={20} color={colors.lime} />
              <Text style={styles.actionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={onTakePhoto}>
              <Ionicons name="camera" size={20} color={colors.lime} />
              <Text style={styles.actionText}>Take Photo with Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={onCloseActionSheet}>
              <Ionicons name="close-circle" size={20} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* â”€â”€â”€ Clear History Modal â”€â”€â”€ */}
      <Modal visible={showClearModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
          <KeyboardSlideView style={[styles.actionSheet, { borderTopWidth: 2, borderColor: colors.danger + '40', paddingBottom: 0, maxHeight: '92%' }]}>
            <View style={[styles.actionSheetHandle, { backgroundColor: colors.danger + '40' }]} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 36 : 16 }}
            >
            <View style={styles.dangerHeader}>
              <Ionicons name="warning" size={32} color={colors.danger} />
              <Text style={styles.dangerTitle}>Clear History</Text>
            </View>
            <Text style={styles.dangerDesc}>
              Choose what to clear. Local removes device cache only. Cloud wipes your Supabase records permanently.
            </Text>

            {/* Target selector */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => setClearTarget('local')}
                style={[styles.clearTargetBtn, clearTarget === 'local' && { borderColor: colors.danger, backgroundColor: colors.danger + '12' }]}
              >
                <Ionicons name="phone-portrait-outline" size={20} color={clearTarget === 'local' ? colors.danger : colors.muted} />
                <Text style={[styles.clearTargetLabel, clearTarget === 'local' && { color: colors.danger }]}>Local Device</Text>
                <Text style={styles.clearTargetSub}>Cache only{'\n'}Cloud preserved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setClearTarget('cloud')}
                style={[styles.clearTargetBtn, clearTarget === 'cloud' && { borderColor: colors.danger, backgroundColor: colors.danger + '12' }]}
              >
                <Ionicons name="cloud-outline" size={20} color={clearTarget === 'cloud' ? colors.danger : colors.muted} />
                <Text style={[styles.clearTargetLabel, clearTarget === 'cloud' && { color: colors.danger }]}>Cloud DB</Text>
                <Text style={styles.clearTargetSub}>Supabase tables{'\n'}Local preserved</Text>
              </TouchableOpacity>
            </View>

            {clearTarget && !clearResult && (
              <>
                {/* CLEAR character progress slots */}
                <View style={styles.clearProgress}>
                  {'CLEAR'.split('').map((char, i) => {
                    const typedUpper = clearConfirmText.toUpperCase();
                    const isCorrect = typedUpper.length > i && typedUpper[i] === char;
                    return (
                      <Animated.View
                        key={i}
                        entering={FadeIn.delay(i * 60).springify()}
                        style={[styles.clearProgressChar, isCorrect && styles.clearProgressCharFilled]}
                      >
                        <Text style={[styles.clearProgressCharText, isCorrect && styles.clearProgressCharTextFilled]}>
                          {char}
                        </Text>
                      </Animated.View>
                    );
                  })}
                </View>

                <Text style={styles.confirmLabel}>Type CLEAR to confirm:</Text>
                <View style={[
                  styles.inputFieldWrap,
                  {
                    borderColor: isReadyToConfirm ? colors.lime : colors.danger + '50',
                    marginBottom: 16,
                    backgroundColor: isReadyToConfirm ? colors.lime + '08' : 'transparent',
                  },
                ]}>
                  <TextInput
                    style={[styles.textInput, {
                      color: isReadyToConfirm ? colors.lime : colors.danger,
                      letterSpacing: 4,
                      fontWeight: '700',
                    }]}
                    value={clearConfirmText}
                    onChangeText={setClearConfirmText}
                    placeholder="CLEAR"
                    placeholderTextColor={colors.danger + '30'}
                    autoCapitalize="characters"
                  />
                  {isReadyToConfirm && (
                    <Animated.View entering={ZoomIn.springify()}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.lime} />
                    </Animated.View>
                  )}
                </View>

                <Animated.View style={[confirmBtnAnimStyle, { marginBottom: 4 }]}>
                  <TouchableOpacity
                    style={[styles.dangerConfirmBtn, isReadyToConfirm && styles.dangerConfirmBtnReady]}
                    disabled={!isReadyToConfirm || isClearing}
                    onPress={clearTarget === 'local' ? onClearLocal : onClearCloud}
                  >
                    {isClearing ? (
                      <>
                        <ActivityIndicator size="small" color={colors.white} />
                        <Text style={styles.dangerConfirmBtnText}>Clearing...</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="trash" size={18} color={colors.white} />
                        <Text style={styles.dangerConfirmBtnText}>
                          {clearTarget === 'local' ? 'Clear Local Cache' : 'Wipe Cloud Records'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}

            {/* Animated result feedback */}
            {clearResult && (
              <Animated.View entering={FadeIn.duration(180)} style={styles.resultContent}>
                {/* Icon with glow behind */}
                <View style={styles.resultIconContainer}>
                  <Animated.View style={[
                    styles.resultGlow,
                    { backgroundColor: clearResult === 'success' ? colors.lime : colors.danger },
                    resultGlowAnimStyle,
                  ]} />
                  <Animated.View style={[
                    styles.resultIconWrap,
                    {
                      borderColor: clearResult === 'success' ? colors.lime + '50' : colors.danger + '50',
                      backgroundColor: clearResult === 'success' ? colors.lime + '12' : colors.danger + '12',
                      shadowColor: clearResult === 'success' ? colors.lime : colors.danger,
                    },
                    resultIconAnimStyle,
                  ]}>
                    <Ionicons
                      name={clearResult === 'success' ? 'checkmark' : 'close'}
                      size={40}
                      color={clearResult === 'success' ? colors.lime : colors.danger}
                    />
                  </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
                  <Text style={[styles.resultTitle, { color: clearResult === 'success' ? colors.lime : colors.danger }]}>
                    {clearResult === 'success' ? 'All Clear' : 'Failed'}
                  </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).springify().damping(20)}>
                  <Text style={styles.resultSub}>
                    {clearResult === 'success'
                      ? `${clearTarget === 'local' ? 'Local cache' : 'Cloud records'} wiped successfully`
                      : 'Something went wrong. Please try again.'}
                  </Text>
                </Animated.View>
              </Animated.View>
            )}

            {!clearResult && (
              <TouchableOpacity style={styles.cancelBtn} onPress={closeClearModal}>
                <Text style={styles.cancelBtnTxt}>Cancel</Text>
              </TouchableOpacity>
            )}
            </ScrollView>
          </KeyboardSlideView>
        </KeyboardAvoidingView>
      </Modal>

      {/* â”€â”€â”€ Legal Documents Viewer Modal â”€â”€â”€ */}
      <Modal visible={showDocModal.visible} transparent animationType="slide">
        <View style={styles.backdrop}>
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.docTitle}>{showDocModal.title}</Text>
              <TouchableOpacity style={styles.closeBtnSmall} onPress={() => setShowDocModal({ visible: false, title: '', content: '' })}>
                <Ionicons name="close" size={18} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.docContent}>{showDocModal.content}</Text>
            <TouchableOpacity style={styles.saveMainBtn} onPress={() => setShowDocModal({ visible: false, title: '', content: '' })}>
              <Text style={styles.saveMainBtnTxt}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* â”€â”€â”€ Fullscreen Animated Splash Preview â”€â”€â”€ */}
      {showSplashPreview && (
        <Modal visible={true} transparent={false} animationType="none" statusBarTranslucent>
          <AnimatedSplashScreen
            isAppReady={false}
            preview
            onPreviewDismiss={() => setShowSplashPreview(false)}
          />
        </Modal>
      )}
    </View>
  );
}

// â”€â”€â”€ Styles Stylesheet Factory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16 },

  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.lime + '18',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.lime + '40',
  },
  avatarImage: { width: 62, height: 62, borderRadius: 31 },
  avatarText: { ...Typography.h2, color: colors.lime },
  avatarCameraBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.lime,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.card,
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { ...Typography.h3, color: colors.text.primary },
  profileEmail: { ...Typography.caption, color: colors.text.secondary },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.lime + '12',
    borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  levelText: { fontSize: 9, fontWeight: '700', color: colors.lime },

  groupLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 4 },
  groupDot: { width: 6, height: 6, borderRadius: 3 },
  groupLabelText: { ...Typography.captionBold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  inputGroup: { gap: 6, marginBottom: 12 },
  inputLabel: { ...Typography.captionBold, color: colors.text.primary },
  inputFieldWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    paddingHorizontal: 12, height: 46,
  },
  inputFieldError: { borderColor: colors.danger, backgroundColor: colors.danger + '05' },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, ...Typography.body, color: colors.text.primary, padding: 0 },
  errorText: { fontSize: 10, fontWeight: '600', color: colors.danger, marginTop: 2 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },

  presetsRow: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  presetItem: { alignItems: 'center', gap: 4 },
  presetImage: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: colors.cardBorder },
  presetLabel: { fontSize: 10, color: colors.text.secondary },

  // Goal Cards
  goalCard: { paddingVertical: 10 },
  goalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  goalCardTitle: { ...Typography.bodyBold, color: colors.text.primary, flex: 1 },
  goalCardValue: { ...Typography.bodyBold, color: colors.text.primary },
  adjustRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between' },
  adjustBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  quickPillRow: { flexDirection: 'row', gap: 6, flex: 1, justifyContent: 'center' },
  quickGoalPill: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  quickGoalPillText: { fontSize: 11, fontWeight: '600', color: colors.text.secondary },

  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 12 },

  // Row preferences
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  iconBubble: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  rowContent: { flex: 1, gap: 2 },
  rowTitle: { ...Typography.bodyBold, color: colors.text.primary },
  rowSub: { ...Typography.caption, color: colors.text.secondary },
  pillToggle: { flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: Radius.pill, padding: 3, borderWidth: 1, borderColor: colors.cardBorder },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  pillActive: { backgroundColor: colors.lime },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.text.secondary },
  pillTextActive: { color: colors.white },

  syncBtn: { backgroundColor: colors.lime + '15', borderWidth: 1, borderColor: colors.lime, borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  syncBtnTxt: { fontSize: 11, fontWeight: '700', color: colors.lime },

  // Action Buttons
  saveMainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.lime, borderRadius: Radius.pill, paddingVertical: 16,
    shadowColor: colors.lime, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
    marginTop: 10,
  },
  saveMainBtnTxt: { ...Typography.bodyBold, color: colors.white },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.danger + '12', borderRadius: Radius.pill, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.danger + '30',
    marginTop: 8,
  },
  logoutBtnTxt: { ...Typography.bodyBold, color: colors.danger },
  versionBlock: { alignItems: 'center', marginTop: 24, gap: 2 },
  versionText: { ...Typography.captionBold, color: colors.text.secondary },
  versionSub: { ...Typography.micro, color: colors.muted },

  // Backdrop / ActionSheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  actionSheet: {
    backgroundColor: colors.ivory, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  actionSheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.muted + '30', alignSelf: 'center', marginBottom: 20 },
  actionSheetTitle: { ...Typography.h3, color: colors.text.primary, textAlign: 'center', marginBottom: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  actionText: { ...Typography.bodyBold, color: colors.text.primary },

  // Danger sheet
  dangerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  dangerTitle: { ...Typography.h3, color: colors.danger },
  dangerDesc: { ...Typography.body, color: colors.text.secondary, marginBottom: 16, lineHeight: 20 },
  confirmLabel: { ...Typography.captionBold, color: colors.danger, marginBottom: 6 },
  dangerConfirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.danger, borderRadius: Radius.pill, paddingVertical: 16,
  },
  dangerConfirmBtnText: { ...Typography.bodyBold, color: colors.white },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 6 },
  cancelBtnTxt: { ...Typography.bodyBold, color: colors.text.secondary },
  clearTargetBtn: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 10,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  clearTargetLabel: { ...Typography.captionBold, color: colors.text.primary },
  clearTargetSub: { ...Typography.micro, color: colors.muted, textAlign: 'center', lineHeight: 15 },

  clearProgress: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  clearProgressChar: {
    width: 44,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearProgressCharFilled: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '15',
  },
  clearProgressCharText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 1,
  },
  clearProgressCharTextFilled: {
    color: colors.danger,
  },
  dangerConfirmBtnReady: {
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  resultContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 8,
    minHeight: 220,
  },
  resultIconContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  resultGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  resultIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 10,
  },
  resultTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  resultSub: {
    ...Typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  // Docs
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  docTitle: { ...Typography.h3, color: colors.text.primary },
  closeBtnSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  docContent: { ...Typography.body, color: colors.text.secondary, lineHeight: 22, marginBottom: 20 },

  // Health Connect
  hcStatusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.pill, borderWidth: 1,
  },
  hcStatusDot: { width: 6, height: 6, borderRadius: 3 },
  hcStatusText: { fontSize: 11, fontWeight: '700' },
  hcChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2, marginBottom: 6 },
  hcChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: Radius.pill, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  hcChipText: { fontSize: 10, fontWeight: '600' },
  hcResultRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: Radius.lg,
    padding: 12, marginTop: 4, borderWidth: 1, borderColor: colors.cardBorder,
  },
  hcResultItem: { flex: 1, alignItems: 'center', gap: 2 },
  hcResultValue: { fontSize: 17, fontWeight: '800', color: colors.text.primary },
  hcResultLabel: { fontSize: 10, fontWeight: '600', color: colors.text.secondary },
  hcResultDivider: { width: 1, height: 28, backgroundColor: colors.cardBorder },

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
});
