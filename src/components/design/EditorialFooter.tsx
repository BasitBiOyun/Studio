import React from 'react';
import { Credits, ThemeColors, VisualMode } from '../../types';

const brandLogoUrl = new URL('../../assets/basitbioyun-logo.jpg', import.meta.url).href;

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
      <div className="flex items-center gap-2.5">
        <div
          className="w-2 h-2 rounded-full shadow-sm"
          style={{ backgroundColor: theme.primaryAccent }}
        />
        <span className="text-[15px] font-bold tracking-wider text-neutral-400">
          {credits.preparedFor || 'Football Editorial Analytics'}
        </span>
      </div>

      <div className="relative h-[18px] w-[68px] flex-shrink-0" aria-label="BasitBiOyun">
        <img
          src={brandLogoUrl}
          alt="BasitBiOyun"
          draggable={false}
          className="pointer-events-none absolute right-0 bottom-[-2px] w-[64px] h-[64px] object-cover select-none"
        />
      </div>
    </div>
  );
};
