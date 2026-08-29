import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconCalendarEvent, IconMapPin, IconSwords, IconShieldCheck } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const MatchPreviewView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { matchPreviewData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = matchPreviewData || {
    competition: 'UEFA CHAMPIONS LEAGUE',
    matchDate: 'MATCHDAY PREVIEW',
    kickoffTime: '21:00 CET',
    team1: { name: 'TEAM A', form: ['W', 'W', 'D'], manager: 'Manager 1', standing: '1st' },
    team2: { name: 'TEAM B', form: ['W', 'D', 'W'], manager: 'Manager 2', standing: '2nd' },
    keyBattleTitle: 'KEY TACTICAL BATTLE',
    keyBattleDetails: 'Player vs Player Matchup',
    tacticalKeys: ['Key concept 1', 'Key concept 2'],
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9';

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
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
            {data.competition}
          </span>
        </div>

        <h1
          className="text-[100px] font-black uppercase tracking-tight text-white leading-[0.9] drop-shadow-md"
          style={{ fontFamily: fontDisplay }}
        >
          {data.team1.name} <span style={{ color: theme.primaryAccent }}>VS</span> {data.team2.name}
        </h1>

        <div className="flex items-center gap-6 mt-3 text-neutral-300">
          <div className="flex items-center gap-2 text-[18px] font-bold uppercase tracking-wider">
            <IconCalendarEvent size={20} style={{ color: theme.primaryAccent }} />
            <span>{data.matchDate}</span>
          </div>
          <div className="flex items-center gap-2 text-[18px] font-bold uppercase tracking-wider">
            <IconMapPin size={20} style={{ color: theme.primaryAccent }} />
            <span>{data.kickoffTime}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 ${isWide ? 'my-3 gap-3' : 'my-6 gap-6'} flex flex-col justify-center max-w-[1900px]`}>
        {/* Teams Form Comparison Cards */}
        <div className={`grid ${isWide ? 'grid-cols-2 gap-4' : 'grid-cols-2 gap-8'}`}>
          {/* Team 1 */}
          <div
            className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`}
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: `${theme.primaryAccent}40`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-black uppercase tracking-widest text-neutral-400">
                {data.team1.standing}
              </span>
              <div className="flex gap-1.5">
                {data.team1.form.map((f, i) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                      f === 'W' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : f === 'D' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="text-[48px] font-black uppercase tracking-tight text-white leading-tight"
              style={{ fontFamily: fontDisplay }}
            >
              {data.team1.name}
            </div>
            <div className="text-[16px] font-bold text-neutral-300 uppercase">
              Manager: {data.team1.manager}
            </div>
          </div>

          {/* Team 2 */}
          <div
            className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`}
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: `${theme.secondaryAccent || '#64748b'}40`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-black uppercase tracking-widest text-neutral-400">
                {data.team2.standing}
              </span>
              <div className="flex gap-1.5">
                {data.team2.form.map((f, i) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                      f === 'W' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : f === 'D' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="text-[48px] font-black uppercase tracking-tight text-white leading-tight"
              style={{ fontFamily: fontDisplay }}
            >
              {data.team2.name}
            </div>
            <div className="text-[16px] font-bold text-neutral-300 uppercase">
              Manager: {data.team2.manager}
            </div>
          </div>
        </div>

        {/* Key Tactical Battle Card */}
        <div
          className="rounded-2xl p-6 border backdrop-blur-md shadow-xl flex items-start gap-5"
          style={{
            backgroundColor: 'rgba(10, 14, 26, 0.9)',
            borderColor: `${theme.primaryAccent}30`,
          }}
        >
          <div
            className="p-3 rounded-2xl border text-white flex-shrink-0"
            style={{
              backgroundColor: `${theme.primaryAccent}20`,
              borderColor: `${theme.primaryAccent}50`,
              color: theme.primaryAccent,
            }}
          >
            <IconSwords size={28} />
          </div>

          <div>
            <div
              className="text-xs font-black tracking-widest uppercase mb-1"
              style={{ color: theme.primaryAccent }}
            >
              {data.keyBattleTitle}
            </div>
            <p className="text-[22px] font-bold text-white leading-snug">
              {data.keyBattleDetails}
            </p>
          </div>
        </div>

        {/* Tactical Keys Breakdown */}
        <div
          className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`}
          style={{
            backgroundColor: 'rgba(10, 14, 26, 0.85)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-3">
            3 Key Tactical Deciders
          </div>
          <div className="grid grid-cols-3 gap-4">
            {data.tacticalKeys.map((k, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border bg-black/40 flex items-start gap-3"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <span
                  className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center text-black flex-shrink-0"
                  style={{ backgroundColor: theme.primaryAccent }}
                >
                  {idx + 1}
                </span>
                <span className="text-[17px] font-semibold text-neutral-200 leading-snug">
                  {k}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
