import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { EditorialStatCard } from '../design/EditorialStatCard';
import { IconFlame, IconAward } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const StatHighlightView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { statHighlightData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = statHighlightData || {
    heroStat: '94.2%',
    heroStatLabel: 'Stat Metric Headline',
    rankBadge: '#1 IN LEAGUE',
    categoryTag: 'STANDOUT STAT',
    sampleSize: '2025/26 SEASON',
    contextMetrics: project.stats,
    editorialVerdict: 'Editorial analysis of the standout metric.',
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9';

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
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
            {data.categoryTag}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {data.sampleSize}
          </span>
        </div>

        <h1
          className="text-[88px] font-black uppercase tracking-tight text-white leading-[0.92] drop-shadow-md"
          style={{ fontFamily: fontDisplay }}
        >
          {project.sharedData?.player?.name}
        </h1>

        <div
          className="text-[32px] font-bold uppercase tracking-wider mt-1"
          style={{
            fontFamily: fontDisplay,
            color: theme.primaryAccent,
          }}
        >
          {project.sharedData?.player?.positions} • {project.sharedData?.player?.club}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 my-6 items-center">
        {/* Left Column: Massive Hero Stat Number + Context Cards */}
        <div className="col-span-8 flex flex-col gap-6 max-w-[1300px]">
          {/* Standout Hero Stat Panel */}
          <div
            className="rounded-3xl p-8 border backdrop-blur-md relative overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.9)',
              borderColor: `${theme.primaryAccent}45`,
            }}
          >
            {/* Background Glow */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none blur-3xl"
              style={{ backgroundColor: theme.primaryAccent }}
            />

            <div className="flex items-center justify-between mb-2">
              <span
                className="px-4 py-1.5 rounded-xl text-sm font-black tracking-wider uppercase border"
                style={{
                  backgroundColor: `${theme.primaryAccent}20`,
                  borderColor: `${theme.primaryAccent}45`,
                  color: theme.primaryAccent,
                }}
              >
                🏆 {data.rankBadge}
              </span>
            </div>

            {/* Giant Hero Stat */}
            <div
              className="text-[130px] font-black tracking-tight leading-none text-white tabular-nums drop-shadow-xl"
              style={{
                fontFamily: fontDisplay,
                color: theme.primaryAccent,
              }}
            >
              {data.heroStat}
            </div>

            {/* Hero Stat Label */}
            <div className="text-[28px] font-bold text-white tracking-wide mt-2">
              {data.heroStatLabel}
            </div>
          </div>

          {/* Context 4 Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {data.contextMetrics.slice(0, 4).map((st) => (
              <EditorialStatCard
                key={st.id}
                stat={st}
                theme={theme}
                fontDisplay={fontDisplay}
              />
            ))}
          </div>

          {/* Editorial Verdict Callout */}
          <div
            className="rounded-2xl p-5 border backdrop-blur-md shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">
              Data Interpretation
            </div>
            <p className="text-[19px] text-neutral-200 font-medium leading-relaxed">
              {data.editorialVerdict}
            </p>
          </div>
        </div>

        {/* Right side is open for Player Cutout Photo */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
