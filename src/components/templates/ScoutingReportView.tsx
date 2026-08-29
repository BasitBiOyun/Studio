import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { EditorialStatCard } from '../design/EditorialStatCard';
import { IconBolt, IconAward, IconCrosshair, IconCompass } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const ScoutingReportView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { profile, stats, strengths, development } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const isWide = project.aspectRatio === '16:9';
  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";

  const metaBadges = [
    { label: 'Nat', value: player.countryFlag ? <span className="flex items-center gap-1.5"><span className={`fi fi-${player.countryFlag.toLowerCase()} text-[1.1em] drop-shadow-sm`}></span>{player.nationality}</span> : player.nationality },
    { label: 'Pos', value: player.positions },
    { label: 'Age', value: player.age },
    { label: 'Foot', value: player.preferredFoot },
    { label: 'Height', value: player.height },
  ];

  // Make text columns wider to give breathing room
  const leftColSpan = 'col-span-8';
  const rightColSpan = 'col-span-4';

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-6' : 'p-10 md:p-12'} select-none`}>
      {/* Top Header */}
      <EditorialHeader
        title={player?.name || ""}
        subtitle={player.positions}
        metaBadges={metaBadges}
        theme={theme}
        fontDisplay={fontDisplay}
        visualMode={visualMode}
      />

      {/* Main Center Area: Left Data Panels + Right Open Space for Player Photo */}
      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-3 my-2' : 'gap-6 my-4'} items-center`}>
        {/* Left Column: Stats & Analytical Insights */}
        <div className={`${leftColSpan} flex flex-col ${isWide ? 'gap-3' : 'gap-4'}`}>
          
          {/* Tactical Profile Notes */}
          {advancedLayout.visibleBlocks.tacticalProfile !== false && profile.tacticalProfile && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-5'} border backdrop-blur-md shadow-xl`}
              style={{
                backgroundColor: 'rgba(8, 12, 22, 0.85)',
                borderColor: `${theme.primaryAccent}25`,
              }}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <IconCompass size={isWide ? 15 : 18} style={{ color: theme.primaryAccent }} />
                <span className={`${isWide ? 'text-[11px]' : 'text-[13px]'} font-black tracking-widest uppercase text-neutral-300`}>
                  Tactical Profile & Role Dynamics
                </span>
              </div>
              <p className={`${isWide ? 'text-[12px]' : 'text-[14px]'} text-neutral-200 leading-relaxed`}>
                {profile.tacticalProfile}
              </p>
            </div>
          )}

          {/* 4 Performance Metrics Grid */}
          {advancedLayout.visibleBlocks.stats !== false && (
            <div className="grid grid-cols-2 gap-3">
              {stats.slice(0, 4).map((st) => (
                <EditorialStatCard
                  key={st.id}
                  stat={st}
                  theme={theme}
                  fontDisplay={fontDisplay}
                />
              ))}
            </div>
          )}

          {/* Strengths & Development Split Card */}
          {(advancedLayout.visibleBlocks.strengths !== false ||
            advancedLayout.visibleBlocks.development !== false) && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-5'} border backdrop-blur-md grid grid-cols-2 ${isWide ? 'gap-4' : 'gap-6'} shadow-2xl`}
              style={{
                backgroundColor: 'rgba(8, 12, 22, 0.90)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              }}
            >
              {/* Strengths */}
              {advancedLayout.visibleBlocks.strengths !== false && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3 pb-1 border-b border-emerald-500/20">
                    <IconAward size={isWide ? 15 : 18} className="text-emerald-400" />
                    <span className={`${isWide ? 'text-[11px]' : 'text-[13px]'} font-black tracking-widest uppercase text-emerald-400`}>
                      Key Strengths
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {strengths.map((s, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${isWide ? 'text-[12px]' : 'text-[14px]'} text-neutral-100 font-semibold leading-relaxed`}>
                        <span
                          className="w-1.5 h-1.5 rounded-sm mt-1.5 flex-shrink-0 rotate-45 shadow-sm"
                          style={{ backgroundColor: theme.primaryAccent }}
                        />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Development Areas */}
              {advancedLayout.visibleBlocks.development !== false && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3 pb-1 border-b border-amber-500/20">
                    <IconCrosshair size={isWide ? 15 : 18} className="text-amber-400" />
                    <span className={`${isWide ? 'text-[11px]' : 'text-[13px]'} font-black tracking-widest uppercase text-amber-400`}>
                      Development Areas
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {development.map((d, idx) => (
                      <li key={idx} className={`flex items-start gap-2 ${isWide ? 'text-[12px]' : 'text-[14px]'} text-neutral-200 font-semibold leading-relaxed`}>
                        <span className="w-1.5 h-1.5 rounded-sm bg-amber-400 mt-1.5 flex-shrink-0 rotate-45 shadow-sm" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Summary Callout Card with Left Accent Blade */}
          {advancedLayout.visibleBlocks.summary !== false && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-5'} border backdrop-blur-md relative overflow-hidden shadow-2xl`}
              style={{
                backgroundColor: 'rgba(8, 12, 22, 0.92)',
                borderColor: `${theme.primaryAccent}40`,
                boxShadow: `0 20px 40px -10px rgba(0,0,0,0.85), inset 4px 0 0 0 ${theme.primaryAccent}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="p-1 rounded-md border"
                  style={{
                    backgroundColor: `${theme.primaryAccent}18`,
                    borderColor: `${theme.primaryAccent}45`,
                    color: theme.primaryAccent,
                  }}
                >
                  <IconBolt size={isWide ? 15 : 18} />
                </div>
                <span
                  className={`${isWide ? 'text-[11px]' : 'text-[13px]'} font-black tracking-widest uppercase`}
                  style={{ color: theme.primaryAccent }}
                >
                  Executive Summary
                </span>
              </div>
              <p className={`${isWide ? 'text-[14px]' : 'text-[16px]'} text-white font-medium leading-relaxed drop-shadow-sm`}>
                {profile.summary}
              </p>
            </div>
          )}
        </div>

        {/* Right side is intentionally open for the Player Cutout Photo */}
        <div className={`${rightColSpan} h-full pointer-events-none`} />
      </div>

      {/* Footer */}
      {advancedLayout.visibleBlocks.footer !== false && (
        <EditorialFooter credits={credits} theme={theme} visualMode={visualMode} />
      )}
    </div>
  );
};
