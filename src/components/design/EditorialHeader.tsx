import React, { useMemo } from 'react';
import { ThemeColors, VisualMode } from '../../types';

interface EditorialHeaderProps {
  categoryBadge?: string;
  title: string;
  subtitle?: string;
  metaBadges?: { label: string; value: React.ReactNode }[];
  theme: ThemeColors;
  fontDisplay?: string;
  visualMode?: VisualMode;
  className?: string;
}

export const EditorialHeader: React.FC<EditorialHeaderProps> = ({
  categoryBadge,
  title,
  subtitle,
  metaBadges,
  theme,
  fontDisplay = "'Barlow Condensed', sans-serif",
  visualMode = 'editorial',
  className = '',
}) => {
  // Title Split: e.g. "MOMODOU SONKO" -> First: "MOMODOU", Last: "SONKO"
  const nameParts = (title || '').trim().split(' ');
  const hasMultipleWords = nameParts.length > 1;
  const firstName = hasMultipleWords ? nameParts.slice(0, -1).join(' ') : '';
  const lastName = hasMultipleWords ? nameParts[nameParts.length - 1] : title;

  // Dynamic Title Sizing
  const titleFontSize = useMemo(() => {
    const len = (lastName || title || '').length;
    if (len <= 6) return '74px';
    if (len <= 10) return '64px';
    if (len <= 14) return '54px';
    return '46px';
  }, [lastName, title]);

  return (
    <div className={`flex flex-col gap-2 relative z-20 ${className}`}>
      {/* Category Bar with Stencil Pin */}
      {categoryBadge && (
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11.5px] font-black tracking-widest uppercase border backdrop-blur-md shadow-sm"
            style={{
              backgroundColor: `${theme.primaryAccent}18`,
              borderColor: `${theme.primaryAccent}50`,
              color: theme.primaryAccent,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.primaryAccent }} />
            <span>{categoryBadge}</span>
          </div>

          <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-r from-white/30 to-transparent" />
        </div>
      )}

      {/* Main Player Display Name */}
      <div className="select-none">
        {firstName && (
          <div
            className="text-[20px] font-black uppercase tracking-[0.2em] text-neutral-300 leading-none mb-1 opacity-90"
            style={{ fontFamily: fontDisplay }}
          >
            {firstName}
          </div>
        )}

        <h1
          className="font-black uppercase tracking-tight leading-[0.9] text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] flex items-baseline gap-3"
          style={{
            fontFamily: fontDisplay,
            fontSize: titleFontSize,
          }}
        >
          <span>{lastName}</span>
        </h1>
      </div>

      {/* Subtitle / Role Line */}
      {subtitle && (
        <div className="flex items-center gap-3">
          <div
            className="text-[22px] font-black uppercase tracking-wider leading-none"
            style={{
              fontFamily: fontDisplay,
              color: theme.primaryAccent,
            }}
          >
            {subtitle}
          </div>
          <div className="h-[2px] w-6 rounded-full" style={{ backgroundColor: theme.primaryAccent }} />
        </div>
      )}

      {/* Metadata Badges Row */}
      {metaBadges && metaBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {metaBadges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg border backdrop-blur-md shadow-md"
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: idx === 0 ? `${theme.primaryAccent}45` : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-[11.5px] font-black uppercase tracking-wider text-neutral-400">
                {badge.label}
              </span>
              <span className="text-[14.5px] font-bold text-white tracking-wide whitespace-nowrap">
                {badge.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
