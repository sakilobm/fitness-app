export type TabName =
  | 'index' | 'weight' | 'nutrition' | 'calendar'
  | 'sleep' | 'vitals'  | 'reminders' | 'profile' | 'cycle';

export const ALL_TABS: TabName[] = [
  'index', 'weight', 'nutrition', 'calendar',
  'sleep', 'vitals', 'reminders', 'profile', 'cycle',
];

export const DEFAULT_PRIMARY: TabName[] = ['index', 'sleep', 'vitals', 'calendar'];

export const TAB_LABELS: Record<TabName, string> = {
  index:     'Home',
  weight:    'Weight',
  nutrition: 'Food',
  calendar:  'Calendar',
  sleep:     'Sleep',
  vitals:    'Vitals',
  reminders: 'Remind',
  profile:   'Profile',
  cycle:     'Cycle',
};

export type TabMeta = {
  label:    string;
  color:    string;
  desc:     string;
  lib:      'ION' | 'MCI';
  icon:     string;
  iconFill: string;
};

export const TAB_META: Record<TabName, TabMeta> = {
  index:     { label: 'Home',      color: '#34D399', desc: 'Dashboard overview',       lib: 'ION', icon: 'home-outline',          iconFill: 'home'           },
  weight:    { label: 'Weight',    color: '#A78BFA', desc: 'Log & track your weight',  lib: 'MCI', icon: 'scale-bathroom',        iconFill: 'scale-bathroom' },
  nutrition: { label: 'Food',      color: '#FB923C', desc: 'Meals, macros & calories', lib: 'MCI', icon: 'food-apple-outline',    iconFill: 'food-apple'     },
  calendar:  { label: 'Calendar',  color: '#60A5FA', desc: 'Daily activity calendar',  lib: 'ION', icon: 'calendar-outline',      iconFill: 'calendar'       },
  sleep:     { label: 'Sleep',     color: '#818CF8', desc: 'Sleep cycles & tracking',  lib: 'ION', icon: 'moon-outline',          iconFill: 'moon'           },
  vitals:    { label: 'Vitals',    color: '#F472B6', desc: 'Heart rate, BP & more',    lib: 'ION', icon: 'heart-outline',         iconFill: 'heart'          },
  reminders: { label: 'Reminders', color: '#FBBF24', desc: 'Health & activity alerts', lib: 'ION', icon: 'notifications-outline', iconFill: 'notifications'  },
  profile:   { label: 'Profile',   color: '#38BDF8', desc: 'Profile & app settings',   lib: 'ION', icon: 'person-outline',        iconFill: 'person'         },
  cycle:     { label: 'Cycle',     color: '#F87171', desc: 'Period & cycle tracking',   lib: 'ION', icon: 'flower-outline',        iconFill: 'flower'         },
};
