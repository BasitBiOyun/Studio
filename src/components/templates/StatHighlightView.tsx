import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { EditorialStatCard } from '../design/EditorialStatCard';
import { IconTrophy } from '@tabler/icons-react';
import {
  statHighlightHeroFontSize,
  statHighlightSubjectFontSize,
  statHighlightSubjectMeta,
  visibleStatHighlightMetrics,
} from '../../services/statHighlight';

interface TemplateProps {
  project: Project;
}

export const StatHighlightView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['stat-highlight'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { statHighlightData } = templateContent;
  const data = statHighlightData || {
    heroStat: '94.2%',
    heroStatLabel: 'Stat Metric Headline',
    rankBadge: '#1 IN LEAGUE',
    categoryTag: 'STANDOUT STAT',
    sampleSize: '2025/26 SEASON',
    contextMetrics: templateContent.stats || [],
    editorialVerdict: 'Editorial analysis of the standout metric.',
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9';
  const explicitSubject = String((data as any).subject || '').trim();
  const subject = explicitSubject || player?.name || 'STAT HIGHLIGHT';
  const explicitSubjectMeta = String((data as any).subjectContext || '').trim();
  const subjectMeta = explicitSubject
    ? explicitSubjectMeta
    : statHighlightSubjectMeta(player?.positions, player?.club);
  const metrics = visibleStatHighlightMetrics(data.contextMetrics || []);
  const hasCategory = Boolean(data.categoryTag?.trim());
  const hasSample = Boolean(data.sampleSize?.trim());
  const hasRank = Boolean(data.rankBadge?.trim());
  const hasVerdict = Boolean(data.editorialVerdict?.trim());

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      <div>
        {(hasCategory || hasSample) && (
          <div className="flex items-center gap-3 mb-2">
            {hasCategory && (
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
            )}
            {hasSample && (
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {data.sampleSize}
              </span>
            )}
          </div>
        )}

        <h1
          className="font-black uppercase tracking-tight text-white leading-[0.92] drop-shadow-md"
          style={{
            fontFamily: fontDisplay,
            fontSize: statHighlightSubjectFontSize(subject, isWide),
          }}
        >
          {subject}
        </h1>

        {subjectMeta && (
          <div
            className={`${isWide ? 'text-[26px]' : 'text-[32px]'} font-bold uppercase tracking-wider mt-1`}
            style={{
              fontFamily: fontDisplay,
              color: theme.primaryAccent,
            }}
          >
            {subjectMeta}
          </div>
        )}
      </div>

      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-5 my-4' : 'gap-8 my-6'} items-center`}>
        <div className={`col-span-8 flex flex-col ${isWide ? 'gap-4' : 'gap-6'} max-w-[1300px]`}>
          <div
            className={`rounded-3xl ${isWide ? 'p-6' : 'p-8'} border backdrop-blur-md relative overflow-hidden shadow-2xl`}
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.9)',
              borderColor: `${theme.primaryAccent}45`,
            }}
          >
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 pointer-events-none blur-3xl"
              style={{ backgroundColor: theme.primaryAccent }}
            />

            {hasRank && (
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-4 py-1.5 rounded-xl text-sm font-black tracking-wider uppercase border inline-flex items-center gap-2"
                  style={{
                    backgroundColor: `${theme.primaryAccent}20`,
                    borderColor: `${theme.primaryAccent}45`,
                    color: theme.primaryAccent,
                  }}
                >
                  <IconTrophy size={16} />
                  {data.rankBadge}
                </span>
              </div>
            )}

            <div
              className="font-black tracking-tight leading-none text-white tabular-nums drop-shadow-xl"
              style={{
                fontFamily: fontDisplay,
                color: theme.primaryAccent,
                fontSize: statHighlightHeroFontSize(data.heroStat, isWide),
              }}
            >
              {data.heroStat}
            </div>

            {data.heroStatLabel && (
              <div className={`${isWide ? 'text-[23px]' : 'text-[28px]'} font-bold text-white tracking-wide mt-2`}>
                {data.heroStatLabel}
              </div>
            )}
          </div>

          {metrics.length > 0 && (
            <div className={`grid ${metrics.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              {metrics.map((stat) => (
                <EditorialStatCard
                  key={stat.id}
                  stat={stat}
                  theme={theme}
                  fontDisplay={fontDisplay}
                />
              ))}
            </div>
          )}

          {hasVerdict && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-5'} border backdrop-blur-md shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">
                DATA INTERPRETATION
              </div>
              <p className={`${isWide ? 'text-[17px]' : 'text-[19px]'} text-neutral-200 font-medium leading-relaxed`}>
                {data.editorialVerdict.trim()}
              </p>
            </div>
          )}
        </div>

        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
