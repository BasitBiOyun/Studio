import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconChess, IconLayersLinked, IconCrosshair } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const TacticalAnalysisView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { tacticalData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = tacticalData || {
    topic: 'TACTICAL TOPIC',
    teamOrCoach: 'TEAM • COACH',
    formation: '4-3-3 IN POSSESSION',
    phase: 'In Possession',
    corePrinciples: [{ title: 'Principle 1', description: 'Description 1' }],
    tacticalNote: 'Tactical note description.',
    keyInstructions: ['Instruction 1', 'Instruction 2'],
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
            Tactical Deep Dive • {data.phase}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {data.formation}
          </span>
        </div>

        <h1
          className="text-[96px] font-black uppercase tracking-tight text-white leading-[0.9] drop-shadow-md"
          style={{ fontFamily: fontDisplay }}
        >
          {data.topic}
        </h1>

        <div
          className="text-[32px] font-bold uppercase tracking-wider mt-1"
          style={{
            fontFamily: fontDisplay,
            color: theme.primaryAccent,
          }}
        >
          {data.teamOrCoach}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 my-6 items-center">
        {/* Left Column: Tactical Mechanics */}
        <div className="col-span-8 flex flex-col gap-5 max-w-[1300px]">
          {/* Tactical Note Callout */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: `${theme.primaryAccent}30`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <IconChess size={20} style={{ color: theme.primaryAccent }} />
              <span
                className="text-xs font-black tracking-widest uppercase"
                style={{ color: theme.primaryAccent }}
              >
                Core Tactical Concept
              </span>
            </div>
            <p className="text-[21px] text-white font-medium leading-relaxed">
              {data.tacticalNote}
            </p>
          </div>

          {/* 3 Core Tactical Principles */}
          <div className="flex flex-col gap-3">
            {data.corePrinciples.map((p, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-5 border backdrop-blur-md shadow-xl"
                style={{
                  backgroundColor: 'rgba(10, 14, 26, 0.85)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center text-black"
                    style={{ backgroundColor: theme.primaryAccent }}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    className="text-[20px] font-bold uppercase tracking-wider text-white"
                    style={{ fontFamily: fontDisplay }}
                  >
                    {p.title}
                  </span>
                </div>
                <p className="text-[17px] text-neutral-300 leading-normal pl-9">
                  {p.description}
                </p>
              </div>
            ))}
          </div>

          {/* Key Execution Instructions */}
          <div
            className="rounded-2xl p-5 border backdrop-blur-md shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-2">
              Tactical Trigger Rules
            </div>
            <div className="grid grid-cols-3 gap-3">
              {data.keyInstructions.map((ins, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-black/40 border text-[15px] font-semibold text-neutral-200"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  ⚡ {ins}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side is intentionally open for Coach/Player Photo */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
