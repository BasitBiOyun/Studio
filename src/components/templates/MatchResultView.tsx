import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconTrophy, IconStar } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const MatchResultView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { matchResultData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
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

  return (
    <div className="relative z-20 w-full h-full flex flex-col justify-between p-14 md:p-16 select-none">
      {/* Header */}
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
            {data.competition} • {data.stage}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            FULL TIME RESULT
          </span>
        </div>

        {/* Big Match Score */}
        <h1
          className="text-[100px] font-black uppercase tracking-tight text-white leading-none drop-shadow-lg"
          style={{ fontFamily: fontDisplay }}
        >
          {data.team1}{' '}
          <span style={{ color: theme.primaryAccent }}>{data.score1} - {data.score2}</span>{' '}
          {data.team2}
        </h1>

        {/* Goalscorers */}
        <div className="flex items-center justify-between max-w-[1300px] mt-2 text-[16px] text-neutral-300 font-semibold">
          <div>⚽ {data.scorers1.join(', ')}</div>
          <div>⚽ {data.scorers2.join(', ')}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 my-6 items-center">
        {/* Left Column: Stats & Summary */}
        <div className="col-span-8 flex flex-col gap-5 max-w-[1300px]">
          {/* Match Summary */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: `${theme.primaryAccent}30`,
            }}
          >
            <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">
              Full Time Match Debrief
            </div>
            <p className="text-[21px] text-white font-medium leading-relaxed">
              {data.matchSummary}
            </p>
          </div>

          {/* Key Match Stats Grid */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md grid grid-cols-2 gap-4 shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            {data.matchStats.map((st, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-black/40 border flex items-center justify-between"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <span className="text-[20px] font-black text-white">{st.val1}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {st.label}
                </span>
                <span className="text-[20px] font-black text-white">{st.val2}</span>
              </div>
            ))}
          </div>

          {/* Player of the Match Card */}
          <div
            className="rounded-2xl p-5 border backdrop-blur-md flex items-center justify-between shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.9)',
              borderColor: `${theme.primaryAccent}40`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border text-amber-300"
                style={{
                  backgroundColor: `${theme.primaryAccent}15`,
                  borderColor: `${theme.primaryAccent}35`,
                }}
              >
                <IconStar size={24} />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
                  Player of the Match
                </div>
                <div
                  className="text-[32px] font-black uppercase tracking-tight text-white leading-none"
                  style={{ fontFamily: fontDisplay }}
                >
                  {data.mvpPlayer}
                </div>
              </div>
            </div>

            <div className="text-right text-[17px] font-bold text-neutral-300">
              {data.mvpStat}
            </div>
          </div>
        </div>

        {/* Right side for Player Cutout */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
