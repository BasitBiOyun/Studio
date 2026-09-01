import React from 'react';
import { StatItem, ThemeColors } from '../../types';
import { StatIcon } from '../StatIcon';
import { scaledTemplateFontSize } from '../../services/templateTypography';

interface EditorialStatCardProps {
  stat: StatItem;
  theme: ThemeColors;
  fontDisplay?: string;
  className?: string;
  layout?: any;
}

export const EditorialStatCard: React.FC<EditorialStatCardProps> = ({
  stat,
  theme,
  fontDisplay = "'Barlow Condensed', sans-serif",
  className = '',
  layout,
}) => {
  const valLength = (stat.value || '').length;
  const valFontSize = valLength > 6 ? '34px' : valLength > 4 ? '40px' : '48px';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-3 flex flex-col justify-between border backdrop-blur-md transition-all shadow-2xl ${className}`}
      style={{
        backgroundColor: 'rgba(8, 12, 22, 0.90)',
        borderColor: `${theme.primaryAccent}35`,
        boxShadow: `0 15px 35px -5px rgba(0,0,0,0.8), 0 0 15px -3px ${theme.primaryAccent}15`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${theme.primaryAccent} 0%, ${theme.secondaryAccent || theme.primaryAccent} 70%, transparent 100%)` }}
      />

      <div className="flex items-start justify-between gap-3 mb-2">
        <div
          className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-inner"
          style={{ backgroundColor: `${theme.primaryAccent}18`, borderColor: `${theme.primaryAccent}45`, color: theme.primaryAccent }}
        >
          <StatIcon name={stat.icon} size={16} color={theme.primaryAccent} />
        </div>
        {stat.subValue && (
          <span
            className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded font-black tracking-wider uppercase"
            style={{ color: theme.primaryAccent, fontSize: scaledTemplateFontSize(11, layout, 'body', 9, 14) }}
          >
            {stat.subValue}
          </span>
        )}
      </div>

      <div className="mb-2">
        <div
          className="font-black tracking-tight leading-none text-white tabular-nums drop-shadow-md flex items-baseline gap-1"
          style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(valFontSize, layout, 'stat', 26, 60) }}
        >
          <span>{stat.value || '0.00'}</span>
        </div>
      </div>

      <div className="mt-auto pt-1">
        <div
          className="font-bold tracking-wide text-neutral-300 leading-snug"
          style={{ fontSize: scaledTemplateFontSize(12, layout, 'body', 10, 16) }}
        >
          {stat.label || 'Metric /90'}
        </div>
      </div>
    </div>
  );
};
