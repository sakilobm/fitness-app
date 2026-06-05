import { useState } from 'react';
import { useProfileSettings, useBmiTracker } from '@/store/fitnessStore';
import { kgToLbs, lbsToKg } from '@/utils/units';

export function useWeightLogger() {
  const { user } = useProfileSettings();
  const { weightLogs, addWeightLog } = useBmiTracker();

  const isLbs = user.weightUnit === 'lbs';
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 78.4;
  const displayCurrentWeight = isLbs ? kgToLbs(currentWeight) : currentWeight;

  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logWeightValue, setLogWeightValue] = useState(displayCurrentWeight.toFixed(1));
  const [logDateOffset, setLogDateOffset] = useState<'today' | 'yesterday'>('today');
  const [logTimeOfDay, setLogTimeOfDay] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [logError, setLogError] = useState('');

  const openLogModal = () => {
    setLogWeightValue(displayCurrentWeight.toFixed(1));
    setLogDateOffset('today');
    setLogError('');
    const hr = new Date().getHours();
    if (hr < 12) setLogTimeOfDay('morning');
    else if (hr < 17) setLogTimeOfDay('afternoon');
    else setLogTimeOfDay('night');
    setLogModalVisible(true);
  };

  const handleAdjustWeight = (amount: number) => {
    const nextVal = parseFloat(logWeightValue) + amount;
    const minWeight = isLbs ? 66 : 30;
    const maxWeight = isLbs ? 660 : 300;
    if (!isNaN(nextVal) && nextVal > minWeight && nextVal < maxWeight) {
      setLogWeightValue(nextVal.toFixed(1));
    }
  };

  const handleSaveWeightLog = () => {
    const val = parseFloat(logWeightValue);
    const minWeight = isLbs ? 66 : 30;
    const maxWeight = isLbs ? 660 : 300;
    if (isNaN(val) || val <= minWeight || val >= maxWeight) {
      setLogError(`Enter weight between ${minWeight} and ${maxWeight} ${isLbs ? 'lbs' : 'kg'}`);
      return;
    }
    const savedWeight = isLbs ? lbsToKg(val) : val;
    addWeightLog(parseFloat(savedWeight.toFixed(1)), logTimeOfDay, logDateOffset);
    setLogModalVisible(false);
  };

  return {
    isLbs,
    logModalVisible,
    setLogModalVisible,
    logWeightValue,
    setLogWeightValue,
    logDateOffset,
    setLogDateOffset,
    logTimeOfDay,
    setLogTimeOfDay,
    logError,
    setLogError,
    openLogModal,
    handleAdjustWeight,
    handleSaveWeightLog,
  };
}
