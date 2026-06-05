import { useState, useCallback } from 'react';
import { useProfileSettings } from '@/store/fitnessStore';
import { kgToLbs, lbsToKg } from '@/utils/units';
import { triggerHaptic } from '@/utils/haptics';
import { FitnessGoal } from '@/utils/algorithm';

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
  };
}
