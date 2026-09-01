import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconInfoCircle, IconTrophy } from '@tabler/icons-react';
import {
  rankingMeta,
  rankingNameFontSize,
  rankingTitleFontSize,
  rankingValueFontSize,
  visibleRankingItems,
} from '../../services/ranking';

interface TemplateProps {
  project: Project;
}

export const RankingTopListView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['ranking-top-list'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { rankingData } = templateContent;
  const data = rankingData || {
    categoryTitle: 'TOP 5 RANKING',
    subtitle: 'LEADERBOARD',
    metricHeader: 'Metric /90',
    seasonFilter: '2025/26 SEASON',
    items: [],
    footerNote: '',
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9' || project.aspectRatio === 'x-landscape';
  const items = visibleRankingItems(data.items || []);
  const hasSeason = Boolean(data.seasonFilter?.trim());
  const hasSubtitle = Boolean(data.subtitle?.trim());
  const hasMetricHeader = Boolean(data.metricHeader?.trim());
  const hasFooterNote = Boolean(data.footerNote?.trim());

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border inline-flex items-center gap-2"
            style={{
              backgroundColor: `${theme.primaryAccent}20`,
              borderColor: `${theme.primaryAccent}50`,
              color: theme.primaryAccent,
            }}
          >
            <IconTrophy size={15} />
            Leaderboard Rankings
          </span>
          {hasSeason && (
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {data.seasonFilter}
            </span>
          )}
        </div>

        <h1
          className="font-black uppercase tracking-tight text-white leading-[0.9] drop-shadow-md"
          style={{
            fontFamily: fontDisplay,
            fontSize: rankingTitleFontSize(data.categoryTitle, isWide),
          }}
        >
          {data.categoryTitle}
        </h1>

        {hasSubtitle && (
          <div
            className={`${isWide ? 'text-[25px]' : 'text-[32px]'} font-bold uppercase tracking-wider mt-1`}
            style={{
              fontFamily: fontDisplay,
              color: theme.primaryAccent,
            }}
          >
            {data.subtitle}
          </div>
        )}
      </div>

      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-5 my-4' : 'gap-8 my-6'} items-center`}>
        <div className={`col-span-8 flex flex-col ${isWide ? 'gap-2' : 'gap-3'} max-w-[1300px] min-w-0`}>
          {items.length > 0 && (
            <div className={`grid grid-cols-[72px_minmax(0,1fr)_180px] items-center ${isWide ? 'px-4 py-1.5' : 'px-6 py-2'} text-xs font-black uppercase tracking-widest text-neutral-400`}>
              <div>Rank</div>
              <div className="pl-4">Player & Club</div>
              <div className="text-right truncate">{hasMetricHeader ? data.metricHeader : ''}</div>
            </div>
          )}

          {items.map((item) => {
            const isFirst = item.rank === 1;
            const isHighlighted = Boolean(item.highlighted || isFirst);
            const meta = rankingMeta(item.club, item.subVal);

            return (
              <div
                key={item.id}
                className={`rounded-2xl ${isWide ? 'p-3.5' : 'p-5'} border backdrop-blur-md grid grid-cols-[72px_minmax(0,1fr)_180px] items-center shadow-xl`}
                style={{
                  backgroundColor: isHighlighted
                    ? 'rgba(10, 14, 26, 0.95)'
                    : 'rgba(10, 14, 26, 0.75)',
                  borderColor: isHighlighted
                    ? `${theme.primaryAccent}60`
                    : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  className={`${isWide ? 'w-11 h-11 text-[21px]' : 'w-12 h-12 text-2xl'} rounded-xl flex items-center justify-center font-black flex-shrink-0`}
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

                <div className="pl-4 min-w-0">
                  <div
                    className="font-black uppercase tracking-tight text-white leading-none flex items-center gap-2 min-w-0"
                    style={{
                      fontFamily: fontDisplay,
                      fontSize: rankingNameFontSize(item.playerName, isWide),
                    }}
                  >
                    <span className="truncate">{item.playerName}</span>
                    {isFirst && <IconTrophy size={20} style={{ color: theme.primaryAccent }} className="flex-shrink-0" />}
                  </div>
                  {meta && (
                    <div className={`${isWide ? 'text-[13px]' : 'text-[16px]'} font-bold text-neutral-400 uppercase mt-1 truncate`}>
                      {meta}
                    </div>
                  )}
                </div>

                <div className="text-right min-w-0">
                  <span
                    className="font-black tracking-tight tabular-nums whitespace-nowrap"
                    style={{
                      fontFamily: fontDisplay,
                      color: isHighlighted ? theme.primaryAccent : '#ffffff',
                      fontSize: rankingValueFontSize(item.val, isWide),
                    }}
                  >
                    {item.val}
                  </span>
                </div>
              </div>
            );
          })}

          {hasFooterNote && (
            <div className="text-xs font-semibold text-neutral-400 px-3 mt-1 flex items-start gap-2 leading-relaxed">
              <IconInfoCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{data.footerNote.trim()}</span>
            </div>
          )}
        </div>

        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
