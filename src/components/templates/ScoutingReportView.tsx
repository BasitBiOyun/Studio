import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { EditorialStatCard } from '../design/EditorialStatCard';
import { IconBolt, IconAward, IconCrosshair, IconCompass } from '@tabler/icons-react';
import { resolveCountryFlag } from '../../services/footballLocale';
import { scaledTemplateFontSize } from '../../services/templateTypography';
import { getActiveTemplateVariantId } from '../../services/templateVariants';
import { getActiveAutoLayoutPresetId } from '../../services/autoLayoutPresets';

interface TemplateProps { project: Project; }

function compactTextSize(length: number, isWide: boolean, kind: 'profile' | 'summary'): number {
  if (kind === 'profile') {
    if (length > 700) return isWide ? 10 : 11;
    if (length > 500) return isWide ? 10.5 : 12;
    if (length > 320) return isWide ? 11 : 13;
    return isWide ? 12 : 14;
  }
  if (length > 600) return isWide ? 11 : 12;
  if (length > 420) return isWide ? 12 : 13;
  if (length > 260) return isWide ? 13 : 14;
  return isWide ? 14 : 16;
}

export const ScoutingReportView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { profile, stats, strengths, development } = templateContent;
  const variant = getActiveTemplateVariantId(project) || 'scouting-editorial';
  const isDataVariant = variant === 'scouting-data';
  const autoLayout = getActiveAutoLayoutPresetId(project);
  const fullContent = autoLayout === 'no-subject-full-content';
  const playerLeft = autoLayout === 'player-left';
  const visualMode = isDataVariant ? 'data' : (project.visualMode || 'editorial');
  const isWide = project.aspectRatio === '16:9' || project.aspectRatio === 'x-landscape';
  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const scoutingHeadline = (templateContent as any).scoutingHeadline || '';
  const resolvedFlag = resolveCountryFlag(player.nationality, player.countryFlag);

  const metaBadges = [
    { label: 'Nat', value: resolvedFlag ? <span className="flex items-center gap-1.5"><span className={`fi fi-${resolvedFlag.toLowerCase()} text-[1.1em] drop-shadow-sm`} />{player.nationality}</span> : player.nationality },
    { label: 'Age', value: player.age },
    { label: 'Foot', value: player.preferredFoot },
    { label: 'Height', value: player.height },
  ];

  const dataContext = (templateContent as any).dataProvenance?.context || {};
  const firstStatProvenance = stats.find((stat) => stat.provenance)?.provenance;
  const season = dataContext.season || firstStatProvenance?.season;
  const competition = dataContext.competition || dataContext.league || firstStatProvenance?.competition;
  const sample = dataContext.minutes != null ? `${dataContext.minutes} MINUTES` : firstStatProvenance?.sampleSize;
  const scope = dataContext.scope;
  const contextLine = [season, competition, sample, scope].filter(Boolean).join(' • ');
  const subtitle = [player.club, player.positions].filter(Boolean).join(' • ');
  const visibleStats = stats.filter((stat) => Boolean((stat.value || '').trim() || (stat.label || '').trim())).slice(0, 6);
  const statColumns = visibleStats.length <= 1 ? 'grid-cols-1' : visibleStats.length === 2 ? 'grid-cols-2' : visibleStats.length === 3 ? 'grid-cols-3' : visibleStats.length === 4 ? 'grid-cols-2' : 'grid-cols-3';
  const statCardClass = visibleStats.length === 1 ? (isWide ? 'min-h-[112px]' : 'min-h-[140px]') : '';
  const visibleStrengths = strengths.slice(0, 5);
  const visibleDevelopment = development.slice(0, 3);
  const contentColumnClass = fullContent
    ? 'col-span-12'
    : playerLeft
      ? (isDataVariant ? 'col-span-9 col-start-4' : 'col-span-8 col-start-5')
      : (isDataVariant ? 'col-span-9' : 'col-span-8');

  return (
    <div data-template-variant={variant} data-layout-content={fullContent ? 'full' : playerLeft ? 'right' : 'left'} className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-5' : isDataVariant ? 'p-8 md:p-9' : 'p-9 md:p-10'} select-none`}>
      <EditorialHeader title={player?.name || ''} subtitle={subtitle} metaBadges={metaBadges} theme={theme} fontDisplay={fontDisplay} visualMode={visualMode} layout={advancedLayout} />

      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-3 my-1.5' : 'gap-5 my-3'} items-center min-h-0`}>
        <div className={`${contentColumnClass} flex flex-col ${isWide ? 'gap-2.5' : 'gap-3'} min-h-0`}>
          {scoutingHeadline && (
            <div className="font-black uppercase tracking-tight leading-[1.02] pr-2" style={{ order: 0, fontFamily: fontDisplay, color: theme.primaryAccent, fontSize: scaledTemplateFontSize(isWide ? 18 : 22, advancedLayout, 'subtitle', 14, 28) }}>
              {scoutingHeadline}
            </div>
          )}

          {advancedLayout.visibleBlocks.tacticalProfile !== false && profile.tacticalProfile && (
            <div className={`rounded-2xl ${isWide ? 'px-4 py-3' : 'px-4 py-3.5'} border backdrop-blur-md shadow-xl`} style={{ order: isDataVariant ? 2 : 1, backgroundColor: isDataVariant ? 'rgba(5, 9, 18, 0.9)' : 'rgba(8, 12, 22, 0.85)', borderColor: `${theme.primaryAccent}${isDataVariant ? '38' : '25'}` }}>
              <div className="flex items-center gap-1.5 mb-1.5"><IconCompass size={isWide ? 14 : 16} style={{ color: theme.primaryAccent }} /><span className={`${isWide ? 'text-[10px]' : 'text-[11px]'} font-black tracking-widest uppercase text-neutral-300`}>Role & Tactical Profile</span></div>
              <p className="text-neutral-200 leading-[1.42]" style={{ fontSize: scaledTemplateFontSize(compactTextSize(profile.tacticalProfile.length, isWide, 'profile'), advancedLayout, 'body', 9, 18) }}>{profile.tacticalProfile}</p>
            </div>
          )}

          {advancedLayout.visibleBlocks.stats !== false && visibleStats.length > 0 && (
            <div className="space-y-1.5" style={{ order: isDataVariant ? 1 : 2 }}>
              {contextLine && <div className="px-1 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400">{contextLine}</div>}
              <div className={`grid ${statColumns} ${isDataVariant ? 'gap-1.5' : 'gap-2'}`}>
                {visibleStats.map((st) => <EditorialStatCard key={st.id} stat={st} theme={theme} fontDisplay={fontDisplay} className={`${statCardClass} ${isDataVariant ? 'ring-1 ring-white/5' : ''}`} layout={advancedLayout} />)}
              </div>
            </div>
          )}

          {(advancedLayout.visibleBlocks.strengths !== false || advancedLayout.visibleBlocks.development !== false) && (
            <div className={`rounded-2xl ${isWide ? 'px-4 py-3' : 'px-4 py-3.5'} border backdrop-blur-md grid grid-cols-2 ${isWide ? 'gap-4' : 'gap-5'} shadow-2xl`} style={{ order: isDataVariant ? 4 : 3, backgroundColor: isDataVariant ? 'rgba(5, 9, 18, 0.93)' : 'rgba(8, 12, 22, 0.90)', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
              {advancedLayout.visibleBlocks.strengths !== false && <div><div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-emerald-500/20"><IconAward size={isWide ? 14 : 16} className="text-emerald-400" /><span className={`${isWide ? 'text-[10px]' : 'text-[11px]'} font-black tracking-widest uppercase text-emerald-400`}>Key Strengths</span></div><ul className="flex flex-col gap-1.5">{visibleStrengths.map((s, idx) => <li key={idx} className="flex items-start gap-2 text-neutral-100 font-semibold leading-[1.35]" style={{ fontSize: scaledTemplateFontSize(isWide ? 10.5 : 11.5, advancedLayout, 'body', 9, 16) }}><span className="w-1.5 h-1.5 rounded-sm mt-1 flex-shrink-0 rotate-45 shadow-sm" style={{ backgroundColor: theme.primaryAccent }} /><span>{s}</span></li>)}</ul></div>}
              {advancedLayout.visibleBlocks.development !== false && <div><div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-amber-500/20"><IconCrosshair size={isWide ? 14 : 16} className="text-amber-400" /><span className={`${isWide ? 'text-[10px]' : 'text-[11px]'} font-black tracking-widest uppercase text-amber-400`}>Development Areas</span></div><ul className="flex flex-col gap-1.5">{visibleDevelopment.map((d, idx) => <li key={idx} className="flex items-start gap-2 text-neutral-200 font-semibold leading-[1.35]" style={{ fontSize: scaledTemplateFontSize(isWide ? 10.5 : 11.5, advancedLayout, 'body', 9, 16) }}><span className="w-1.5 h-1.5 rounded-sm bg-amber-400 mt-1 flex-shrink-0 rotate-45 shadow-sm" /><span>{d}</span></li>)}</ul></div>}
            </div>
          )}

          {advancedLayout.visibleBlocks.summary !== false && profile.summary && (
            <div className={`rounded-2xl ${isWide ? 'px-4 py-3' : 'px-4 py-3.5'} border backdrop-blur-md relative overflow-hidden shadow-2xl`} style={{ order: isDataVariant ? 3 : 4, backgroundColor: 'rgba(8, 12, 22, 0.92)', borderColor: `${theme.primaryAccent}40`, boxShadow: `0 20px 40px -10px rgba(0,0,0,0.85), inset 4px 0 0 0 ${theme.primaryAccent}` }}>
              <div className="flex items-center gap-2 mb-1.5"><div className="p-1 rounded-md border" style={{ backgroundColor: `${theme.primaryAccent}18`, borderColor: `${theme.primaryAccent}45`, color: theme.primaryAccent }}><IconBolt size={isWide ? 14 : 16} /></div><span className={`${isWide ? 'text-[10px]' : 'text-[11px]'} font-black tracking-widest uppercase`} style={{ color: theme.primaryAccent }}>Scout Verdict</span></div>
              <p className="text-white font-medium leading-[1.42] drop-shadow-sm" style={{ fontSize: scaledTemplateFontSize(compactTextSize(profile.summary.length, isWide, 'summary'), advancedLayout, 'verdict', 10, 20) }}>{profile.summary}</p>
            </div>
          )}
        </div>
        {!fullContent && !playerLeft && <div className={`${isDataVariant ? 'col-span-3' : 'col-span-4'} h-full pointer-events-none`} />}
      </div>

      {advancedLayout.visibleBlocks.footer !== false && <EditorialFooter credits={credits} theme={theme} visualMode={visualMode} />}
    </div>
  );
};