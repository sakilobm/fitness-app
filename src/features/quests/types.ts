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

export interface CustomQuest {
  id: string;
  name: string;
  target: number;
  unit: string;
  durationDays: number;
  startDate: string; // YYYY-MM-DD
  icon: string;
  color: string;
  createdAt: string;
}

export interface CustomQuestLog {
  id: string;
  questId: string;
  date: string; // YYYY-MM-DD
  progress: number;
}
