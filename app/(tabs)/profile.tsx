import React, { useState } from 'react';
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
import { Colors, Typography, Radius } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { useProfileSettings, useThemeMode } from '@/store/fitnessStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';

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

const BADGES: Badge[] = [
  { id: 'b1', icon: { lib: 'Ionicons', name: 'flame' }, label: '7-Day Streak', unlocked: true, color: Colors.amber },
  { id: 'b2', icon: { lib: 'Ionicons', name: 'water' }, label: 'Hydration Pro', unlocked: true, color: Colors.chart.water },
  { id: 'b3', icon: { lib: 'MCI', name: 'scale-bathroom' }, label: '5kg Lost', unlocked: true, color: Colors.lime },
  { id: 'b4', icon: { lib: 'MCI', name: 'dumbbell' }, label: 'Iron Will', unlocked: true, color: Colors.lime },
  { id: 'b5', icon: { lib: 'MCI', name: 'food-apple' }, label: 'Macro Master', unlocked: false, color: Colors.chart.carbs },
  { id: 'b6', icon: { lib: 'Ionicons', name: 'camera' }, label: 'Photo Journey', unlocked: false, color: Colors.lime },
  { id: 'b7', icon: { lib: 'MCI', name: 'run' }, label: 'Step Crusher', unlocked: false, color: '#6366F1' },
  { id: 'b8', icon: { lib: 'MCI', name: 'pill' }, label: 'Supplement King', unlocked: false, color: Colors.chart.fibre },
];

const AVATAR_PRESETS = [
  { id: 'av1', label: 'Strength', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Runner', url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=150&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Yoga', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Trainer', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'Boxing', url: 'https://images.unsplash.com/photo-1491756906593-95123989ad30?w=150&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Cyclist', url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=150&auto=format&fit=crop&q=80' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser } = useProfileSettings();
  const logoutUser = async () => {
    await supabase.auth.signOut();
  };

  const { isDarkMode, setIsDarkMode } = useThemeMode();
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
    { label: 'Height', value: `${userHeight} cm`, icon: 'resize-outline' as IoniconName, color: Colors.lime },
    { label: 'Weight', value: `${userWeight} kg`, icon: 'barbell-outline' as IoniconName, color: Colors.amber },
    { label: 'Goal', value: userGoal, icon: (userGoal === 'Gain Muscle' ? 'trending-up-outline' : userGoal === 'Stay Fit' ? 'body-outline' : 'trending-down-outline') as IoniconName, color: Colors.chart.calories },
  ];

  // Compute dynamic weekly summary based on goals
  const weekSummary: { icon: IconDef; label: string; value: string; color: string }[] = [
    { icon: { lib: 'MCI' as const, name: 'dumbbell' as const }, label: 'Workouts', value: `${workoutGoal}`, color: Colors.lime },
    { icon: { lib: 'Ionicons' as const, name: 'trophy' as const }, label: 'Goals Hit', value: '18/21', color: Colors.amber },
    { icon: { lib: 'Ionicons' as const, name: 'flame' as const }, label: 'Streak', value: '14d', color: Colors.amber },
    { icon: { lib: 'Ionicons' as const, name: 'water' as const }, label: 'Avg Water', value: `${(parseFloat(waterGoal) / 1000).toFixed(1)}L`, color: Colors.chart.water },
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
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Profile"
        subtitle="MY ACCOUNT"
        icon={{ lib: 'Ionicons', name: 'person' }}
        accentColor={Colors.lime}
        rightIcon="create-outline"
        onRightPress={openEditModal}
      />

      {/* Profile header card */}
      <GlassCard accentColor={Colors.lime}>
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
                <Ionicons name="flash" size={11} color={Colors.lime} />
                <Text style={styles.levelText}>Level 8 · 2,840 XP</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={openEditModal} activeOpacity={0.75}>
                <Ionicons name="create" size={11} color={Colors.lime} />
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
      <GlassCard accentColor={Colors.amber}>
        <SectionHeader title="This Week" accentColor={Colors.amber} />
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
          accentColor={Colors.amber}
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
                    color={badge.unlocked ? badge.color : Colors.muted}
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
      <GlassCard accentColor={Colors.amber}>
        <SectionHeader title="Goal Progress" accentColor={Colors.amber} />
        <View style={styles.goalRow}>
          <ProgressRing size={100} strokeWidth={10} progress={0.46} color={Colors.amber}>
            <Text style={styles.goalPct}>46%</Text>
          </ProgressRing>
          <View style={styles.goalText}>
            <Text style={styles.goalTitle}>{userGoal}</Text>
            <Text style={styles.goalSub}>Current: {userWeight} kg → Target: {userGoal === 'Gain Muscle' ? '85.0 kg' : userGoal === 'Stay Fit' ? 'Maintain' : '72.0 kg'}</Text>
            <Text style={styles.goalEta}>{userGoal === 'Stay Fit' ? 'Awesome! Keep up active routines' : 'Est. 9 weeks at current pace'}</Text>
            <View style={styles.goalBadge}>
              <Ionicons name={userGoal === 'Gain Muscle' ? 'trending-up' : userGoal === 'Stay Fit' ? 'body' : 'trending-down'} size={11} color={Colors.amber} />
              <Text style={styles.goalBadgeText}>
                {userGoal === 'Gain Muscle' ? '6.6 kg remaining' : userGoal === 'Stay Fit' ? 'Active lifestyle' : '6.4 kg remaining'}
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Static Settings Settings */}
      <GlassCard>
        <SectionHeader title="Settings" accentColor={Colors.muted} />
        <View style={styles.settingsList}>
          {/* Action: Recalibrate Fitness Goals via Setup Wizard */}
          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75} onPress={() => router.push('/(auth)/setup')}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.bubble.green }]}>
              <Ionicons name="sparkles" size={18} color={Colors.lime} />
            </View>
            <Text style={[styles.settingLabel, { color: Colors.lime }]}>Recalibrate Fitness Engine</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: '#6366F1' + '15' }]}>
              <Ionicons name="moon" size={18} color="#6366F1" />
            </View>
            <Text style={styles.settingLabel}>Dark Theme</Text>
            <Switch
              value={isDarkMode} onValueChange={setIsDarkMode}
              trackColor={{ false: 'rgba(0,0,0,0.10)', true: Colors.lime + '88' }}
              thumbColor={isDarkMode ? Colors.lime : Colors.muted}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.amber + '15' }]}>
              <MaterialCommunityIcons name="scale-bathroom" size={18} color={Colors.amber} />
            </View>
            <Text style={styles.settingLabel}>Weight Unit</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity style={[styles.unitBtn, unitKg && styles.unitBtnActive]} onPress={() => setUnitKg(true)}>
                <Text style={[styles.unitBtnText, unitKg && styles.unitBtnTextActive]}>kg</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.unitBtn, !unitKg && styles.unitBtnActive]} onPress={() => setUnitKg(false)}>
                <Text style={[styles.unitBtnText, !unitKg && styles.unitBtnTextActive]}>lbs</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.chart.water + '15' }]}>
              <Ionicons name="water" size={18} color={Colors.chart.water} />
            </View>
            <Text style={styles.settingLabel}>Volume Unit</Text>
            <View style={styles.unitToggle}>
              <TouchableOpacity style={[styles.unitBtn, unitMl && styles.unitBtnActive]} onPress={() => setUnitMl(true)}>
                <Text style={[styles.unitBtnText, unitMl && styles.unitBtnTextActive]}>ml</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.unitBtn, !unitMl && styles.unitBtnActive]} onPress={() => setUnitMl(false)}>
                <Text style={[styles.unitBtnText, !unitMl && styles.unitBtnTextActive]}>oz</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.lime + '15' }]}>
              <Ionicons name="notifications" size={18} color={Colors.lime} />
            </View>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notifications} onValueChange={setNotifications}
              trackColor={{ false: 'rgba(0,0,0,0.10)', true: Colors.lime + '88' }}
              thumbColor={notifications ? Colors.lime : Colors.muted}
            />
          </View>

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.chart.fibre + '15' }]}>
              <Ionicons name="download-outline" size={18} color={Colors.chart.fibre} />
            </View>
            <Text style={styles.settingLabel}>Export Data</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} activeOpacity={0.75}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.danger + '15' }]}>
              <Ionicons name="lock-closed" size={18} color={Colors.danger} />
            </View>
            <Text style={styles.settingLabel}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.75}
            onPress={() => setShowSplashPreview(true)}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: 'rgba(46,125,94,0.18)' }]}>
              <Ionicons name="flash" size={18} color="#2E7D5E" />
            </View>
            <Text style={styles.settingLabel}>Preview Splash Screen</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]} activeOpacity={0.75} onPress={logoutUser}>
            <View style={[styles.settingIconWrap, { backgroundColor: Colors.danger + '22' }]}>
              <Ionicons name="log-out" size={18} color={Colors.danger} />
            </View>
            <Text style={[styles.settingLabel, { color: Colors.danger, fontWeight: '700' }]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </GlassCard>

      <View style={styles.versionBlock}>
        <Text style={styles.version}>FitForge v1.0.0</Text>
        <Text style={styles.versionSub}>Made with 💚 for a healthier you</Text>
      </View>

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
                  <View style={[styles.modalHeaderIconWrap, { backgroundColor: Colors.lime + '15' }]}>
                    <Ionicons name="person" size={18} color={Colors.lime} />
                  </View>
                  <View>
                    <Text style={styles.modalHeaderSub}>ACCOUNT SETTINGS</Text>
                    <Text style={styles.modalHeaderTitle}>Edit Profile</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Segmented Tab Selector */}
              <View style={styles.tabSelector}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeFormTab === 'basic' && styles.tabBtnActive]}
                  onPress={() => setActiveFormTab('basic')}
                >
                  <Ionicons name="options-outline" size={14} color={activeFormTab === 'basic' ? Colors.lime : Colors.muted} />
                  <Text style={[styles.tabBtnText, activeFormTab === 'basic' && styles.tabBtnTextActive]}>Basic Metrics</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, activeFormTab === 'advanced' && styles.tabBtnActive]}
                  onPress={() => setActiveFormTab('advanced')}
                >
                  <Ionicons name="flash-outline" size={14} color={activeFormTab === 'advanced' ? Colors.lime : Colors.muted} />
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
                          <Ionicons name="person" size={38} color={Colors.lime} />
                        )}
                        <View style={styles.avatarCameraBadge}>
                          <Ionicons name="camera" size={12} color={Colors.white} />
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
                        <Ionicons name="link-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formProfilePic}
                          onChangeText={setFormProfilePic}
                          placeholder="Paste custom photo URL (https://...)"
                          placeholderTextColor={Colors.muted}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {formProfilePic ? (
                          <TouchableOpacity onPress={() => setFormProfilePic('')} activeOpacity={0.7}>
                            <Ionicons name="close-circle" size={16} color={Colors.muted} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>

                    {/* Full Name Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Full Name</Text>
                      <View style={[styles.inputFieldWrap, formErrors.name && styles.inputFieldError]}>
                        <Ionicons name="person-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formName}
                          onChangeText={(t) => {
                            setFormName(t);
                            if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                          }}
                          placeholder="Alex Rivera"
                          placeholderTextColor={Colors.muted}
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
                            placeholderTextColor={Colors.muted}
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
                            placeholderTextColor={Colors.muted}
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
                            placeholderTextColor={Colors.muted}
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
                              color={formGoal === goal ? Colors.lime : Colors.muted}
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
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formMotto}
                          onChangeText={(t) => {
                            setFormMotto(t);
                            if (formErrors.motto) setFormErrors({ ...formErrors, motto: undefined });
                          }}
                          placeholder="Strive for progress, not perfection!"
                          placeholderTextColor={Colors.muted}
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
                        <Ionicons name="flame-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formCalorieGoal}
                          onChangeText={(t) => {
                            setFormCalorieGoal(t);
                            if (formErrors.calorieGoal) setFormErrors({ ...formErrors, calorieGoal: undefined });
                          }}
                          keyboardType="numeric"
                          placeholder="2400"
                          placeholderTextColor={Colors.muted}
                          maxLength={5}
                        />
                      </View>
                      {formErrors.calorieGoal && <Text style={styles.errorText}>{formErrors.calorieGoal}</Text>}
                    </View>

                    {/* Daily Hydration Target */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Daily Water Goal (ml)</Text>
                      <View style={[styles.inputFieldWrap, formErrors.waterGoal && styles.inputFieldError]}>
                        <Ionicons name="water-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formWaterGoal}
                          onChangeText={(t) => {
                            setFormWaterGoal(t);
                            if (formErrors.waterGoal) setFormErrors({ ...formErrors, waterGoal: undefined });
                          }}
                          keyboardType="numeric"
                          placeholder="2500"
                          placeholderTextColor={Colors.muted}
                          maxLength={5}
                        />
                      </View>
                      {formErrors.waterGoal && <Text style={styles.errorText}>{formErrors.waterGoal}</Text>}
                    </View>

                    {/* Daily Activity Step Goal */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Daily Steps Target</Text>
                      <View style={[styles.inputFieldWrap, formErrors.stepsGoal && styles.inputFieldError]}>
                        <Ionicons name="footsteps-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={formStepsGoal}
                          onChangeText={(t) => {
                            setFormStepsGoal(t);
                            if (formErrors.stepsGoal) setFormErrors({ ...formErrors, stepsGoal: undefined });
                          }}
                          keyboardType="numeric"
                          placeholder="10000"
                          placeholderTextColor={Colors.muted}
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
                  <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
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
          <GlassCard style={styles.sheetCard} accentColor={Colors.lime}>
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
                <View style={[styles.sheetIconWrap, { backgroundColor: Colors.lime + '12' }]}>
                  <Ionicons name="images" size={20} color={Colors.lime} />
                </View>
                <View style={styles.sheetButtonLabelBlock}>
                  <Text style={styles.sheetButtonTitle}>Choose from Gallery</Text>
                  <Text style={styles.sheetButtonSub}>Select an existing image from local storage</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
              </TouchableOpacity>

              {/* Camera capture trigger */}
              <TouchableOpacity
                style={styles.sheetButton}
                activeOpacity={0.8}
                onPress={takePhotoWithCamera}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: Colors.amber + '12' }]}>
                  <Ionicons name="camera" size={20} color={Colors.amber} />
                </View>
                <View style={styles.sheetButtonLabelBlock}>
                  <Text style={styles.sheetButtonTitle}>Take Photo</Text>
                  <Text style={styles.sheetButtonSub}>Open camera to capture a new photo</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
              </TouchableOpacity>

              {/* Cancel direct trigger */}
              <TouchableOpacity
                style={[styles.sheetButton, styles.sheetCancelButton]}
                activeOpacity={0.8}
                onPress={() => setActionSheetVisible(false)}
              >
                <View style={[styles.sheetIconWrap, { backgroundColor: Colors.danger + '12' }]}>
                  <Ionicons name="close" size={20} color={Colors.danger} />
                </View>
                <View style={styles.sheetButtonLabelBlock}>
                  <Text style={[styles.sheetButtonTitle, { color: Colors.danger }]}>Cancel</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: Colors.lime + '18',
    borderWidth: 2.5, borderColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: { ...Typography.h2, color: Colors.lime },
  avatarDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2.5, borderColor: Colors.card,
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
    borderColor: Colors.lime,
    backgroundColor: Colors.lime + '12',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.lime,
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
    backgroundColor: Colors.lime,
    borderWidth: 2,
    borderColor: Colors.ivory,
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
    color: Colors.text.primary,
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
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
  presetCircleActive: {
    borderColor: Colors.lime,
    borderWidth: 2.5,
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.muted,
  },
  presetLabelActive: {
    color: Colors.lime,
    fontWeight: '700',
  },
  customUrlWrapper: {
    marginTop: 4,
    marginBottom: 12,
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { ...Typography.h3, color: Colors.text.primary },
  profileEmail: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  profileMotto: {
    ...Typography.caption,
    color: Colors.text.secondary,
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
    backgroundColor: Colors.lime + '15',
    borderColor: Colors.lime + '30',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  editBtnText: {
    ...Typography.micro,
    color: Colors.lime,
  },
  levelBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.lime + '18', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.lime + '40',
  },
  levelText: { ...Typography.captionBold, color: Colors.lime },
  xpBarTrack: {
    height: 5, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: Radius.pill, overflow: 'hidden', marginTop: 4,
  },
  xpBarFill: {
    width: '71%', height: '100%', backgroundColor: Colors.lime, borderRadius: Radius.pill,
  },
  xpSub: { ...Typography.micro, color: Colors.muted },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCell: {
    width: '48%', backgroundColor: Colors.bg + '88',
    borderRadius: Radius.md, padding: 14,
    borderWidth: 1, borderColor: Colors.cardBorder, gap: 4,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { ...Typography.h4, color: Colors.text.primary },
  statLabel: { ...Typography.caption, color: Colors.muted },

  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekItem: { alignItems: 'center', gap: 6 },
  weekIconWrap: {
    width: 46, height: 46, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  weekVal: { ...Typography.h4 },
  weekLabel: { ...Typography.micro, color: Colors.muted },

  badgeScroll: { marginHorizontal: -4 },
  badgeRow: { flexDirection: 'row', gap: 14, paddingHorizontal: 4, paddingBottom: 4 },
  badgeItem: { alignItems: 'center', gap: 6, width: 70 },
  badgeLocked: { opacity: 0.35 },
  badgeCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1.5, borderColor: Colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeLabel: { ...Typography.micro, color: Colors.text.primary, textAlign: 'center' },
  badgeLabelLocked: { color: Colors.muted },

  goalRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  goalPct: { ...Typography.bodyBold, color: Colors.amber },
  goalText: { flex: 1, gap: 4 },
  goalTitle: { ...Typography.h4, color: Colors.text.primary },
  goalSub: { ...Typography.caption, color: Colors.muted },
  goalEta: { ...Typography.micro, color: Colors.muted },
  goalBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.amber + '18', borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.amber + '40',
  },
  goalBadgeText: { ...Typography.captionBold, color: Colors.amber },

  settingsList: {},
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  settingIconWrap: {
    width: 36, height: 36, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { ...Typography.body, color: Colors.text.primary, flex: 1 },
  unitToggle: {
    flexDirection: 'row', gap: 2,
    backgroundColor: Colors.bg, borderRadius: Radius.pill, padding: 3,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.pill },
  unitBtnActive: { backgroundColor: Colors.lime + '28' },
  unitBtnText: { ...Typography.captionBold, color: Colors.muted },
  unitBtnTextActive: { color: Colors.lime },

  versionBlock: { alignItems: 'center', paddingTop: 8, gap: 2 },
  version: { ...Typography.micro, color: Colors.muted },
  versionSub: { ...Typography.micro, color: Colors.muted, opacity: 0.6 },

  // Edit Profile Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.60)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.ivory,
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
    borderColor: Colors.lime + '20',
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
    color: Colors.lime,
  },
  modalHeaderTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: Radius.pill,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    ...Typography.captionBold,
    color: Colors.muted,
  },
  tabBtnTextActive: {
    color: Colors.lime,
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
    color: Colors.text.primary,
  },
  inputFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    height: 46,
  },
  inputFieldError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger + '05',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    padding: 0,
  },
  errorText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.danger,
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
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
  },
  goalChipActive: {
    borderColor: Colors.lime,
    backgroundColor: Colors.lime + '12',
  },
  goalChipText: {
    ...Typography.captionBold,
    color: Colors.muted,
  },
  goalChipTextActive: {
    color: Colors.lime,
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
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutPillActive: {
    borderColor: Colors.lime,
    backgroundColor: Colors.lime + '12',
  },
  workoutPillText: {
    ...Typography.captionBold,
    color: Colors.muted,
  },
  workoutPillTextActive: {
    color: Colors.lime,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cancelBtnText: {
    ...Typography.bodyBold,
    color: Colors.text.secondary,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.50)',
    justifyContent: 'flex-end',
  },
  sheetDismissArea: {
    flex: 1,
  },
  sheetCard: {
    backgroundColor: Colors.card,
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
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
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
    backgroundColor: Colors.bg + '44',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.md,
    padding: 12,
    gap: 12,
  },
  sheetCancelButton: {
    borderColor: Colors.danger + '22',
    backgroundColor: Colors.danger + '06',
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
    color: Colors.text.primary,
  },
  sheetButtonSub: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.text.secondary,
  },
});
