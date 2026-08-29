import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconStar, IconAnalyze } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const MatchAnalysisView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { matchAnalysisData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = matchAnalysisData || {
    competition: 'PREMIER LEAGUE',
    scoreline: { team1: 'ARSENAL', score1: 2, team2: 'MAN CITY', score2: 1 },
    scorersTeam1: ['Saka 34\'', 'Havertz 78\''],
    scorersTeam2: ['Haaland 51\''],
    stats: [
      { label: 'Expected Goals (xG)', val1: '2.14', val2: '1.08', val1Num: 2.14, val2Num: 1.08 },
      { label: 'Possession %', val1: '48%', val2: '52%', val1Num: 48, val2Num: 52 },
    ],
    tacticalSummary: 'Tactical breakdown summary of the clash.',
    keyTakeaways: ['Key takeaway 1', 'Key takeaway 2'],
    performerTitle: 'MAN OF THE MATCH',
    performerName: 'PLAYER NAME',
    performerNote: 'Match impact details',
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
            {data.competition} • Post-Match Tactical Debrief
          </span>
        </div>

        {/* Big Score Banner */}
        <div className="flex items-center gap-8">
          <h1
            className="text-[96px] font-black uppercase tracking-tight text-white leading-none"
            style={{ fontFamily: fontDisplay }}
          >
            {data.scoreline.team1}{' '}
            <span style={{ color: theme.primaryAccent }}>{data.scoreline.score1} - {data.scoreline.score2}</span>{' '}
            {data.scoreline.team2}
          </h1>
        </div>

        {/* Goal Scorers Row */}
        <div className="flex items-center justify-between max-w-[1300px] mt-2 text-[16px] text-neutral-300 font-semibold">
          <div>⚽ {data.scorersTeam1.join(', ')}</div>
          <div>⚽ {data.scorersTeam2.join(', ')}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 my-6 items-center">
        {/* Left Column: Stats & Tactical Notes */}
        <div className="col-span-8 flex flex-col gap-5 max-w-[1300px]">
          {/* Match Tactical Summary */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: `${theme.primaryAccent}30`,
            }}
          >
            <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">
              Match Overview & Game State Dynamics
            </div>
            <p className="text-[21px] text-white font-medium leading-relaxed">
              {data.tacticalSummary}
            </p>
          </div>

          {/* Match Stat Comparison Bars */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md flex flex-col gap-4 shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            {data.stats.map((st, i) => {
              const v1 = parseFloat(st.val1) || 50;
              const v2 = parseFloat(st.val2) || 50;
              const total = v1 + v2 || 100;
              const pct1 = Math.round((v1 / total) * 100);

              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[16px] font-bold">
                    <span className="text-white">{st.val1}</span>
                    <span className="text-neutral-400 uppercase tracking-wider text-xs font-black">
                      {st.label}
                    </span>
                    <span className="text-white">{st.val2}</span>
                  </div>

                  <div className="h-3 rounded-full bg-neutral-800 overflow-hidden flex">
                    <div
                      className="h-full rounded-l-full transition-all"
                      style={{
                        width: `${pct1}%`,
                        backgroundColor: theme.primaryAccent,
                      }}
                    />
                    <div
                      className="h-full rounded-r-full bg-neutral-600 transition-all"
                      style={{ width: `${100 - pct1}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Tactical Takeaways */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-2.5">
              Key Analytical Takeaways
            </div>
            <div className="flex flex-col gap-2">
              {data.keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[17px] text-neutral-200 font-semibold">
                  <span
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: theme.primaryAccent }}
                  />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Man of the Match Spotlight */}
          <div
            className="rounded-2xl p-4 border backdrop-blur-md flex items-center justify-between shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.9)',
              borderColor: `${theme.primaryAccent}40`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border text-amber-300"
                style={{
                  backgroundColor: `${theme.primaryAccent}15`,
                  borderColor: `${theme.primaryAccent}35`,
                }}
              >
                <IconStar size={22} />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
                  {data.performerTitle}
                </div>
                <div
                  className="text-[26px] font-black uppercase tracking-tight text-white leading-none"
                  style={{ fontFamily: fontDisplay }}
                >
                  {data.performerName}
                </div>
              </div>
            </div>

            <div className="text-right text-[15px] font-bold text-neutral-300">
              {data.performerNote}
            </div>
          </div>
        </div>

        {/* Right side is intentionally open for Player Photo */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
