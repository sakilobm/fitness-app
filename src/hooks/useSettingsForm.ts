import { useState, useCallback, useMemo } from 'react';
import { useProfileSettings, useFitnessStore } from '@/store/fitnessStore';
import { kgToLbs, lbsToKg } from '@/utils/units';
import { triggerHaptic } from '@/utils/haptics';
import { FitnessGoal } from '@/utils/algorithm';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Share, Alert } from 'react-native';
import { router } from 'expo-router';
import { formatErrorMessage } from '@/utils/errorUtils';

const EMPTY_MEALS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', expanded: true,  items: [] },
  { id: 'lunch',     label: 'Lunch',     icon: '☀️',  expanded: false, items: [] },
  { id: 'dinner',    label: 'Dinner',    icon: '🌙',  expanded: false, items: [] },
  { id: 'snacks',    label: 'Snacks',    icon: '🍎',  expanded: false, items: [] },
];

export function useSettingsForm() {
  const { user, setUser } = useProfileSettings();

  const initialWeight = (user.weightUnit ?? 'kg') === 'lbs'
    ? kgToLbs(user.weight).toString()
    : user.weight.toString();

  // Profile fields
  const [formName, setFormName] = useState(user.name);
  const [formAge, setFormAge] = useState(user.age.toString());
  const [formHeight, setFormHeight] = useState(user.height.toString());
  const [formWeight, setFormWeight] = useState(initialWeight);
  const [formGoal, setFormGoal] = useState(user.goal);
  const [formMotto, setFormMotto] = useState(user.motto);
  const [formProfilePic, setFormProfilePic] = useState(user.profilePic || '');

  // Goals
  const [formCalorieGoal, setFormCalorieGoal] = useState(user.calorieGoal);
  const [formWaterGoal, setFormWaterGoal] = useState(user.waterGoal);
  const [formStepsGoal, setFormStepsGoal] = useState(user.stepsGoal);
  const [formWorkoutGoal, setFormWorkoutGoal] = useState(user.workoutGoal);

  // Unit preferences
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(user.weightUnit ?? 'kg');
  const [volumeUnit, setVolumeUnit] = useState<'ml' | 'oz'>(user.volumeUnit ?? 'ml');

  // Preference switches
  const [notifications, setNotifications] = useState(user.notificationsEnabled ?? true);
  const [haptics, setHaptics] = useState(user.hapticsEnabled ?? true);
  const [privateProfile, setPrivateProfile] = useState(user.privateProfileEnabled ?? false);
  const [appLock, setAppLock] = useState(user.appLockEnabled ?? false);

  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string | undefined>>({});

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'alert'>('info');

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    triggerHaptic(type === 'success' ? 'success' : type === 'alert' ? 'error' : 'selection');
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleWeightUnitChange = useCallback((newUnit: 'kg' | 'lbs') => {
    if (newUnit === weightUnit) return;
    const currentVal = parseFloat(formWeight);
    if (!isNaN(currentVal) && currentVal > 0) {
      setFormWeight(
        newUnit === 'lbs' ? kgToLbs(currentVal).toString() : lbsToKg(currentVal).toString()
      );
    }
    setWeightUnit(newUnit);
  }, [weightUnit, formWeight]);

  const handleSave = useCallback(() => {
    const errors: Record<string, string> = {};

    if (!formName.trim()) errors.name = 'Full name is required';

    const ageNum = parseInt(formAge, 10);
    if (!formAge || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) errors.age = 'Invalid age (1-120)';

    const heightNum = parseFloat(formHeight);
    if (!formHeight || isNaN(heightNum) || heightNum <= 50 || heightNum > 250) errors.height = 'Invalid height (50-250)';

    const weightNum = parseFloat(formWeight);
    if (weightUnit === 'lbs') {
      if (!formWeight || isNaN(weightNum) || weightNum <= 22 || weightNum > 1100) {
        errors.weight = 'Invalid weight (22-1100 lbs)';
      }
    } else {
      if (!formWeight || isNaN(weightNum) || weightNum <= 10 || weightNum > 500) {
        errors.weight = 'Invalid weight (10-500 kg)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please correct errors in basic metrics section before saving.', 'alert');
      return;
    }

    const finalWeightInKg = weightUnit === 'lbs' ? lbsToKg(weightNum) : weightNum;
    setUser({
      name: formName.trim(),
      age: ageNum,
      height: heightNum,
      weight: finalWeightInKg,
      goal: formGoal as FitnessGoal,
      motto: formMotto.trim(),
      calorieGoal: formCalorieGoal,
      waterGoal: formWaterGoal,
      stepsGoal: formStepsGoal,
      workoutGoal: formWorkoutGoal,
      profilePic: formProfilePic,
      weightUnit,
      volumeUnit,
      notificationsEnabled: notifications,
      hapticsEnabled: haptics,
      privateProfileEnabled: privateProfile,
      appLockEnabled: appLock,
    });

    setFormErrors({});
    showToast('Settings saved and synced successfully.', 'success');
  }, [
    formName, formAge, formHeight, formWeight, formGoal, formMotto, formProfilePic,
    formCalorieGoal, formWaterGoal, formStepsGoal, formWorkoutGoal,
    weightUnit, volumeUnit, notifications, haptics, privateProfile, appLock,
    setUser, showToast,
  ]);

  // Gallery and camera upload handlers
  const pickImageFromGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Gallery access permissions are required to select an avatar.', 'alert');
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
  }, [showToast]);

  const takePhotoWithCamera = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showToast('Camera permissions are required to capture an avatar photo.', 'alert');
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
  }, [showToast]);

  // Sync Supabase details manually
  const handleManualSync = useCallback(async (setShowSyncing: (val: boolean) => void) => {
    triggerHaptic('selection');
    setShowSyncing(true);
    try {
      await useFitnessStore.getState().initializeFromSupabase();
      const updatedUser = useFitnessStore.getState().user;
      // Reload local form states
      setFormName(updatedUser.name);
      setFormAge(updatedUser.age.toString());
      setFormHeight(updatedUser.height.toString());

      const syncedWeight = (updatedUser.weightUnit ?? 'kg') === 'lbs' ? kgToLbs(updatedUser.weight).toString() : updatedUser.weight.toString();
      setFormWeight(syncedWeight);

      setFormGoal(updatedUser.goal);
      setFormMotto(updatedUser.motto);
      setFormCalorieGoal(updatedUser.calorieGoal);
      setFormWaterGoal(updatedUser.waterGoal);
      setFormStepsGoal(updatedUser.stepsGoal);
      setFormWorkoutGoal(updatedUser.workoutGoal);
      setFormProfilePic(updatedUser.profilePic || '');
      setNotifications(updatedUser.notificationsEnabled ?? true);
      setHaptics(updatedUser.hapticsEnabled ?? true);
      setWeightUnit(updatedUser.weightUnit ?? 'kg');
      setVolumeUnit(updatedUser.volumeUnit ?? 'ml');
      setPrivateProfile(updatedUser.privateProfileEnabled ?? false);
      setAppLock(updatedUser.appLockEnabled ?? false);
      showToast('All logs and profile details synced with cloud backup.', 'success');
    } catch (e) {
      showToast('Could not sync with Supabase. Offline cache preserved.', 'info');
    } finally {
      setShowSyncing(false);
    }
  }, [showToast]);

  // Change Password
  const handleChangePassword = useCallback(async () => {
    triggerHaptic('selection');
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user || !authData.user.email) {
        showToast('Password change is only available for online cloud accounts.', 'info');
        return;
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(authData.user.email, {
        redirectTo: 'vividly://reset-password',
      });
      if (error) throw error;
      showToast(`Password reset link sent to ${authData.user.email}.`, 'success');
    } catch (e: any) {
      showToast(formatErrorMessage(e), 'alert');
    }
  }, [showToast]);

  // Native Data Export
  const handleExportData = useCallback(async () => {
    triggerHaptic('selection');
    try {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        appName: 'Vividly Pro',
        profile: {
          name: user.name,
          age: user.age,
          height: user.height,
          weight: user.weight,
          goal: user.goal,
          motto: user.motto,
          calorieGoal: user.calorieGoal,
          waterGoal: user.waterGoal,
          stepsGoal: user.stepsGoal,
          workoutGoal: user.workoutGoal,
          preferences: { weightUnit, volumeUnit, notifications, haptics }
        },
        logs: (() => {
          const s = useFitnessStore.getState();
          return {
            weightLogs: s.weightLogs,
            waterLogs: s.waterLogs,
            stepHistory: s.stepHistory,
            meals: s.meals,
            reminders: s.reminders,
          };
        })(),
      };

      const prettyJson = JSON.stringify(exportPayload, null, 2);
      await Share.share({
        message: prettyJson,
        title: 'Vividly Personal Data Export',
      });
    } catch (e) {
      showToast('Failed to share data export payload.', 'alert');
    }
  }, [user, weightUnit, volumeUnit, notifications, haptics, showToast]);

  // Clear states
  const handleClearLocal = useCallback(async (setIsClearing: (v: boolean) => void, closeClearModal: () => void) => {
    triggerHaptic('success');
    setIsClearing(true);
    setTimeout(() => {
      useFitnessStore.setState({
        weightLogs: [], waterLogs: [], stepHistory: [],
        stepsCount: 0, activeMinutes: 0, meals: EMPTY_MEALS,
      });
      setIsClearing(false);
      closeClearModal();
      showToast('Local device history cleared successfully.', 'success');
    }, 350);
  }, [showToast]);

  const handleClearCloud = useCallback(async (setIsClearing: (v: boolean) => void, setClearResult: (r: 'success' | 'error') => void, closeClearModal: () => void) => {
    triggerHaptic('warning');
    setIsClearing(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.from('weight_logs').delete().eq('user_id', data.user.id);
        await supabase.from('water_logs').delete().eq('user_id', data.user.id);
        await supabase.from('meals').delete().eq('user_id', data.user.id);
      }
      triggerHaptic('success');
      setClearResult('success');
      setTimeout(() => {
        closeClearModal();
        showToast('Cloud database history cleared successfully.', 'success');
      }, 1600);
    } catch {
      triggerHaptic('error');
      setClearResult('error');
    } finally {
      setIsClearing(false);
    }
  }, [showToast]);

  const handleLogout = useCallback(() => {
    triggerHaptic('warning');
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Vividly?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('success');
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  }, []);

  return {
    // Profile fields
    formName, setFormName,
    formAge, setFormAge,
    formHeight, setFormHeight,
    formWeight, setFormWeight,
    formGoal, setFormGoal,
    formMotto, setFormMotto,
    formProfilePic, setFormProfilePic,
    // Goals
    formCalorieGoal, setFormCalorieGoal,
    formWaterGoal, setFormWaterGoal,
    formStepsGoal, setFormStepsGoal,
    formWorkoutGoal, setFormWorkoutGoal,
    // Units
    weightUnit, setWeightUnit, volumeUnit, setVolumeUnit,
    // Preferences
    notifications, setNotifications,
    haptics, setHaptics,
    privateProfile, setPrivateProfile,
    appLock, setAppLock,
    // Errors + handlers
    formErrors, setFormErrors,
    handleWeightUnitChange,
    handleSave,
    // Toast
    toastMessage, toastType, showToast,
    // Action functions
    pickImageFromGallery,
    takePhotoWithCamera,
    handleManualSync,
    handleChangePassword,
    handleExportData,
    handleClearLocal,
    handleClearCloud,
    handleLogout,
  };
}
