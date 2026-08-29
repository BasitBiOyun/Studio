import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconQuote } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const QuoteOpinionView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { quoteData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = quoteData || {
    quote: 'In football, simplicity is the most difficult thing.',
    authorName: 'AUTHOR NAME',
    authorRole: 'Head Coach',
    topicTag: 'OPINION & INSIGHT',
    sourceDate: 'Press Conference',
    keyPunchline: 'Key takeaway highlight',
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
            {data.topicTag}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            {data.sourceDate}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 my-6 items-center">
        {/* Left Column: Big Quotation */}
        <div className="col-span-8 flex flex-col gap-6 max-w-[1300px]">
          {/* Quote Icon */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center border shadow-2xl"
            style={{
              backgroundColor: `${theme.primaryAccent}20`,
              borderColor: `${theme.primaryAccent}50`,
              color: theme.primaryAccent,
            }}
          >
            <IconQuote size={44} />
          </div>

          {/* Quotation Body */}
          <blockquote
            className="text-[44px] font-bold text-white leading-[1.25] tracking-tight drop-shadow-md"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            "{data.quote}"
          </blockquote>

          {/* Key Punchline Callout */}
          {data.keyPunchline && (
            <div
              className="p-5 rounded-2xl border backdrop-blur-md"
              style={{
                backgroundColor: `${theme.primaryAccent}15`,
                borderColor: `${theme.primaryAccent}40`,
              }}
            >
              <div
                className="text-[22px] font-black uppercase tracking-wider"
                style={{
                  fontFamily: fontDisplay,
                  color: theme.primaryAccent,
                }}
              >
                Key Takeaway: "{data.keyPunchline}"
              </div>
            </div>
          )}

          {/* Author Badge */}
          <div className="border-t border-neutral-800 pt-4">
            <div
              className="text-[44px] font-black uppercase tracking-tight text-white leading-none"
              style={{ fontFamily: fontDisplay }}
            >
              {data.authorName}
            </div>
            <div
              className="text-[18px] font-bold uppercase tracking-wider mt-1"
              style={{ color: theme.primaryAccent }}
            >
              {data.authorRole}
            </div>
          </div>
        </div>

        {/* Right side is open for Author/Coach Photo */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
