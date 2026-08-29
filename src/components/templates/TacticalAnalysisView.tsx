import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconBolt, IconChess } from '@tabler/icons-react';
import {
  tacticalDeepDiveLabel,
  tacticalTopicFontSize,
  visibleExecutionTriggers,
  visibleTacticalPrinciples,
} from '../../services/tacticalAnalysis';

interface TemplateProps {
  project: Project;
}

export const TacticalAnalysisView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['tactical-analysis'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { tacticalData } = templateContent;
  const data = tacticalData || {
    topic: 'TACTICAL TOPIC',
    teamOrCoach: 'TEAM • COACH',
    formation: '4-3-3 IN POSSESSION',
    phase: 'In Possession' as const,
    corePrinciples: [{ title: 'Principle 1', description: 'Description 1' }],
    tacticalNote: 'Tactical note description.',
    keyInstructions: ['Instruction 1', 'Instruction 2'],
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9';
  const principles = visibleTacticalPrinciples(data.corePrinciples);
  const triggers = visibleExecutionTriggers(data.keyInstructions);
  const hasConcept = Boolean(data.tacticalNote?.trim());
  const topic = data.topic?.trim() || 'TACTICAL ANALYSIS';
  const teamOrCoach = data.teamOrCoach?.trim();
  const formation = data.formation?.trim();

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
            {tacticalDeepDiveLabel(data.phase)}
          </span>
          {formation && (
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {formation}
            </span>
          )}
        </div>

        <h1
          className="font-black uppercase tracking-tight text-white leading-[0.9] drop-shadow-md"
          style={{
            fontFamily: fontDisplay,
            fontSize: tacticalTopicFontSize(topic, isWide),
          }}
        >
          {topic}
        </h1>

        {teamOrCoach && (
          <div
            className={`${isWide ? 'text-[26px]' : 'text-[32px]'} font-bold uppercase tracking-wider mt-1`}
            style={{
              fontFamily: fontDisplay,
              color: theme.primaryAccent,
            }}
          >
            {teamOrCoach}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-5 my-4' : 'gap-8 my-6'} items-center`}>
        <div className={`col-span-8 flex flex-col ${isWide ? 'gap-4' : 'gap-5'} max-w-[1300px]`}>
          {/* Core concept is optional: no empty placeholder card. */}
          {hasConcept && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: `${theme.primaryAccent}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <IconChess size={isWide ? 18 : 20} style={{ color: theme.primaryAccent }} />
                <span
                  className="text-xs font-black tracking-widest uppercase"
                  style={{ color: theme.primaryAccent }}
                >
                  CORE TACTICAL CONCEPT
                </span>
              </div>
              <p className={`${isWide ? 'text-[18px]' : 'text-[21px]'} text-white font-medium leading-relaxed`}>
                {data.tacticalNote.trim()}
              </p>
            </div>
          )}

          {/* Maximum three principles keeps the tactical story readable. */}
          {principles.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-black tracking-widest uppercase text-neutral-400">
                CORE PRINCIPLES
              </div>
              {principles.map((principle, idx) => (
                <div
                  key={`${principle.title}-${idx}`}
                  className={`rounded-2xl ${isWide ? 'p-4' : 'p-5'} border backdrop-blur-md shadow-xl`}
                  style={{
                    backgroundColor: 'rgba(10, 14, 26, 0.85)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center text-black flex-shrink-0"
                      style={{ backgroundColor: theme.primaryAccent }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={`${isWide ? 'text-[18px]' : 'text-[20px]'} font-bold uppercase tracking-wider text-white`}
                      style={{ fontFamily: fontDisplay }}
                    >
                      {principle.title || `PRINCIPLE ${idx + 1}`}
                    </span>
                  </div>
                  {principle.description && (
                    <p className={`${isWide ? 'text-[15px]' : 'text-[17px]'} text-neutral-300 leading-normal pl-9`}>
                      {principle.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Maximum three execution triggers; genuine Tabler icon instead of emoji. */}
          {triggers.length > 0 && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-5'} border backdrop-blur-md shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-2">
                EXECUTION TRIGGERS
              </div>
              <div className={`grid ${triggers.length === 1 ? 'grid-cols-1' : triggers.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
                {triggers.map((instruction, idx) => (
                  <div
                    key={`${instruction}-${idx}`}
                    className={`p-3 rounded-xl bg-black/40 border ${isWide ? 'text-[14px]' : 'text-[15px]'} font-semibold text-neutral-200 flex items-start gap-2`}
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <IconBolt size={16} className="flex-shrink-0 mt-0.5" style={{ color: theme.primaryAccent }} />
                    <span>{instruction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side intentionally stays open for coach/player imagery. */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
