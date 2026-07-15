import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import { useShallow } from 'zustand/react/shallow';
import { calculateWorkoutCalories, calculateWorkoutStats } from '../utils/workoutCalculations';
import { triggerHaptic } from '@/utils/haptics';
import { Alert } from 'react-native';

export function useWorkoutsScreen() {
  const store = useFitnessStore(useShallow((s) => ({
    workoutLogs: s.workoutLogs,
    addWorkoutLog: s.addWorkoutLog,
    deleteWorkoutLog: s.deleteWorkoutLog,
    activeMinutes: s.activeMinutes,
    user: s.user,
  })));

  const {
    workoutLogs,
    addWorkoutLog,
    deleteWorkoutLog,
    activeMinutes,
    user,
  } = store;

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('Full Body');
  const [durationInput, setDurationInput] = useState('45');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [notesInput, setNotesInput] = useState('');

  // Manual hours and minutes states
  const [durationHours, setDurationHours] = useState('0');
  const [durationMins, setDurationMins] = useState('45');

  // Live Stopwatch states
  const [isStopwatchMode, setIsStopwatchMode] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const stopwatchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync manual inputs when either changes
  const handleManualTimeChange = useCallback((h: string, m: string) => {
    setDurationHours(h);
    setDurationMins(m);
    const hrs = parseInt(h || '0', 10);
    const mins = parseInt(m || '0', 10);
    setDurationInput((hrs * 60 + mins).toString());
  }, []);

  // Stopwatch ticking interval
  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
        stopwatchIntervalRef.current = null;
      }
    }
    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [stopwatchRunning]);

  // Clean reset when modal closes
  const closeAddModal = useCallback(() => {
    setStopwatchRunning(false);
    setStopwatchSeconds(0);
    setIsStopwatchMode(false);
    setShowAddModal(false);
    setNotesInput('');
  }, []);

  const handleOpenAddModal = useCallback(() => {
    triggerHaptic('selection');
    setDurationHours('0');
    setDurationMins('45');
    setDurationInput('45');
    setSelectedType('Full Body');
    setIntensity('medium');
    setNotesInput('');
    setIsStopwatchMode(false);
    setStopwatchSeconds(0);
    setStopwatchRunning(false);
    setShowAddModal(true);
  }, []);

  // Statistics computations
  const stats = useMemo(() => calculateWorkoutStats(workoutLogs), [workoutLogs]);

  // Calories calculated helper based on current selection
  const computedCaloriesPreview = useMemo(() => {
    const dur = parseInt(durationInput, 10);
    if (isNaN(dur) || dur <= 0) return 0;
    return calculateWorkoutCalories(selectedType, dur, intensity, user.weight);
  }, [selectedType, durationInput, intensity, user.weight]);

  const handleSaveWorkout = useCallback(() => {
    const duration = parseInt(durationInput, 10);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid workout duration.');
      return;
    }

    triggerHaptic('success');
    const calories = calculateWorkoutCalories(selectedType, duration, intensity, user.weight);

    // Save workout log to store
    addWorkoutLog({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: selectedType,
      durationMin: duration,
      intensity,
      caloriesBurned: calories,
      notes: notesInput.trim(),
    });

    closeAddModal();
  }, [durationInput, selectedType, intensity, user.weight, notesInput, addWorkoutLog, closeAddModal]);

  const handleDeleteWorkout = useCallback((id: string) => {
    triggerHaptic('warning');
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('success');
            deleteWorkoutLog(id);
          },
        },
      ]
    );
  }, [deleteWorkoutLog]);

  return {
    workoutLogs,
    activeMinutes,
    workoutGoal: user.workoutGoal,
    user,
    showAddModal,
    handleOpenAddModal,
    closeAddModal,
    selectedType,
    setSelectedType,
    durationInput,
    setDurationInput,
    intensity,
    setIntensity,
    notesInput,
    setNotesInput,
    durationHours,
    durationMins,
    handleManualTimeChange,
    isStopwatchMode,
    setIsStopwatchMode,
    stopwatchSeconds,
    setStopwatchSeconds,
    stopwatchRunning,
    setStopwatchRunning,
    stats,
    computedCaloriesPreview,
    handleSaveWorkout,
    handleDeleteWorkout,
  };
}
