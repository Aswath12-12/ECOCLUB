import React from 'react';
import { getHouseTheme, getRankBadge } from '../../utils/constants';

export const HouseBadge = ({ house, className = '' }) => {
  if (!house) return <span className="text-slate-400 text-xs">Unassigned</span>;

  const houseCode = typeof house === 'object' ? house.code : house;
  const houseName = typeof house === 'object' ? house.name : house;
  const theme = getHouseTheme(houseCode);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${theme.badge} ${className}`}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.barFill }} />
      <span>{houseName}</span>
    </span>
  );
};

export const RankBadge = ({ rank, rankText, className = '' }) => {
  const badgeInfo = getRankBadge(rank);

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${badgeInfo.bg} ${className}`}
    >
      <span>{badgeInfo.emoji}</span>
      <span>{rankText || badgeInfo.label}</span>
    </span>
  );
};

export const StatusBadge = ({ active, trueText = 'Active', falseText = 'Inactive', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
        active
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      } ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      <span>{active ? trueText : falseText}</span>
    </span>
  );
};
