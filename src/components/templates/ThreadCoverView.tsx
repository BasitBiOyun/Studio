import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconBook2, IconArrowNarrowRight } from '@tabler/icons-react';
import {
  threadHeadlineFontSize,
  threadHeaderContext,
  threadSubtitleFontSize,
  threadTopicFontSize,
  visibleThreadTopics,
} from '../../services/threadCover';

interface TemplateProps {
  project: Project;
}

export const ThreadCoverView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['thread-cover'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { threadCoverData } = templateContent;
  const data = threadCoverData || {
    headline: 'THE TACTICAL EVOLUTION OF FOOTBALL',
    subtitle: 'Comprehensive Tactical Breakdown',
    badge: 'EDITORIAL THREAD',
    authorHandle: 'Analysis by @BasitBiOyun',
    topicBullets: ['Concept 1', 'Concept 2', 'Concept 3'],
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const fontBody = advancedLayout?.fontBody || "'Plus Jakarta Sans', sans-serif";
  const isWide = project.aspectRatio === '16:9';
  const headline = String(data.headline || '').trim();
  const subtitle = String(data.subtitle || '').trim();
  const header = threadHeaderContext(data.badge, data.authorHandle);
  const topics = visibleThreadTopics(data.topicBullets || []);
  const hasHeader = Boolean(header.badge || header.authorHandle);

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      {hasHeader && (
        <div className="flex items-center gap-3 flex-wrap">
          {header.badge && (
            <span
              className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border inline-flex items-center gap-2"
              style={{
                backgroundColor: `${theme.primaryAccent}20`,
                borderColor: `${theme.primaryAccent}50`,
                color: theme.primaryAccent,
              }}
            >
              <IconBook2 size={15} />
              {header.badge}
            </span>
          )}
          {header.authorHandle && (
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {header.authorHandle}
            </span>
          )}
        </div>
      )}

      <div className={`flex-1 ${isWide ? 'my-4' : 'my-6'} flex flex-col justify-center max-w-[1500px]`}>
        {headline && (
          <h1
            className="font-black uppercase tracking-tight text-white leading-[0.88] drop-shadow-xl max-w-[1320px]"
            style={{
              fontFamily: fontDisplay,
              fontSize: threadHeadlineFontSize(headline, isWide),
            }}
          >
            {headline}
          </h1>
        )}

        {subtitle && (
          <p
            className={`font-semibold text-neutral-300 leading-snug ${isWide ? 'mt-3 max-w-[1000px]' : 'mt-4 max-w-[1200px]'}`}
            style={{
              fontFamily: fontBody,
              fontSize: threadSubtitleFontSize(subtitle, isWide),
            }}
          >
            {subtitle}
          </p>
        )}

        {topics.length > 0 && (
          <div className={`${isWide ? 'mt-5 gap-2 max-w-[920px]' : 'mt-8 gap-3 max-w-[1000px]'} flex flex-col`}>
            {topics.map((bullet, idx) => (
              <div
                key={`${idx}-${bullet}`}
                className={`${isWide ? 'p-3' : 'p-4'} rounded-xl border backdrop-blur-md flex items-center gap-4 shadow-md`}
                style={{
                  backgroundColor: 'rgba(10, 14, 26, 0.85)',
                  borderColor: `${theme.primaryAccent}25`,
                }}
              >
                <div
                  className={`${isWide ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg flex items-center justify-center font-black text-xs text-black flex-shrink-0`}
                  style={{ backgroundColor: theme.primaryAccent }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <span
                  className="font-bold text-white tracking-wide leading-snug flex-1"
                  style={{ fontSize: threadTopicFontSize(bullet, isWide) }}
                >
                  {bullet}
                </span>
                <IconArrowNarrowRight size={isWide ? 18 : 21} style={{ color: theme.primaryAccent }} className="flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
