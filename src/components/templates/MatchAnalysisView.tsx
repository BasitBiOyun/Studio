import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconBallFootball, IconStar } from '@tabler/icons-react';
import {
  matchAnalysisHeaderLabel,
  matchAnalysisMetricShare,
  matchAnalysisScoreFontSize,
  visibleMatchAnalysisScorers,
  visibleMatchAnalysisStats,
  visibleMatchAnalysisTakeaways,
} from '../../services/matchAnalysis';

interface TemplateProps {
  project: Project;
}

export const MatchAnalysisView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['match-analysis'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { matchAnalysisData } = templateContent;
  const data = matchAnalysisData || {
    competition: 'PREMIER LEAGUE',
    scoreline: { team1: 'ARSENAL', score1: 2, team2: 'MAN CITY', score2: 1 },
    scorersTeam1: ["Saka 34'", "Havertz 78'"],
    scorersTeam2: ["Haaland 51'"],
    stats: [
      { label: 'Expected Goals (xG)', val1: '2.14', val2: '1.08', val1Num: 2.14, val2Num: 1.08 },
      { label: 'Possession %', val1: '48%', val2: '52%', val1Num: 48, val2Num: 52 },
    ],
    tacticalSummary: 'Tactical breakdown summary of the clash.',
    keyTakeaways: ['Key takeaway 1', 'Key takeaway 2'],
    performerTitle: 'PLAYER OF THE MATCH',
    performerName: 'PLAYER NAME',
    performerNote: 'Match impact details',
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9';
  const stats = visibleMatchAnalysisStats(data.stats);
  const takeaways = visibleMatchAnalysisTakeaways(data.keyTakeaways);
  const scorersTeam1 = visibleMatchAnalysisScorers(data.scorersTeam1);
  const scorersTeam2 = visibleMatchAnalysisScorers(data.scorersTeam2);
  const hasScorers = scorersTeam1.length > 0 || scorersTeam2.length > 0;
  const hasPerformer = Boolean(data.performerName?.trim());
  const team2Accent = theme.secondaryAccent || '#64748b';

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      {/* Scoreline and compact post-match context. */}
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
            {matchAnalysisHeaderLabel(data.competition)}
          </span>
        </div>

        <h1
          className="font-black uppercase tracking-tight text-white leading-[0.92] break-words"
          style={{
            fontFamily: fontDisplay,
            fontSize: matchAnalysisScoreFontSize(data.scoreline.team1, data.scoreline.team2, isWide),
          }}
        >
          {data.scoreline.team1}{' '}
          <span style={{ color: theme.primaryAccent }}>
            {data.scoreline.score1}–{data.scoreline.score2}
          </span>{' '}
          {data.scoreline.team2}
        </h1>

        {hasScorers && (
          <div className={`grid grid-cols-2 ${isWide ? 'gap-4 mt-1' : 'gap-8 mt-2'} max-w-[1300px] text-neutral-300 font-semibold`}>
            <div className={`flex items-start gap-2 ${isWide ? 'text-[14px]' : 'text-[16px]'}`}>
              {scorersTeam1.length > 0 && (
                <>
                  <IconBallFootball size={18} className="mt-0.5 flex-shrink-0" style={{ color: theme.primaryAccent }} />
                  <span>{scorersTeam1.join(', ')}</span>
                </>
              )}
            </div>
            <div className={`flex items-start justify-end gap-2 text-right ${isWide ? 'text-[14px]' : 'text-[16px]'}`}>
              {scorersTeam2.length > 0 && (
                <>
                  <span>{scorersTeam2.join(', ')}</span>
                  <IconBallFootball size={18} className="mt-0.5 flex-shrink-0" style={{ color: team2Accent }} />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-5 my-4' : 'gap-8 my-6'} items-center`}>
        <div className={`col-span-8 flex flex-col ${isWide ? 'gap-3' : 'gap-5'} max-w-[1300px]`}>
          {data.tacticalSummary?.trim() && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: `${theme.primaryAccent}30`,
              }}
            >
              <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">
                Match Overview
              </div>
              <p className={`${isWide ? 'text-[17px]' : 'text-[21px]'} text-white font-medium leading-relaxed`}>
                {data.tacticalSummary}
              </p>
            </div>
          )}

          {stats.length > 0 && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4 gap-3' : 'p-6 gap-4'} border backdrop-blur-md flex flex-col shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="text-xs font-black tracking-widest uppercase text-neutral-400">
                Key Match Metrics
              </div>

              {stats.map((stat, index) => {
                const player1Share = matchAnalysisMetricShare(stat);

                return (
                  <div key={`${stat.label}-${index}`} className="flex flex-col gap-1.5">
                    <div className={`${isWide ? 'text-[14px]' : 'text-[16px]'} flex items-center justify-between font-bold`}>
                      <span style={{ color: theme.primaryAccent }}>{stat.val1}</span>
                      <span className="text-neutral-400 uppercase tracking-wider text-xs font-black text-center px-3">
                        {stat.label}
                      </span>
                      <span style={{ color: team2Accent }}>{stat.val2}</span>
                    </div>

                    <div className="h-3 rounded-full bg-neutral-800 overflow-hidden flex">
                      <div
                        className="h-full rounded-l-full transition-all"
                        style={{
                          width: `${player1Share}%`,
                          backgroundColor: theme.primaryAccent,
                        }}
                      />
                      <div
                        className="h-full rounded-r-full transition-all"
                        style={{
                          width: `${100 - player1Share}%`,
                          backgroundColor: team2Accent,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {takeaways.length > 0 && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-2.5">
                Key Takeaways
              </div>
              <div className="flex flex-col gap-2">
                {takeaways.map((takeaway, idx) => (
                  <div key={idx} className={`flex items-start gap-2.5 ${isWide ? 'text-[15px]' : 'text-[17px]'} text-neutral-200 font-semibold`}>
                    <span
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: theme.primaryAccent }}
                    />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasPerformer && (
            <div
              className={`rounded-2xl ${isWide ? 'p-3.5' : 'p-4'} border backdrop-blur-md flex items-center justify-between gap-5 shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.9)',
                borderColor: `${theme.primaryAccent}40`,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0"
                  style={{
                    backgroundColor: `${theme.primaryAccent}15`,
                    borderColor: `${theme.primaryAccent}35`,
                    color: theme.primaryAccent,
                  }}
                >
                  <IconStar size={22} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
                    {data.performerTitle?.trim() || 'PLAYER OF THE MATCH'}
                  </div>
                  <div
                    className={`${isWide ? 'text-[22px]' : 'text-[26px]'} font-black uppercase tracking-tight text-white leading-none truncate`}
                    style={{ fontFamily: fontDisplay }}
                  >
                    {data.performerName}
                  </div>
                </div>
              </div>

              {data.performerNote?.trim() && (
                <div className={`${isWide ? 'text-[13px]' : 'text-[15px]'} text-right font-bold text-neutral-300 max-w-[48%]`}>
                  {data.performerNote}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side remains open for the player cutout. */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
