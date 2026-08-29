import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconVs, IconScale } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const PlayerComparisonView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { comparisonData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = comparisonData || {
    player1: project.sharedData?.player,
    player2: {
      name: 'OPPONENT PLAYER',
      age: '21',
      nationality: 'France 🇫🇷',
      preferredFoot: 'Left',
      height: '180 cm',
      positions: 'Winger',
      club: 'PSG',
    },
    subtitle: 'U21 WINGERS • HEAD-TO-HEAD METRIC COMPARISON',
    metrics: [],
    verdictTitle: 'ANALYTICAL VERDICT',
    verdictText: 'Detailed performance breakdown.',
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9';

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      {/* Header */}
      <EditorialHeader
        categoryBadge="Head-to-Head • Analytical Comparison"
        title={`${project.sharedData?.player?.name} VS ${data.player2.name}`}
        subtitle={data.subtitle}
        theme={theme}
        fontDisplay={fontDisplay}
      />

      {/* Main Comparison Area: 3-Column Split (Player 1 Info, Center Metric Bars, Player 2 Info) */}
      <div className={`flex-1 ${isWide ? 'my-3 gap-3' : 'my-6 gap-6'} flex flex-col justify-center max-w-[2000px] mx-auto w-full`}>
        {/* Top Player Badges Row */}
        <div className={`grid grid-cols-12 ${isWide ? 'gap-4' : 'gap-8'} items-center`}>
          {/* Player 1 Card */}
          <div
            className={`col-span-5 rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl flex items-center justify-between`}
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: `${theme.primaryAccent}40`,
            }}
          >
            <div>
              <div className="text-[12px] font-black uppercase tracking-widest text-neutral-400">
                {project.sharedData?.player?.positions} • {project.sharedData?.player?.age} Y/O
              </div>
              <div
                className="text-[44px] font-black uppercase tracking-tight text-white leading-tight"
                style={{ fontFamily: fontDisplay }}
              >
                {project.sharedData?.player?.name}
              </div>
              <div
                className="text-[18px] font-bold uppercase tracking-wider"
                style={{ color: theme.primaryAccent }}
              >
                {project.sharedData?.player?.club}
              </div>
            </div>
          </div>

          {/* VS Center Indicator */}
          <div className="col-span-2 flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border font-black text-2xl shadow-2xl backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.95)',
                borderColor: `${theme.primaryAccent}50`,
                color: theme.primaryAccent,
              }}
            >
              <IconVs size={32} />
            </div>
          </div>

          {/* Player 2 Card */}
          <div
            className="col-span-5 rounded-2xl p-6 border backdrop-blur-md shadow-xl flex items-center justify-between text-right"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: `${theme.secondaryAccent || '#64748b'}40`,
            }}
          >
            <div className="w-full">
              <div className="text-[12px] font-black uppercase tracking-widest text-neutral-400">
                {data.player2.positions} • {data.player2.age} Y/O
              </div>
              <div
                className="text-[44px] font-black uppercase tracking-tight text-white leading-tight"
                style={{ fontFamily: fontDisplay }}
              >
                {data.player2.name}
              </div>
              <div
                className="text-[18px] font-bold uppercase tracking-wider text-neutral-300"
              >
                {data.player2.club}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Rows */}
        <div
          className={`rounded-2xl ${isWide ? 'p-4 gap-2' : 'p-6 gap-4'} border backdrop-blur-md flex flex-col shadow-2xl`}
          style={{
            backgroundColor: 'rgba(10, 14, 26, 0.9)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          {data.metrics.map((m) => {
            const val1Num = parseFloat(m.val1) || 0;
            const val2Num = parseFloat(m.val2) || 0;
            const p1Wins = val1Num >= val2Num;
            const p2Wins = val2Num > val1Num;

            return (
              <div
                key={m.id}
                className={`grid grid-cols-12 ${isWide ? 'gap-2 py-1.5' : 'gap-4 py-2.5'} items-center border-b border-neutral-800/60 last:border-0`}
              >
                {/* Val 1 */}
                <div className="col-span-3 text-left">
                  <span
                    className={`text-[32px] font-black tracking-tight tabular-nums px-3 py-1 rounded-lg ${
                      p1Wins
                        ? 'text-white'
                        : 'text-neutral-400'
                    }`}
                    style={{
                      fontFamily: fontDisplay,
                      backgroundColor: p1Wins ? `${theme.primaryAccent}20` : 'transparent',
                      color: p1Wins ? theme.primaryAccent : '#94a3b8',
                    }}
                  >
                    {m.val1}
                  </span>
                </div>

                {/* Metric Center Label */}
                <div className="col-span-6 text-center">
                  <div className="text-[20px] font-bold tracking-wide text-neutral-200">
                    {m.label}
                  </div>
                </div>

                {/* Val 2 */}
                <div className="col-span-3 text-right">
                  <span
                    className={`text-[32px] font-black tracking-tight tabular-nums px-3 py-1 rounded-lg ${
                      p2Wins
                        ? 'text-white'
                        : 'text-neutral-400'
                    }`}
                    style={{
                      fontFamily: fontDisplay,
                      backgroundColor: p2Wins ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: p2Wins ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    {m.val2}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Verdict Banner */}
        {data.verdictText && (
          <div
            className="rounded-2xl p-5 border backdrop-blur-md flex items-start gap-4 shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: `${theme.primaryAccent}30`,
            }}
          >
            <div
              className="p-2 rounded-xl border flex-shrink-0"
              style={{
                backgroundColor: `${theme.primaryAccent}15`,
                borderColor: `${theme.primaryAccent}35`,
                color: theme.primaryAccent,
              }}
            >
              <IconScale size={24} />
            </div>
            <div>
              <div
                className="text-xs font-black tracking-widest uppercase mb-1"
                style={{ color: theme.primaryAccent }}
              >
                {data.verdictTitle || 'Analytical Verdict'}
              </div>
              <p className="text-[19px] text-white font-medium leading-relaxed">
                {data.verdictText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
