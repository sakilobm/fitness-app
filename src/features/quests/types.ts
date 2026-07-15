export interface QuestAction {
  label: string;
  amount: number;
}

export interface QuestItemType {
  id: string;
  title: string;
  subtext: string;
  icon: string;
  iconLib: 'Ionicons' | 'MCI';
  color: string;
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
  actions: QuestAction[];
  onQuickLog: (amount: number) => void;
  onCompleteRemaining: () => void;
  onPress: () => void;
}
