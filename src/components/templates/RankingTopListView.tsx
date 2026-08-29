import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconTrophy, IconFlame } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const RankingTopListView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { rankingData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = rankingData || {
    categoryTitle: 'TOP 5 RANKING',
    subtitle: 'LEADERBOARD',
    metricHeader: 'Metric /90',
    seasonFilter: '2025/26 SEASON',
    items: [],
    footerNote: 'Source data.',
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";

  return (
    <div className="relative z-20 w-full h-full flex flex-col justify-between p-14 md:p-16 select-none">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border"
            style={{
              backgroundColor: `${theme.primaryAccent}20`,
              borderColor: `${theme.primaryAccent}50`,
              color: theme.primaryAccent,
            }}
          >
            🏆 Leaderboard Rankings
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {data.seasonFilter}
          </span>
        </div>

        <h1
          className="text-[96px] font-black uppercase tracking-tight text-white leading-[0.9] drop-shadow-md"
          style={{ fontFamily: fontDisplay }}
        >
          {data.categoryTitle}
        </h1>

        <div
          className="text-[32px] font-bold uppercase tracking-wider mt-1"
          style={{
            fontFamily: fontDisplay,
            color: theme.primaryAccent,
          }}
        >
          {data.subtitle}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 my-6 items-center">
        {/* Left Column: Top Rankings List */}
        <div className="col-span-8 flex flex-col gap-3 max-w-[1300px]">
          {/* Header Row */}
          <div className="flex items-center justify-between px-6 py-2 text-xs font-black uppercase tracking-widest text-neutral-400">
            <div className="w-16">Rank</div>
            <div className="flex-1 pl-4">Player & Club</div>
            <div className="text-right">{data.metricHeader}</div>
          </div>

          {/* Ranking Cards */}
          {data.items.map((item) => {
            const isFirst = item.rank === 1;
            const isHighlighted = item.highlighted || isFirst;

            return (
              <div
                key={item.id}
                className="rounded-2xl p-5 border backdrop-blur-md flex items-center justify-between shadow-xl transition-all"
                style={{
                  backgroundColor: isHighlighted
                    ? 'rgba(10, 14, 26, 0.95)'
                    : 'rgba(10, 14, 26, 0.75)',
                  borderColor: isHighlighted
                    ? `${theme.primaryAccent}60`
                    : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Rank Number Badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl flex-shrink-0"
                  style={{
                    backgroundColor: isFirst
                      ? theme.primaryAccent
                      : isHighlighted
                      ? `${theme.primaryAccent}30`
                      : 'rgba(255,255,255,0.06)',
                    color: isFirst ? '#000000' : '#ffffff',
                  }}
                >
                  #{item.rank}
                </div>

                {/* Player Name & Club */}
                <div className="flex-1 pl-6">
                  <div
                    className="text-[34px] font-black uppercase tracking-tight text-white leading-none flex items-center gap-3"
                    style={{ fontFamily: fontDisplay }}
                  >
                    <span>{item.playerName}</span>
                    {isFirst && <IconTrophy size={22} className="text-amber-400" />}
                  </div>
                  <div className="text-[16px] font-bold text-neutral-400 uppercase mt-1">
                    {item.club} {item.subVal ? `• ${item.subVal}` : ''}
                  </div>
                </div>

                {/* Stat Big Value */}
                <div className="text-right">
                  <span
                    className="text-[44px] font-black tracking-tight tabular-nums"
                    style={{
                      fontFamily: fontDisplay,
                      color: isHighlighted ? theme.primaryAccent : '#ffffff',
                    }}
                  >
                    {item.val}
                  </span>
                </div>
              </div>
            );
          })}

          {data.footerNote && (
            <div className="text-xs font-semibold text-neutral-400 px-3 mt-1">
              ℹ️ {data.footerNote}
            </div>
          )}
        </div>

        {/* Right side is intentionally open for Spotlight Photo */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
