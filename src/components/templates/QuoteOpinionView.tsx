import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconQuote } from '@tabler/icons-react';
import {
  quoteAuthorFontSize,
  quoteBodyFontSize,
  quoteHeaderContext,
  quotePunchlineFontSize,
} from '../../services/quoteOpinion';

interface TemplateProps {
  project: Project;
}

export const QuoteOpinionView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['quote-opinion'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { quoteData } = templateContent;
  const data = quoteData || {
    quote: 'In football, simplicity is the most difficult thing.',
    authorName: 'AUTHOR NAME',
    authorRole: 'Head Coach',
    topicTag: 'OPINION & INSIGHT',
    sourceDate: 'Press Conference',
    keyPunchline: 'Key takeaway highlight',
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const fontBody = advancedLayout?.fontBody || "'Plus Jakarta Sans', sans-serif";
  const isWide = project.aspectRatio === '16:9';
  const quote = String(data.quote || '').trim();
  const authorName = String(data.authorName || '').trim();
  const authorRole = String(data.authorRole || '').trim();
  const punchline = String(data.keyPunchline || '').trim();
  const header = quoteHeaderContext(data.topicTag, data.sourceDate);
  const hasHeader = Boolean(header.topicTag || header.sourceDate);
  const hasAuthor = Boolean(authorName || authorRole);

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      {hasHeader && (
        <div className="flex items-center gap-3 flex-wrap">
          {header.topicTag && (
            <span
              className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border"
              style={{
                backgroundColor: `${theme.primaryAccent}20`,
                borderColor: `${theme.primaryAccent}50`,
                color: theme.primaryAccent,
              }}
            >
              {header.topicTag}
            </span>
          )}
          {header.sourceDate && (
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {header.sourceDate}
            </span>
          )}
        </div>
      )}

      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-5 my-4' : 'gap-8 my-6'} items-center`}>
        <div className={`col-span-8 flex flex-col ${isWide ? 'gap-4' : 'gap-6'} max-w-[1300px]`}>
          {quote && (
            <>
              <div
                className={`${isWide ? 'w-16 h-16 rounded-2xl' : 'w-20 h-20 rounded-3xl'} flex items-center justify-center border shadow-2xl`}
                style={{
                  backgroundColor: `${theme.primaryAccent}20`,
                  borderColor: `${theme.primaryAccent}50`,
                  color: theme.primaryAccent,
                }}
              >
                <IconQuote size={isWide ? 36 : 44} />
              </div>

              <blockquote
                className="font-bold text-white leading-[1.22] tracking-tight drop-shadow-md"
                style={{
                  fontFamily: fontBody,
                  fontSize: quoteBodyFontSize(quote, isWide),
                }}
              >
                {quote}
              </blockquote>
            </>
          )}

          {punchline && (
            <div
              className={`${isWide ? 'p-4' : 'p-5'} rounded-2xl border backdrop-blur-md`}
              style={{
                backgroundColor: `${theme.primaryAccent}15`,
                borderColor: `${theme.primaryAccent}40`,
              }}
            >
              <div className="text-[11px] font-black tracking-[0.18em] uppercase text-neutral-400 mb-1.5">
                KEY TAKEAWAY
              </div>
              <div
                className="font-black uppercase tracking-wide leading-tight"
                style={{
                  fontFamily: fontDisplay,
                  color: theme.primaryAccent,
                  fontSize: quotePunchlineFontSize(punchline, isWide),
                }}
              >
                {punchline}
              </div>
            </div>
          )}

          {hasAuthor && (
            <div className="border-t border-neutral-800 pt-4">
              {authorName && (
                <div
                  className="font-black uppercase tracking-tight text-white leading-none"
                  style={{
                    fontFamily: fontDisplay,
                    fontSize: quoteAuthorFontSize(authorName, isWide),
                  }}
                >
                  {authorName}
                </div>
              )}
              {authorRole && (
                <div
                  className={`${isWide ? 'text-[16px]' : 'text-[18px]'} font-bold uppercase tracking-wider mt-1`}
                  style={{ color: theme.primaryAccent }}
                >
                  {authorRole}
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
