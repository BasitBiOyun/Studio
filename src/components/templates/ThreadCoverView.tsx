import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconBook2, IconArrowNarrowRight } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const ThreadCoverView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { threadCoverData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = threadCoverData || {
    headline: 'THE TACTICAL EVOLUTION OF FOOTBALL',
    subtitle: 'Comprehensive Tactical Breakdown',
    badge: 'EDITORIAL THREAD',
    authorHandle: 'Analysis by @BasitBiOyun',
    topicBullets: ['Concept 1', 'Concept 2', 'Concept 3'],
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";

  return (
    <div className="relative z-20 w-full h-full flex flex-col justify-between p-14 md:p-16 select-none">
      {/* Top Tag */}
      <div>
        <div className="flex items-center gap-3">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border"
            style={{
              backgroundColor: `${theme.primaryAccent}20`,
              borderColor: `${theme.primaryAccent}50`,
              color: theme.primaryAccent,
            }}
          >
            🧵 {data.badge}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {data.authorHandle}
          </span>
        </div>
      </div>

      {/* Main Center Headline */}
      <div className="flex-1 my-6 flex flex-col justify-center max-w-[1600px]">
        {/* Giant Main Title */}
        <h1
          className="text-[120px] font-black uppercase tracking-tight text-white leading-[0.88] drop-shadow-xl"
          style={{ fontFamily: fontDisplay }}
        >
          {data.headline}
        </h1>

        {/* Subtitle */}
        <p
          className="text-[34px] font-semibold text-neutral-300 leading-snug mt-4 max-w-[1200px]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {data.subtitle}
        </p>

        {/* Breakdown Chapters / Topics Preview */}
        <div className="mt-8 flex flex-col gap-3 max-w-[1000px]">
          {data.topicBullets.map((bullet, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border backdrop-blur-md flex items-center gap-4 shadow-md"
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: `${theme.primaryAccent}25`,
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-black"
                style={{ backgroundColor: theme.primaryAccent }}
              >
                0{idx + 1}
              </div>
              <span className="text-[19px] font-bold text-white tracking-wide">
                {bullet}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
