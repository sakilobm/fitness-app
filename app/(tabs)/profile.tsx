import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import * as ImagePicker from 'expo-image-picker';
import { useProfileSettings } from '@/store/fitnessStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
import Animated, {
  FadeInUp, FadeInDown,
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, interpolate,
} from 'react-native-reanimated';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconDef =
  | { lib: 'Ionicons'; name: IoniconName }
  | { lib: 'MCI'; name: MCIName };

function AppIcon({ icon, size, color }: { icon: IconDef; size: number; color: string }) {
  if (icon.lib === 'MCI') return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  return <Ionicons name={icon.name} size={size} color={color} />;
}

interface Badge {
  id: string;
  icon: IconDef;
  label: string;
  unlocked: boolean;
  color: string;
}



const AVATAR_PRESETS = [
  { id: 'av1', label: 'Strength', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Runner', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=150&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Yoga', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Trainer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'Boxing', url: 'https://images.unsplash.com/photo-1491756906593-95123989ad30?w=150&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Cyclist', url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=150&auto=format&fit=crop&q=80' },
];

// ─── Spring-press animated row ────────────────────────────────────────────────
// Each settings row uses this for a satisfying scale+opacity micro-interaction
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
function PressableRow({ onPress, children, style }: { onPress?: () => void; children: React.ReactNode; style?: any }) {
  const scale   = useSharedValue(1);
  const opacity = useSharedValue(1);
  const aStyle  = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  const handleIn  = () => { scale.value = withSpring(0.97, { damping: 18, stiffness: 300 }); opacity.value = withTiming(0.85, { duration: 80 }); };
  const handleOut = () => { scale.value = withSpring(1,    { damping: 14, stiffness: 200 }); opacity.value = withTiming(1,    { duration: 120 }); };
  return (
    <AnimatedTouchable
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handleIn}
      onPressOut={handleOut}
      style={[aStyle, style]}
    >
      {children}
    </AnimatedTouchable>
  );
}

export default function ProfileScreen() {
  const { colors, isDark: isDarkMode, setIsDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
  const sS = React.useMemo(() => getSS(colors, isDarkMode), [colors, isDarkMode]);

  const BADGES = React.useMemo<Badge[]>(() => [
    { id: 'b1', icon: { lib: 'Ionicons', name: 'flame' }, label: '7-Day Streak', unlocked: true, color: colors.amber },
    { id: 'b2', icon: { lib: 'Ionicons', name: 'water' }, label: 'Hydration Pro', unlocked: true, color: colors.chart.water },
    { id: 'b3', icon: { lib: 'MCI', name: 'scale-bathroom' }, label: '5kg Lost', unlocked: true, color: colors.lime },
    { id: 'b4', icon: { lib: 'MCI', name: 'dumbbell' }, label: 'Iron Will', unlocked: true, color: colors.lime },
    { id: 'b5', icon: { lib: 'MCI', name: 'food-apple' }, label: 'Macro Master', unlocked: false, color: colors.chart.carbs },
    { id: 'b6', icon: { lib: 'Ionicons', name: 'camera' }, label: 'Photo Journey', unlocked: false, color: colors.lime },
    { id: 'b7', icon: { lib: 'MCI', name: 'run' }, label: 'Step Crusher', unlocked: false, color: '#6366F1' },
    { id: 'b8', icon: { lib: 'MCI', name: 'pill' }, label: 'Supplement King', unlocked: false, color: colors.chart.fibre },
  ], [colors]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser } = useProfileSettings();
  const logoutUser = async () => {
    await supabase.auth.signOut();
  };

  
  const [notifications, setNotifications] = useState(true);
  const [unitKg, setUnitKg] = useState(true);
  const [unitMl, setUnitMl] = useState(true);
  const [showSplashPreview, setShowSplashPreview] = useState(false);

  // Profile Dashboard Editable State variables (Option A - Recommended)
  const userName = user.name;
  const userAge = user.age.toString();
  const userHeight = user.height.toString();
  const userWeight = user.weight.toString();
  const userGoal = user.goal;
  const userMotto = user.motto;
  const userProfilePic = user.profilePic || '';

  // Advanced Goals state variables (Option A - Recommended)
  const waterGoal = user.waterGoal.toString();
  const calorieGoal = user.calorieGoal.toString();
  const stepsGoal = user.stepsGoal.toString();
  const workoutGoal = user.workoutGoal.toString();

  // Modal Control and Editing Form States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'advanced'>('basic');
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formHeight, setFormHeight] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formGoal, setFormGoal] = useState('');
  const [formMotto, setFormMotto] = useState('');
  const [formWaterGoal, setFormWaterGoal] = useState('');
  const [formCalorieGoal, setFormCalorieGoal] = useState('');
  const [formStepsGoal, setFormStepsGoal] = useState('');
  const [formWorkoutGoal, setFormWorkoutGoal] = useState('');
  const [formProfilePic, setFormProfilePic] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const pickImageFromGallery = async () => {
    setActionSheetVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to select a display picture!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFormProfilePic(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Image picker error: ', e);
    }
  };

  const takePhotoWithCamera = async () => {
    setActionSheetVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to capture a profile photo!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFormProfilePic(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Camera capture error: ', e);
    }
  };

  // Compute initials dynamically
  const initials = userName
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Compute dynamic stats list
  const userStats = [
    { label: 'Age', value: `${userAge}`, icon: 'calendar-outline' as IoniconName, color: '#6366F1' },
    { label: 'Height', value: `${userHeight} cm`, icon: 'resize-outline' as IoniconName, color: colors.lime },
    { label: 'Weight', value: `${userWeight} kg`, icon: 'barbell-outline' as IoniconName, color: colors.amber },
    { label: 'Goal', value: userGoal, icon: (userGoal === 'Gain Muscle' ? 'trending-up-outline' : userGoal === 'Stay Fit' ? 'body-outline' : 'trending-down-outline') as IoniconName, color: colors.chart.calories },
  ];

  // Compute dynamic weekly summary based on goals
  const weekSummary: { icon: IconDef; label: string; value: string; color: string }[] = [
    { icon: { lib: 'MCI' as const, name: 'dumbbell' as const }, label: 'Workouts', value: `${workoutGoal}`, color: colors.lime },
    { icon: { lib: 'Ionicons' as const, name: 'trophy' as const }, label: 'Goals Hit', value: '18/21', color: colors.amber },
    { icon: { lib: 'Ionicons' as const, name: 'flame' as const }, label: 'Streak', value: '14d', color: colors.amber },
    { icon: { lib: 'Ionicons' as const, name: 'water' as const }, label: 'Avg Water', value: `${(parseFloat(waterGoal) / 1000).toFixed(1)}L`, color: colors.chart.water },
  ];

  // Open modal with current settings loaded into form state
  const openEditModal = () => {
    setFormName(userName);
    setFormAge(userAge);
    setFormHeight(userHeight);
    setFormWeight(userWeight);
    setFormGoal(userGoal);
    setFormMotto(userMotto);
    setFormWaterGoal(waterGoal);
    setFormCalorieGoal(calorieGoal);
    setFormStepsGoal(stepsGoal);
    setFormWorkoutGoal(workoutGoal);
    setFormProfilePic(userProfilePic);
    setFormErrors({});
    setActiveFormTab('basic');
    setEditModalVisible(true);
  };

  // Form Validation & Save Function (Option A - Recommended)
  const handleSaveProfile = () => {
    const errors: Record<string, string> = {};

    // Basic fields validation
    if (!formName.trim()) {
      errors.name = 'Full name is required';
    }

    const ageNum = parseInt(formAge, 10);
    if (!formAge || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      errors.age = 'Invalid age';
    }

    const heightNum = parseFloat(formHeight);
    if (!formHeight || isNaN(heightNum) || heightNum <= 50 || heightNum > 250) {
      errors.height = 'Invalid height';
    }

    const weightNum = parseFloat(formWeight);
    if (!formWeight || isNaN(weightNum) || weightNum <= 10 || weightNum > 500) {
      errors.weight = 'Invalid weight';
    }

    // Advanced fields validation
    const waterNum = parseInt(formWaterGoal, 10);
    if (!formWaterGoal || isNaN(waterNum) || waterNum < 500 || waterNum > 10000) {
      errors.waterGoal = 'Range: 500 - 10000 ml';
    }

    const calNum = parseInt(formCalorieGoal, 10);
    if (!formCalorieGoal || isNaN(calNum) || calNum < 500 || calNum > 10000) {
      errors.calorieGoal = 'Range: 500 - 10000 kcal';
    }

    const stepsNum = parseInt(formStepsGoal, 10);
    if (!formStepsGoal || isNaN(stepsNum) || stepsNum < 1000 || stepsNum > 50000) {
      errors.stepsGoal = 'Range: 1000 - 50000';
    }

    // If there are validation errors, set error state and stop saving
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Switch tab to the one with the error so user sees it
      if (errors.name || errors.age || errors.height || errors.weight) {
        setActiveFormTab('basic');
      } else {
        setActiveFormTab('advanced');
      }
      return;
    }

    // Propagate all values back to global store state
    setUser({
      name: formName.trim(),
      age: ageNum,
      height: heightNum,
      weight: weightNum,
      goal: formGoal,
      motto: formMotto.trim(),
      calorieGoal: calNum,
      waterGoal: waterNum,
      stepsGoal: stepsNum,
      workoutGoal: parseInt(formWorkoutGoal, 10) || 4,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      profilePic: formProfilePic,
    });

    // Close the Modal
    setEditModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Profile"
        subtitle="MY ACCOUNT"
        icon={{ lib: 'Ionicons', name: 'person' }}
        accentColor={colors.lime}
        rightIcon="create-outline"
        onRightPress={openEditModal}
      />

      {/* Profile header card */}
      <GlassCard accentColor={colors.lime}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            {user.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
            <View style={styles.avatarDot} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            {user.email ? (
              <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
            ) : null}
            <Text style={styles.profileMotto} numberOfLines={1}>"{userMotto}"</Text>

            <View style={styles.profileHeaderActions}>
              <View style={styles.levelBadge}>
                <Ionicons name="flash" size={11} color={colors.lime} />
                <Text style={styles.levelText}>Level 8 · 2,840 XP</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={openEditModal} activeOpacity={0.75}>
                <Ionicons name="create" size={11} color={colors.lime} />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.xpBarTrack}>
              <View style={styles.xpBarFill} />
            </View>
            <Text style={styles.xpSub}>1,160 XP to Level 9</Text>
          </View>
        </View>
      </GlassCard>

      {/* Dynamic Stats Grid */}
      <GlassCard>
        <SectionHeader title="My Stats" accentColor="#6366F1" />
        <View style={styles.statsGrid}>
          {userStats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <View style={[styles.statIconWrap, { backgroundColor: s.color + '12' }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Dynamic Weekly Summary card */}
      <GlassCard accentColor={colors.amber}>
        <SectionHeader title="This Week" accentColor={colors.amber} />
        <View style={styles.weekRow}>
          {weekSummary.map((w) => (
            <View key={w.label} style={styles.weekItem}>
              <View style={[styles.weekIconWrap, { backgroundColor: w.color + '15', borderColor: w.color + '30' }]}>
                <AppIcon icon={w.icon} size={22} color={w.color} />
              </View>
              <Text style={[styles.weekVal, { color: w.color }]}>{w.value}</Text>
              <Text style={styles.weekLabel}>{w.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Achievements Achievements badge row */}
      <GlassCard>
        <SectionHeader
          title="Achievements"
          action={`${BADGES.filter((b) => b.unlocked).length}/${BADGES.length}`}
          accentColor={colors.amber}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
          <View style={styles.badgeRow}>
            {BADGES.map((badge) => (
              <View key={badge.id} style={[styles.badgeItem, !badge.unlocked && styles.badgeLocked]}>
                <View style={[
                  styles.badgeCircle,
                  badge.unlocked && {
                    backgroundColor: badge.color + '12',
                    borderColor: badge.color + '55',
                    shadowColor: badge.color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                  },
                ]}>
                  <AppIcon
                    icon={badge.icon}
                    size={24}
                    color={badge.unlocked ? badge.color : colors.muted}
                  />
                </View>
                <Text style={[styles.badgeLabel, !badge.unlocked && styles.badgeLabelLocked]}>
                  {badge.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </GlassCard>

      {/* Dynamic Goal progress */}
      <GlassCard accentColor={colors.amber}>
        <SectionHeader title="Goal Progress" accentColor={colors.amber} />
        <View style={styles.goalRow}>
          <ProgressRing size={100} strokeWidth={10} progress={0.46} color={colors.amber}>
            <Text style={styles.goalPct}>46%</Text>
          </ProgressRing>
          <View style={styles.goalText}>
            <Text style={styles.goalTitle}>{userGoal}</Text>
            <Text style={styles.goalSub}>Current: {userWeight} kg → Target: {userGoal === 'Gain Muscle' ? '85.0 kg' : userGoal === 'Stay Fit' ? 'Maintain' : '72.0 kg'}</Text>
            <Text style={styles.goalEta}>{userGoal === 'Stay Fit' ? 'Awesome! Keep up active routines' : 'Est. 9 weeks at current pace'}</Text>
            <View style={styles.goalBadge}>
              <Ionicons name={userGoal === 'Gain Muscle' ? 'trending-up' : userGoal === 'Stay Fit' ? 'body' : 'trending-down'} size={11} color={colors.amber} />
              <Text style={styles.goalBadgeText}>
                {userGoal === 'Gain Muscle' ? '6.6 kg remaining' : userGoal === 'Stay Fit' ? 'Active lifestyle' : '6.4 kg remaining'}
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* ══ SETTINGS ══════════════════════════════════════════════════════════ */}

      {/* Group 1 — Actions */}
      <Animated.View entering={FadeInUp.delay(100).springify().damping(18)}>
        <View style={sS.groupLabel}>
          <View style={[sS.groupDot, { backgroundColor: colors.lime }]} />
          <Text style={sS.groupLabelText}>Actions</Text>
        </View>
        <View style={sS.card}>
          <PressableRow style={sS.row} onPress={() => router.push('/(auth)/setup')}>
            <View style={[sS.iconBubble, { backgroundColor: colors.bubble.green }]}>
              <Ionicons name="sparkles" size={18} color={colors.lime} />
            </View>
            <View style={sS.rowContent}>
              <Text style={[sS.rowTitle, { color: colors.lime }]}>Recalibrate Fitness Engine</Text>
              <Text style={sS.rowSub}>Re-run setup wizard</Text>
            </View>
            <View style={sS.chevronWrap}>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </View>
          </PressableRow>

          <View style={sS.divider} />

          <PressableRow style={sS.row} onPress={() => setShowSplashPreview(true)}>
            <View style={[sS.iconBubble, { backgroundColor: 'rgba(46,125,94,0.15)' }]}>
              <Ionicons name="flash" size={18} color="#2E7D5E" />
            </View>
            <View style={sS.rowContent}>
              <Text style={sS.rowTitle}>Preview Splash Screen</Text>
              <Text style={sS.rowSub}>Watch the startup animation</Text>
            </View>
            <View style={sS.chevronWrap}>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </View>
          </PressableRow>
        </View>
      </Animated.View>

      {/* Group 2 — Preferences */}
      <Animated.View entering={FadeInUp.delay(180).springify().damping(18)}>
        <View style={sS.groupLabel}>
          <View style={[sS.groupDot, { backgroundColor: '#6366F1' }]} />
          <Text style={sS.groupLabelText}>Preferences</Text>
        </View>
        <View style={sS.card}>
          {/* Dark Theme toggle */}
          <View style={sS.row}>
            <View style={[sS.iconBubble, { backgroundColor: '#6366F115' }]}>
              <Ionicons name="moon" size={18} color="#6366F1" />
            </View>
            <View style={sS.rowContent}>
              <Text style={sS.rowTitle}>Dark Theme</Text>
              <Text style={sS.rowSub}>{isDarkMode ? 'Dark mode on' : 'Light mode on'}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
              thumbColor={isDarkMode ? colors.lime : '#ccc'}
            />
          </View>

          <View style={sS.divider} />

          {/* Notifications toggle */}
          <View style={sS.row}>
            <View style={[sS.iconBubble, { backgroundColor: colors.lime + '18' }]}>
              <Ionicons name="notifications" size={18} color={colors.lime} />
            </View>
            <View style={sS.rowContent}>
              <Text style={sS.rowTitle}>Push Notifications</Text>
              <Text style={sS.rowSub}>{notifications ? 'Enabled' : 'Disabled'}</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: 'rgba(0,0,0,0.10)', true: colors.lime + '99' }}
              thumbColor={notifications ? colors.lime : '#ccc'}
            />
          </View>

          <View style={sS.divider} />

          {/* Weight unit pill */}
          <View style={sS.row}>
            <View style={[sS.iconBubble, { backgroundColor: colors.amber + '18' }]}>
              <MaterialCommunityIcons name="scale-bathroom" size={18} color={colors.amber} />
            </View>
            <View style={sS.rowContent}>
              <Text style={sS.rowTitle}>Weight Unit</Text>
            </View>
            <View style={sS.pillToggle}>
              <TouchableOpacity
                style={[sS.pill, unitKg && sS.pillActive]}
                onPress={() => setUnitKg(true)}
              >
                <Text style={[sS.pillText, unitKg && sS.pillTextActive]}>kg</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[sS.pill, !unitKg && sS.pillActive]}
                onPress={() => setUnitKg(false)}
              >
                <Text style={[sS.pillText, !unitKg && sS.pillTextActive]}>lbs</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={sS.divider} />

          {/* Volume unit pill */}
          <View style={sS.row}>
            <View style={[sS.iconBubble, { backgroundColor: colors.chart.water + '18' }]}>
              <Ionicons name="water" size={18} color={colors.chart.water} />
            </View>
            <View style={sS.rowContent}>
              <Text style={sS.rowTitle}>Volume Unit</Text>
            </View>
            <View style={sS.pillToggle}>
              <TouchableOpacity
                style={[sS.pill, unitMl && sS.pillActive]}
                onPress={() => setUnitMl(true)}
              >
                <Text style={[sS.pillText, unitMl && sS.pillTextActive]}>ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[sS.pill, !unitMl && sS.pillActive]}
                onPress={() => setUnitMl(false)}
              >
                <Text style={[sS.pillText, !unitMl && sS.pillTextActive]}>oz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Group 3 — Privacy & Data */}
      <Animated.View entering={FadeInUp.delay(260).springify().damping(18)}>
        <View style={sS.groupLabel}>
          <View style={[sS.groupDot, { backgroundColor: colors.danger }]} />
          <Text style={sS.groupLabelText}>Privacy & Data</Text>
        </View>
        <View style={sS.card}>
          <PressableRow style={sS.row}>
            <View style={[sS.iconBubble, { backgroundColor: colors.chart.fibre + '18' }]}>
              <Ionicons name="download-outline" size={18} color={colors.chart.fibre} />
            </View>
            <View style={sS.rowContent}>
              <Text style={sS.rowTitle}>Export My Data</Text>
              <Text style={sS.rowSub}>Download a copy of your data</Text>
            </View>
            <View style={sS.chevronWrap}>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </View>
          </PressableRow>

          <View style={sS.divider} />

          <PressableRow style={sS.row}>
            <View style={[sS.iconBubble, { backgroundColor: colors.danger + '15' }]}>
              <Ionicons name="lock-closed" size={18} color={colors.danger} />
            </View>
            <View style={sS.rowContent}>
              <Text style={sS.rowTitle}>Privacy & Security</Text>
              <Text style={sS.rowSub}>Manage your account security</Text>
            </View>
            <View style={sS.chevronWrap}>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </View>
          </PressableRow>
        </View>
      </Animated.View>

      {/* Logout — standalone danger card */}
      <Animated.View entering={FadeInUp.delay(340).springify().damping(18)}>
        <PressableRow style={sS.logoutCard} onPress={logoutUser}>
          <View style={[sS.iconBubble, { backgroundColor: colors.danger + '20' }]}>
            <Ionicons name="log-out" size={18} color={colors.danger} />
          </View>
          <Text style={sS.logoutLabel}>Log Out</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.danger + 'AA'} />
        </PressableRow>
      </Animated.View>


      <Animated.View entering={FadeInUp.delay(420).springify().damping(18)}>
        <View style={sS.versionBlock}>
          <Text style={sS.version}>FitForge v1.0.0</Text>
          <Text style={sS.versionSub}>Made with 💚 for a healthier you</Text>
        </View>
      </Animated.View>

      {/* Edit Profile Modal (Option A - Recommended Segmented-tab Overlay) */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleBlock}>
                  <View style={[styles.modalHeaderIconWrap, { backgroundColor: colors.lime + '15' }]}>
                    <Ionicons name="person" size={18} color={colors.lime} />
                  </View>
                  <View>
                    <Text style={styles.modalHeaderSub}>ACCOUNT SETTINGS</Text>
                    <Text style={styles.modalHeaderTitle}>Edit Profile</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Segmented Tab Selector */}
              <View style={styles.tabSelector}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeFormTab === 'basic' && styles.tabBtnActive]}
                  onPress={() => setActiveFormTab('basic')}
                >
                  <Ionicons name="options-outline" size={14} color={activeFormTab === 'basic' ? colors.lime : colors.muted} />
                  <Text style={[styles.tabBtnText, activeFormTab === 'basic' && styles.tabBtnTextActive]}>Basic Metrics</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, activeFormTab === 'advanced' && styles.tabBtnActive]}
                  onPress={() => setActiveFormTab('advanced')}
                >
                  <Ionicons name="flash-outline" size={14} color={activeFormTab === 'advanced' ? colors.lime : colors.muted} />
                  <Text style={[styles.tabBtnText, activeFormTab === 'advanced' && styles.tabBtnTextActive]}>Advanced Goals</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {activeFormTab === 'basic' ? (
                  <View style={styles.formSection}>
                    {/* Display Picture Selector Block */}
                    <View style={styles.avatarFormCenter}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={styles.avatarFormWrapper}
                        onPress={() => setActionSheetVisible(true)}
                      >
                        {formProfilePic ? (
                          <Image source={{ uri: formProfilePic }} style={styles.avatarFormImage} />
                        ) : (
                          <Ionicons name="person" size={38} color={colors.lime} />
                        )}
                        <View style={styles.avatarCameraBadge}>
                          <Ionicons name="camera" size={12} color={colors.white} />
                        </View>
                      </TouchableOpacity>
                    </View>

                    {/* Pre-curated Avatar Presets Title */}
                    <Text style={styles.presetsTitle}>Choose Premium Avatar</Text>
                    
                    {/* Horizontal Scroller Carousel for Preset Avatars */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.presetsScroll}
                      contentContainerStyle={styles.presetsRow}
                    >
                      {AVATAR_PRESETS.map((preset) => {
                        const isActive = formProfilePic === preset.url;
                        return (
                          <TouchableOpacity
                            key={preset.id}
                            style={styles.presetCell}
                            activeOpacity={0.85}
                            onPress={() => setFormProfilePic(preset.url)}
                          >
                            <View style={[styles.presetCircle, isActive && styles.presetCircleActive]}>
                              <Image source={{ uri: preset.url }} style={styles.presetImage} />
                            </View>
                            <Text style={[styles.presetLabel, isActive && styles.presetLabelActive]}>
                              {preset.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>

                    {/* Custom Image URL Field */}
                    <View style={[styles.inputGroup, styles.customUrlWrapper]}>
                      <Text style={styles.inputLabel}>Or paste custom Photo URL</Text>
                      <View style={styles.inputFieldWrap}>
                        <Ionicons name="link-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formProfilePic}
                          onChangeText={setFormProfilePic}
                          placeholder="Paste custom photo URL (https://...)"
                          placeholderTextColor={colors.muted}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {formProfilePic ? (
                          <TouchableOpacity onPress={() => setFormProfilePic('')} activeOpacity={0.7}>
                            <Ionicons name="close-circle" size={16} color={colors.muted} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>

                    {/* Full Name Input */}
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
                      {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
                    </View>

                    {/* Numeric Row: Age, Height, Weight */}
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
                            keyboardType="numeric"
                            placeholder="28"
                            placeholderTextColor={colors.muted}
                            maxLength={3}
                          />
                        </View>
                        {formErrors.age && <Text style={styles.errorText}>{formErrors.age}</Text>}
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
                            placeholder="178"
                            placeholderTextColor={colors.muted}
                            maxLength={3}
                          />
                        </View>
                        {formErrors.height && <Text style={styles.errorText}>{formErrors.height}</Text>}
                      </View>

                      {/* Weight */}
                      <View style={[styles.inputGroup, { flex: 1.2 }]}>
                        <Text style={styles.inputLabel}>Weight (kg)</Text>
                        <View style={[styles.inputFieldWrap, formErrors.weight && styles.inputFieldError]}>
                          <TextInput
                            style={styles.textInput}
                            value={formWeight}
                            onChangeText={(t) => {
                              setFormWeight(t);
                              if (formErrors.weight) setFormErrors({ ...formErrors, weight: undefined });
                            }}
                            keyboardType="numeric"
                            placeholder="78.4"
                            placeholderTextColor={colors.muted}
                            maxLength={5}
                          />
                        </View>
                        {formErrors.weight && <Text style={styles.errorText}>{formErrors.weight}</Text>}
                      </View>
                    </View>

                    {/* Primary Goal Selector (Touchable Pill Chips) */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Primary Fitness Goal</Text>
                      <View style={styles.goalChipsRow}>
                        {['Lose Fat', 'Gain Muscle', 'Stay Fit'].map((goal) => (
                          <TouchableOpacity
                            key={goal}
                            style={[
                              styles.goalChip,
                              formGoal === goal && styles.goalChipActive
                            ]}
                            onPress={() => setFormGoal(goal)}
                            activeOpacity={0.8}
                          >
                            <Ionicons
                              name={goal === 'Gain Muscle' ? 'trending-up' : goal === 'Stay Fit' ? 'body' : 'trending-down'}
                              size={14}
                              color={formGoal === goal ? colors.lime : colors.muted}
                            />
                            <Text style={[styles.goalChipText, formGoal === goal && styles.goalChipTextActive]}>{goal}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Motivation Motto / Bio Tagline */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Motivation Motto</Text>
                      <View style={[styles.inputFieldWrap, formErrors.motto && styles.inputFieldError]}>
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formMotto}
                          onChangeText={(t) => {
                            setFormMotto(t);
                            if (formErrors.motto) setFormErrors({ ...formErrors, motto: undefined });
                          }}
                          placeholder="Strive for progress, not perfection!"
                          placeholderTextColor={colors.muted}
                        />
                      </View>
                      {formErrors.motto && <Text style={styles.errorText}>{formErrors.motto}</Text>}
                    </View>
                  </View>
                ) : (
                  <View style={styles.formSection}>
                    {/* Daily Calorie Intake Target */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Daily Calorie Target (kcal)</Text>
                      <View style={[styles.inputFieldWrap, formErrors.calorieGoal && styles.inputFieldError]}>
                        <Ionicons name="flame-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formCalorieGoal}
                          onChangeText={(t) => {
                            setFormCalorieGoal(t);
                            if (formErrors.calorieGoal) setFormErrors({ ...formErrors, calorieGoal: undefined });
                          }}
                          keyboardType="numeric"
                          placeholder="2400"
                          placeholderTextColor={colors.muted}
                          maxLength={5}
                        />
                      </View>
                      {formErrors.calorieGoal && <Text style={styles.errorText}>{formErrors.calorieGoal}</Text>}
                    </View>

                    {/* Daily Hydration Target */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Daily Water Goal (ml)</Text>
                      <View style={[styles.inputFieldWrap, formErrors.waterGoal && styles.inputFieldError]}>
                        <Ionicons name="water-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formWaterGoal}
                          onChangeText={(t) => {
                            setFormWaterGoal(t);
                            if (formErrors.waterGoal) setFormErrors({ ...formErrors, waterGoal: undefined });
                          }}
                          keyboardType="numeric"
                          placeholder="2500"
                          placeholderTextColor={colors.muted}
                          maxLength={5}
                        />
                      </View>
                      {formErrors.waterGoal && <Text style={styles.errorText}>{formErrors.waterGoal}</Text>}
                    </View>

                    {/* Daily Activity Step Goal */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Daily Steps Target</Text>
                      <View style={[styles.inputFieldWrap, formErrors.stepsGoal && styles.inputFieldError]}>
                        <Ionicons name="footsteps-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formStepsGoal}
                          onChangeText={(t) => {
                            setFormStepsGoal(t);
                            if (formErrors.stepsGoal) setFormErrors({ ...formErrors, stepsGoal: undefined });
                          }}
                          keyboardType="numeric"
                          placeholder="10000"
                          placeholderTextColor={colors.muted}
                          maxLength={5}
                        />
                      </View>
                      {formErrors.stepsGoal && <Text style={styles.errorText}>{formErrors.stepsGoal}</Text>}
                    </View>

                    {/* Weekly Workout Frequency Target */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Workout Target (workouts/week)</Text>
                      <View style={styles.workoutPillsRow}>
                        {['2', '3', '4', '5', '6'].map((freq) => (
                          <TouchableOpacity
                            key={freq}
                            style={[
                              styles.workoutPill,
                              formWorkoutGoal === freq && styles.workoutPillActive
                            ]}
                            onPress={() => setFormWorkoutGoal(freq)}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.workoutPillText, formWorkoutGoal === freq && styles.workoutPillTextActive]}>
                              {freq} days
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)} activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} activeOpacity={0.8}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                  <Text style={styles.saveBtnText}>Save Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Dynamic Glassmorphic Action Sheet Selector */}
      <Modal
        visible={actionSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionSheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetDismissArea}
            activeOpacity={1}
            onPress={() => setActionSheetVisible(false)}
          />
          <GlassCard style={styles.sheetCard} accentColor={colors.lime}>
            {/* Header branding indicator */}
            <View style={styles.sheetDragIndicator} />
            <Text style={styles.sheetTitle}>Upload Profile Photo</Text>
            <Text style={styles.sheetSubtitle}>Pick a modern fitness representation from your storage or capture a new one.</Text>

            <View style={styles.sheetButtonsContainer}>
              {/* Photo library trigger */}
              <TouchableOpacity
                style={styles.sheetButton}
                activeOpacity={0.8}
                onPress={pickImageFromGallery}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: colors.lime + '12' }]}>
                  <Ionicons name="images" size={20} color={colors.lime} />
                </View>
                <View style={styles.sheetButtonLabelBlock}>
                  <Text style={styles.sheetButtonTitle}>Choose from Gallery</Text>
                  <Text style={styles.sheetButtonSub}>Select an existing image from local storage</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </TouchableOpacity>

              {/* Camera capture trigger */}
              <TouchableOpacity
                style={styles.sheetButton}
                activeOpacity={0.8}
                onPress={takePhotoWithCamera}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: colors.amber + '12' }]}>
                  <Ionicons name="camera" size={20} color={colors.amber} />
                </View>
                <View style={styles.sheetButtonLabelBlock}>
                  <Text style={styles.sheetButtonTitle}>Take Photo</Text>
                  <Text style={styles.sheetButtonSub}>Open camera to capture a new photo</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.muted} />
              </TouchableOpacity>

              {/* Cancel direct trigger */}
              <TouchableOpacity
                style={[styles.sheetButton, styles.sheetCancelButton]}
                activeOpacity={0.8}
                onPress={() => setActionSheetVisible(false)}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: colors.danger + '12' }]}>
                  <Ionicons name="close" size={20} color={colors.danger} />
                </View>
                <View style={styles.sheetButtonLabelBlock}>
                  <Text style={[styles.sheetButtonTitle, { color: colors.danger }]}>Cancel</Text>
                  <Text style={styles.sheetButtonSub}>Keep current picture selection</Text>
                </View>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

    </ScrollView>

    {/* Splash preview Modal — true portal, renders above tab bar & everything */}
    <Modal
      visible={showSplashPreview}
      transparent={false}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={() => setShowSplashPreview(false)}
    >
      <AnimatedSplashScreen
        isAppReady={false}
        preview={true}
        onPreviewDismiss={() => setShowSplashPreview(false)}
      />
    </Modal>
    </View>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: colors.lime + '18',
    borderWidth: 2.5, borderColor: colors.lime,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: { ...Typography.h2, color: colors.lime },
  avatarDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5, borderColor: colors.card,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarFormCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  avatarFormWrapper: {
    position: 'relative',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: colors.lime,
    backgroundColor: colors.lime + '12',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarFormImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lime,
    borderWidth: 2,
    borderColor: colors.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  presetsTitle: {
    ...Typography.captionBold,
    color: colors.text.primary,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  presetsScroll: {
    marginBottom: 10,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  presetCell: {
    alignItems: 'center',
    gap: 4,
    width: 66,
  },
  presetCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  presetCircleActive: {
    borderColor: colors.lime,
    borderWidth: 2.5,
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
  },
  presetLabelActive: {
    color: colors.lime,
    fontWeight: '700',
  },
  customUrlWrapper: {
    marginTop: 4,
    marginBottom: 12,
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { ...Typography.h3, color: colors.text.primary },
  profileEmail: {
    ...Typography.caption,
    color: colors.text.secondary,
    marginTop: 1,
  },
  profileMotto: {
    ...Typography.caption,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: -2,
  },
  profileHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lime + '15',
    borderColor: colors.lime + '30',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editBtnText: {
    ...Typography.micro,
    color: colors.lime,
  },
  levelBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.lime + '18', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.lime + '40',
  },
  levelText: { ...Typography.captionBold, color: colors.lime },
  xpBarTrack: {
    height: 5, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: Radius.pill, overflow: 'hidden', marginTop: 4,
  },
  xpBarFill: {
    width: '71%', height: '100%', backgroundColor: colors.lime, borderRadius: Radius.pill,
  },
  xpSub: { ...Typography.micro, color: colors.muted },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: {
    width: '48%', backgroundColor: colors.bg + '88',
    borderRadius: Radius.md, padding: 14,
    borderWidth: 1, borderColor: colors.cardBorder, gap: 4,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { ...Typography.h4, color: colors.text.primary },
  statLabel: { ...Typography.caption, color: colors.muted },

  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekItem: { alignItems: 'center', gap: 6 },
  weekIconWrap: {
    width: 46, height: 46, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  weekVal: { ...Typography.h4 },
  weekLabel: { ...Typography.micro, color: colors.muted },

  badgeScroll: { marginHorizontal: -4 },
  badgeRow: { flexDirection: 'row', gap: 14, paddingHorizontal: 4, paddingBottom: 4 },
  badgeItem: { alignItems: 'center', gap: 6, width: 70 },
  badgeLocked: { opacity: 0.35 },
  badgeCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderWidth: 1.5, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeLabel: { ...Typography.micro, color: colors.text.primary, textAlign: 'center' },
  badgeLabelLocked: { color: colors.muted },

  goalRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  goalPct: { ...Typography.bodyBold, color: colors.amber },
  goalText: { flex: 1, gap: 4 },
  goalTitle: { ...Typography.h4, color: colors.text.primary },
  goalSub: { ...Typography.caption, color: colors.muted },
  goalEta: { ...Typography.micro, color: colors.muted },
  goalBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.amber + '18', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.amber + '40',
  },
  goalBadgeText: { ...Typography.captionBold, color: colors.amber },

  settingsList: {},
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.cardBorder,
  },
  settingIconWrap: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { ...Typography.body, color: colors.text.primary, flex: 1 },
  unitToggle: {
    flexDirection: 'row', gap: 2,
    backgroundColor: colors.bg, borderRadius: Radius.pill, padding: 3,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.pill },
  unitBtnActive: { backgroundColor: colors.lime + '28' },
  unitBtnText: { ...Typography.captionBold, color: colors.muted },
  unitBtnTextActive: { color: colors.lime },

  versionBlock: { alignItems: 'center', paddingTop: 8, gap: 2 },
  version: { ...Typography.micro, color: colors.muted },
  versionSub: { ...Typography.micro, color: colors.muted, opacity: 0.6 },

  // Edit Profile Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.ivory,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    minHeight: 540,
    maxHeight: '100%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.lime + '20',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalHeaderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.lime,
  },
  modalHeaderTitle: {
    ...Typography.h3,
    color: colors.text.primary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    borderRadius: Radius.pill,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  tabBtnActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    ...Typography.captionBold,
    color: colors.muted,
  },
  tabBtnTextActive: {
    color: colors.lime,
  },
  modalScroll: {
    maxHeight: 380,
  },
  formSection: {
    gap: 16,
    paddingBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: colors.text.primary,
  },
  inputFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    height: 46,
  },
  inputFieldError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '05',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    color: colors.text.primary,
    padding: 0,
  },
  errorText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.danger,
    marginTop: 2,
  },
  goalChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  goalChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  goalChipActive: {
    borderColor: colors.lime,
    backgroundColor: colors.lime + '12',
  },
  goalChipText: {
    ...Typography.captionBold,
    color: colors.muted,
  },
  goalChipTextActive: {
    color: colors.lime,
  },
  workoutPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workoutPill: {
    flex: 1,
    minWidth: '28%',
    height: 38,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutPillActive: {
    borderColor: colors.lime,
    backgroundColor: colors.lime + '12',
  },
  workoutPillText: {
    ...Typography.captionBold,
    color: colors.muted,
  },
  workoutPillTextActive: {
    color: colors.lime,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cancelBtnText: {
    ...Typography.bodyBold,
    color: colors.text.secondary,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    ...Typography.bodyBold,
    color: colors.white,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'flex-end',
  },
  sheetDismissArea: {
    flex: 1,
  },
  sheetCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  sheetDragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    ...Typography.h3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    ...Typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  sheetButtonsContainer: {
    gap: 12,
  },
  sheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg + '44',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: Radius.md,
    padding: 12,
    gap: 12,
  },
  sheetCancelButton: {
    borderColor: colors.danger + '22',
    backgroundColor: colors.danger + '06',
  },
  sheetIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetButtonLabelBlock: {
    flex: 1,
    gap: 1,
  },
  sheetButtonTitle: {
    ...Typography.bodyBold,
    color: colors.text.primary,
  },
  sheetButtonSub: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.text.secondary,
  },
});

// ─── Settings section styles (sS) ────────────────────────────────────────────
const getSS = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  groupLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 4, paddingBottom: 8, paddingTop: 4,
  },
  groupDot: { width: 6, height: 6, borderRadius: 3 },
  groupLabelText: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    color: colors.muted, textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.ivory,
    borderRadius: 18,
    borderWidth: 1, borderColor: colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  divider: {
    height: 1, backgroundColor: colors.cardBorder,
    marginLeft: 68,
  },
  iconBubble: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowTitle: {
    fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 1,
  },
  rowSub: { fontSize: 12, color: colors.muted },
  chevronWrap: {
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 7,
  },
  pillToggle: {
    flexDirection: 'row', gap: 2,
    backgroundColor: colors.cardBorder, borderRadius: 10, padding: 3,
  },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  pillActive: { backgroundColor: colors.ivory },
  pillText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  pillTextActive: { color: colors.lime },
  logoutCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 15, gap: 14,
    backgroundColor: colors.danger + '0D',
    borderRadius: 18, borderWidth: 1, borderColor: colors.danger + '22',
  },
  logoutLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.danger },
  versionBlock: { alignItems: 'center', paddingVertical: 12, gap: 3 },
  version: { fontSize: 12, color: colors.muted },
  versionSub: { fontSize: 11, color: colors.muted, opacity: 0.55 },
});
