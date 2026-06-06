import { useState, useEffect } from 'react';
import { useFitnessStore, useHydrationTracker } from '@/store/fitnessStore';
import { mlToOz, ozToMl } from '@/utils/units';
import { triggerHaptic } from '@/utils/haptics';

export function useWaterLogger() {
  const user = useFitnessStore((s) => s.user);
  const { addWaterLog, setWaterGoal } = useHydrationTracker();

  const isOz = user.volumeUnit === 'oz';
  const goalMl = user.waterGoal;

  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');
  const [customError, setCustomError] = useState('');

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoalVal, setTempGoalVal] = useState(isOz ? mlToOz(goalMl) : goalMl);

  useEffect(() => {
    setTempGoalVal(isOz ? mlToOz(goalMl) : goalMl);
  }, [goalMl, isOz]);

  const handleAddCustom = () => {
    const amt = parseInt(customVal, 10);
    const minAmt = isOz ? 1 : 10;
    const maxAmt = isOz ? 150 : 5000;
    if (isNaN(amt) || amt <= minAmt || amt > maxAmt) {
      setCustomError(`Enter amount between ${minAmt} and ${maxAmt} ${isOz ? 'oz' : 'ml'}`);
      return;
    }
    const ml = isOz ? ozToMl(amt) : amt;
    addWaterLog(ml);
    triggerHaptic('success');
    setCustomVal('');
    setShowCustom(false);
  };

  const handleSaveGoal = () => {
    const targetMl = isOz ? ozToMl(tempGoalVal) : tempGoalVal;
    if (targetMl < 500 || targetMl > 10000) return;
    setWaterGoal(targetMl);
    triggerHaptic('success');
    setShowGoalModal(false);
  };

  return {
    isOz,
    showCustom,
    setShowCustom,
    customVal,
    setCustomVal,
    customError,
    setCustomError,
    showGoalModal,
    setShowGoalModal,
    tempGoalVal,
    setTempGoalVal,
    handleAddCustom,
    handleSaveGoal,
  };
}
