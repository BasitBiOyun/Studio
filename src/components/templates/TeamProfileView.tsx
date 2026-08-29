import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { EditorialStatCard } from '../design/EditorialStatCard';
import { IconShieldCheck, IconAlertTriangle } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const TeamProfileView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { teamProfileData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = teamProfileData || {
    teamName: 'TEAM NAME',
    manager: 'MANAGER NAME',
    league: 'LEAGUE NAME',
    leagueRank: '1ST PLACE',
    tacticalStyleTag: 'High-Intensity Positional Play',
    metrics: project.stats,
    strengths: ['Strength 1', 'Strength 2'],
    weaknesses: ['Weakness 1'],
    tacticalSummary: 'Team tactical summary description.',
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
            {data.league} • {data.leagueRank}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Manager: {data.manager}
          </span>
        </div>

        <h1
          className="text-[100px] font-black uppercase tracking-tight text-white leading-none drop-shadow-md"
          style={{ fontFamily: fontDisplay }}
        >
          {data.teamName}
        </h1>

        <div
          className="text-[32px] font-bold uppercase tracking-wider mt-1"
          style={{
            fontFamily: fontDisplay,
            color: theme.primaryAccent,
          }}
        >
          Style: {data.tacticalStyleTag}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 my-6 items-center">
        {/* Left Column: Team Data & Metrics */}
        <div className="col-span-8 flex flex-col gap-5 max-w-[1300px]">
          {/* Tactical Summary */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: `${theme.primaryAccent}30`,
            }}
          >
            <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">
              Tactical DNA & Performance Analysis
            </div>
            <p className="text-[21px] text-white font-medium leading-relaxed">
              {data.tacticalSummary}
            </p>
          </div>

          {/* 4 Team Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {data.metrics.slice(0, 4).map((st) => (
              <EditorialStatCard
                key={st.id}
                stat={st}
                theme={theme}
                fontDisplay={fontDisplay}
              />
            ))}
          </div>

          {/* Strengths & Vulnerabilities */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md grid grid-cols-2 gap-6 shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Strengths */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <IconShieldCheck size={18} className="text-emerald-400" />
                <span className="text-xs font-black tracking-widest uppercase text-emerald-400">
                  Key Tactical Strengths
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {data.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[17px] text-neutral-200 font-semibold">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: theme.primaryAccent }}
                    />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <IconAlertTriangle size={18} className="text-amber-400" />
                <span className="text-xs font-black tracking-widest uppercase text-amber-400">
                  Tactical Vulnerabilities
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {data.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-[17px] text-neutral-300 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 mt-2 flex-shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right side for Club / Manager / Team Visual */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
