import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { EditorialStatCard } from '../design/EditorialStatCard';
import { IconAlertTriangle, IconShieldCheck, IconUser } from '@tabler/icons-react';
import {
  teamProfileHeaderContext,
  teamProfileStyleFontSize,
  teamProfileTitleFontSize,
  visibleTeamProfileMetrics,
  visibleTeamProfilePoints,
} from '../../services/teamProfile';

interface TemplateProps {
  project: Project;
}

export const TeamProfileView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['team-profile'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { teamProfileData } = templateContent;
  const data = teamProfileData || {
    teamName: 'TEAM NAME',
    manager: 'MANAGER NAME',
    league: 'LEAGUE NAME',
    leagueRank: '1ST PLACE',
    tacticalStyleTag: 'High-Intensity Positional Play',
    metrics: templateContent.stats || [],
    strengths: ['Strength 1', 'Strength 2'],
    weaknesses: ['Weakness 1'],
    tacticalSummary: 'Team tactical summary description.',
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9';
  const teamName = String(data.teamName || '').trim();
  const manager = String(data.manager || '').trim();
  const tacticalStyle = String(data.tacticalStyleTag || '').trim();
  const tacticalSummary = String(data.tacticalSummary || '').trim();
  const headerContext = teamProfileHeaderContext(data.league, data.leagueRank);
  const metrics = visibleTeamProfileMetrics(data.metrics || []);
  const strengths = visibleTeamProfilePoints(data.strengths || []);
  const weaknesses = visibleTeamProfilePoints(data.weaknesses || []);
  const hasProfilePoints = strengths.length > 0 || weaknesses.length > 0;

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      <div>
        {(headerContext || manager) && (
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
            {manager && (
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 inline-flex items-center gap-1.5">
                <IconUser size={14} />
                {manager}
              </span>
            )}
          </div>
        )}

        {teamName && (
          <h1
            className="font-black uppercase tracking-tight text-white leading-none drop-shadow-md"
            style={{
              fontFamily: fontDisplay,
              fontSize: teamProfileTitleFontSize(teamName, isWide),
            }}
          >
            {teamName}
          </h1>
        )}

        {tacticalStyle && (
          <div
            className="font-bold uppercase tracking-wider mt-1"
            style={{
              fontFamily: fontDisplay,
              color: theme.primaryAccent,
              fontSize: teamProfileStyleFontSize(tacticalStyle, isWide),
            }}
          >
            {tacticalStyle}
          </div>
        )}
      </div>

      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-5 my-4' : 'gap-8 my-6'} items-center`}>
        <div className={`col-span-8 flex flex-col ${isWide ? 'gap-4' : 'gap-5'} max-w-[1300px]`}>
          {tacticalSummary && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: `${theme.primaryAccent}30`,
              }}
            >
              <div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">
                TACTICAL PROFILE
              </div>
              <p className={`${isWide ? 'text-[17px]' : 'text-[21px]'} text-white font-medium leading-relaxed`}>
                {tacticalSummary}
              </p>
            </div>
          )}

          {metrics.length > 0 && (
            <div className={`grid ${metrics.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              {metrics.map((stat) => (
                <EditorialStatCard
                  key={stat.id}
                  stat={stat}
                  theme={theme}
                  fontDisplay={fontDisplay}
                />
              ))}
            </div>
          )}

          {hasProfilePoints && (
            <div
              className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md grid ${strengths.length > 0 && weaknesses.length > 0 ? 'grid-cols-2' : 'grid-cols-1'} ${isWide ? 'gap-4' : 'gap-6'} shadow-xl`}
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {strengths.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <IconShieldCheck size={18} style={{ color: theme.primaryAccent }} />
                    <span className="text-xs font-black tracking-widest uppercase" style={{ color: theme.primaryAccent }}>
                      KEY STRENGTHS
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {strengths.map((strength, idx) => (
                      <li key={`${idx}-${strength}`} className={`flex items-start gap-2 ${isWide ? 'text-[15px]' : 'text-[17px]'} text-neutral-200 font-semibold`}>
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: theme.primaryAccent }}
                        />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {weaknesses.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <IconAlertTriangle size={18} style={{ color: theme.secondaryAccent }} />
                    <span className="text-xs font-black tracking-widest uppercase" style={{ color: theme.secondaryAccent }}>
                      VULNERABILITIES
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {weaknesses.map((weakness, idx) => (
                      <li key={`${idx}-${weakness}`} className={`flex items-start gap-2 ${isWide ? 'text-[15px]' : 'text-[17px]'} text-neutral-300 font-semibold`}>
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: theme.secondaryAccent }}
                        />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
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
