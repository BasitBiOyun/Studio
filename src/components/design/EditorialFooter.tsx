import React from 'react';
import { Credits, ThemeColors, VisualMode } from '../../types';

interface EditorialFooterProps {
  credits: Credits;
  theme: ThemeColors;
  visualMode?: VisualMode;
  className?: string;
}

export const EditorialFooter: React.FC<EditorialFooterProps> = ({
  credits,
  theme,
  visualMode = 'editorial',
  className = '',
}) => {
  return (
    <div
      className={`relative z-20 w-full flex items-center justify-between border-t pt-4 select-none ${className}`}
      style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
    >
      {/* Left Attribution / Prepared for */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-2 h-2 rounded-full shadow-sm"
          style={{ backgroundColor: theme.primaryAccent }}
        />
        <span className="text-[15px] font-bold tracking-wider text-neutral-400">
          {credits.preparedFor || 'Football Editorial Analytics'}
        </span>
      </div>

      {/* Right Brand Badge */}
      <div className="flex items-center gap-2.5">
        <span className="text-[15px] font-black tracking-widest text-neutral-300">
          {credits.visualBy || 'Visual by @BasitBiOyun'}
        </span>
      </div>
    </div>
  );
};
