import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconBallFootball, IconStar } from '@tabler/icons-react';
import {
  matchResultHeaderContext,
  matchResultMvpNameFontSize,
  matchResultScoreFontSize,
  visibleMatchResultScorers,
  visibleMatchResultStats,
} from '../../services/matchResult';

interface TemplateProps {
  project: Project;
}

export const MatchResultView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['match-result'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { matchResultData } = templateContent;
  const data = matchResultData || {
    competition: 'CHAMPIONS LEAGUE',
    stage: 'FINAL',
    team1: 'REAL MADRID',
    team2: 'BAYERN MUNICH',
    score1: 3,
    score2: 1,
    scorers1: ['Vinicius 21\'', 'Bellingham 54\''],
    scorers2: ['Kane 73\''],
    matchStats: [],
    mvpPlayer: 'VINICIUS JR',
    mvpStat: '1 Goal • 1 Assist',
    matchSummary: 'Decisive performance.',
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const fontBody = advancedLayout?.fontBody || "'Plus Jakarta Sans', sans-serif";
  const isWide = project.aspectRatio === '16:9';
  const headerContext = matchResultHeaderContext(data.competition, data.stage);
  const scorers1 = visibleMatchResultScorers(data.scorers1 || []);
  const scorers2 = visibleMatchResultScorers(data.scorers2 || []);
  const stats = visibleMatchResultStats(data.matchStats || []);
  const summary = String(data.matchSummary || '').trim();
  const mvpPlayer = String(data.mvpPlayer || '').trim();
  const mvpStat = String(data.mvpStat || '').trim();
  const hasMvp = Boolean(mvpPlayer || mvpStat);

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          {headerContext && (
            <span
              className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border"
              style={{
                backgroundColor: `${theme.primaryAccent}20`,
                borderColor: `${theme.primaryAccent}50`,
                color: theme.primaryAccent,
              }}
            >
              {headerContext}
            </span>
          )}
          <span className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">
            FULL TIME
          </span>
        </div>

        <h1
          className="font-black uppercase tracking-tight text-white leading-none drop-shadow-lg max-w-[1500px]"
          style={{
            fontFamily: fontDisplay,
            fontSize: matchResultScoreFontSize(data.team1, data.team2, isWide),
          }}
        >
          {data.team1}{' '}
          <span style={{ color: theme.primaryAccent }}>{data.score1}–{data.score2}</span>{' '}
          {data.team2}
        </h1>

        {(scorers1.length > 0 || scorers2.length > 0) && (
          <div className={`grid grid-cols-2 ${isWide ? 'gap-5 mt-2 text-[13px]' : 'gap-8 mt-3 text-[16px]'} max-w-[1300px] text-neutral-300 font-semibold`}>
            <div className="min-w-0">
              {scorers1.length > 0 && (
                <div className="flex items-start gap-2">
                  <IconBallFootball size={isWide ? 15 : 18} style={{ color: theme.primaryAccent }} className="flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{scorers1.join(', ')}</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              {scorers2.length > 0 && (
                <div className="flex items-start justify-end gap-2 text-right">
                  <IconBallFootball size={isWide ? 15 : 18} style={{ color: theme.secondaryAccent }} className="flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{scorers2.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-5 my-4' : 'gap-8 my-6'} items-center`}>
        <div className={`col-span-8 flex flex-col ${isWide ? 'gap-4' : 'gap-5'} max-w-[1300px]`}>
          {summary && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: `${theme.primaryAccent}30`,
              }}
            >
              <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">
                FULL TIME SUMMARY
              </div>
              <p
                className={`${isWide ? 'text-[17px]' : 'text-[21px]'} text-white font-medium leading-relaxed`}
                style={{ fontFamily: fontBody }}
              >
                {summary}
              </p>
            </div>
          )}

          {stats.length > 0 && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md grid ${stats.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4 shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {stats.map((st, i) => (
                <div
                  key={`${st.label}-${i}`}
                  className={`${isWide ? 'p-3' : 'p-3.5'} rounded-xl bg-black/40 border flex items-center justify-between gap-3`}
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <span
                    className={`${isWide ? 'text-[18px]' : 'text-[20px]'} font-black tabular-nums`}
                    style={{ color: theme.primaryAccent }}
                  >
                    {st.val1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 text-center flex-1">
                    {st.label}
                  </span>
                  <span
                    className={`${isWide ? 'text-[18px]' : 'text-[20px]'} font-black tabular-nums`}
                    style={{ color: theme.secondaryAccent }}
                  >
                    {st.val2}
                  </span>
                </div>
              ))}
            </div>
          )}

          {hasMvp && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-5'} border backdrop-blur-md flex items-center justify-between gap-6 shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.9)',
                borderColor: `${theme.primaryAccent}40`,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`${isWide ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl flex items-center justify-center border flex-shrink-0`}
                  style={{
                    backgroundColor: `${theme.primaryAccent}15`,
                    borderColor: `${theme.primaryAccent}35`,
                    color: theme.primaryAccent,
                  }}
                >
                  <IconStar size={isWide ? 21 : 24} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
                    PLAYER OF THE MATCH
                  </div>
                  {mvpPlayer && (
                    <div
                      className="font-black uppercase tracking-tight text-white leading-none"
                      style={{
                        fontFamily: fontDisplay,
                        fontSize: matchResultMvpNameFontSize(mvpPlayer, isWide),
                      }}
                    >
                      {mvpPlayer}
                    </div>
                  )}
                </div>
              </div>

              {mvpStat && (
                <div className={`${isWide ? 'text-[15px]' : 'text-[17px]'} text-right font-bold text-neutral-300 max-w-[40%]`}>
                  {mvpStat}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
