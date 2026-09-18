import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-7 h-7',
    large: 'w-10 h-10'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center text-slate-500 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} animate-spin text-eco-600 mb-3`} />
      {message && <p className="text-sm font-medium animate-pulse text-slate-600">{message}</p>}
    </div>
  );
};
