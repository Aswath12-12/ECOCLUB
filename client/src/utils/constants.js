export const DEFAULT_STUDENT_PASSWORD = 'eocsxcce';

export const DEPARTMENTS = ['IT', 'CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'AI&DS', 'BIOTECH'];
export const YEARS = ['I', 'II', 'III', 'IV'];
export const CLASSES = ['A', 'B', 'C'];

export const HOUSE_THEMES = {
  GREEN: {
    code: 'GREEN',
    name: 'Green House',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    barFill: '#10B981',
    gradient: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-600'
  },
  BLUE: {
    code: 'BLUE',
    name: 'Blue House',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    barFill: '#3B82F6',
    gradient: 'from-blue-500 to-indigo-600',
    iconColor: 'text-blue-600'
  },
  RED: {
    code: 'RED',
    name: 'Red House',
    bgLight: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    barFill: '#EF4444',
    gradient: 'from-rose-500 to-red-600',
    iconColor: 'text-rose-600'
  },
  YELLOW: {
    code: 'YELLOW',
    name: 'Yellow House',
    bgLight: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    barFill: '#F59E0B',
    gradient: 'from-amber-500 to-yellow-600',
    iconColor: 'text-amber-600'
  }
};

export const getHouseTheme = (houseCode) => {
  if (!houseCode) return HOUSE_THEMES.GREEN;
  const code = String(houseCode).toUpperCase();
  return HOUSE_THEMES[code] || HOUSE_THEMES.GREEN;
};

export const getRankBadge = (rank) => {
  const r = parseInt(rank, 10);
  switch (r) {
    case 1:
      return { emoji: '🥇', label: '1st', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
    case 2:
      return { emoji: '🥈', label: '2nd', bg: 'bg-slate-200 text-slate-800 border-slate-300' };
    case 3:
      return { emoji: '🥉', label: '3rd', bg: 'bg-orange-100 text-orange-900 border-orange-300' };
    default:
      return { emoji: '🏅', label: `${rank || 4}th`, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  }
};
