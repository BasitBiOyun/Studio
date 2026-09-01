import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconCalendarEvent, IconClock, IconMapPin, IconSwords } from '@tabler/icons-react';
import { matchPreviewTeamFontSize, matchPreviewTitleFontSize, resolveMatchTiming, tacticalDecidersLabel, visibleMatchForm, visibleTacticalKeys } from '../../services/matchPreview';
import { usableLogoSrc } from '../../services/templateVisualPolicy';
import { scaledTemplateFontSize } from '../../services/templateTypography';

interface TemplateProps { project: Project; }
function formResultClass(result: string) {
  if (result === 'W') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
  if (result === 'D') return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
  if (result === 'L') return 'bg-red-500/20 text-red-300 border border-red-500/40';
  return 'bg-neutral-500/15 text-neutral-300 border border-neutral-500/30';
}

export const MatchPreviewView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['match-preview'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent, visuals } = activeTemplate;
  const data = templateContent.matchPreviewData || {
    competition: 'UEFA CHAMPIONS LEAGUE', matchDate: 'MATCHDAY PREVIEW', kickoffTime: '21:00 CET',
    team1: { name: 'TEAM A', form: ['W', 'W', 'D'], manager: 'Manager 1', standing: '1st' },
    team2: { name: 'TEAM B', form: ['W', 'D', 'W'], manager: 'Manager 2', standing: '2nd' },
    keyBattleTitle: 'KEY TACTICAL BATTLE', keyBattleDetails: 'Player vs Player Matchup', tacticalKeys: ['Key concept 1', 'Key concept 2'],
  };
  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9' || project.aspectRatio === 'x-landscape';
  const team1Form = visibleMatchForm(data.team1.form);
  const team2Form = visibleMatchForm(data.team2.form);
  const tacticalKeys = visibleTacticalKeys(data.tacticalKeys);
  const timing = resolveMatchTiming(data.kickoffTime, (data as any).venue);
  const hasBattle = Boolean(data.keyBattleTitle?.trim() || data.keyBattleDetails?.trim());
  const player2Accent = theme.secondaryAccent || '#64748b';
  const team1Logo = visuals.logos?.[0];
  const team2Logo = visuals.logos?.[1];
  const team1LogoSrc = team1Logo?.visible ? usableLogoSrc(team1Logo.src) : '';
  const team2LogoSrc = team2Logo?.visible ? usableLogoSrc(team2Logo.src) : '';

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      <div>
        {data.competition?.trim() && <div className="flex items-center gap-3 mb-2"><span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border" style={{ backgroundColor: `${theme.primaryAccent}20`, borderColor: `${theme.primaryAccent}50`, color: theme.primaryAccent }}>{data.competition}</span></div>}
        <h1 className="font-black uppercase tracking-tight text-white leading-[0.9] drop-shadow-md" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchPreviewTitleFontSize(data.team1.name, data.team2.name, isWide), advancedLayout, 'headline', 34, 112) }}>{data.team1.name} <span style={{ color: theme.primaryAccent }}>VS</span> {data.team2.name}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-neutral-300" style={{ fontSize: scaledTemplateFontSize(18, advancedLayout, 'subtitle', 13, 23) }}>
          {data.matchDate?.trim() && <div className="flex items-center gap-2 font-bold uppercase tracking-wider"><IconCalendarEvent size={20} style={{ color: theme.primaryAccent }} /><span>{data.matchDate}</span></div>}
          {timing.kickoffTime && <div className="flex items-center gap-2 font-bold uppercase tracking-wider"><IconClock size={20} style={{ color: theme.primaryAccent }} /><span>{timing.kickoffTime}</span></div>}
          {timing.venue && <div className="flex items-center gap-2 font-bold uppercase tracking-wider"><IconMapPin size={20} style={{ color: theme.primaryAccent }} /><span>{timing.venue}</span></div>}
        </div>
      </div>

      <div className={`flex-1 ${isWide ? 'my-3 gap-3' : 'my-6 gap-6'} flex flex-col justify-center max-w-[1900px]`}>
        <div className={`grid grid-cols-2 ${isWide ? 'gap-4' : 'gap-8'}`}>
          {[data.team1, data.team2].map((team, teamIndex) => {
            const form = teamIndex === 0 ? team1Form : team2Form;
            const accent = teamIndex === 0 ? theme.primaryAccent : player2Accent;
            const logo = teamIndex === 0 ? team1Logo : team2Logo;
            const logoSrc = teamIndex === 0 ? team1LogoSrc : team2LogoSrc;
            const semanticSlot = teamIndex === 0 ? 'home-team' : 'away-team';
            return (
              <div key={`${team.name}-${teamIndex}`} className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: `${accent}40` }} data-semantic-logo-slot={semanticSlot}>
                {(team.standing?.trim() || form.length > 0) && <div className="flex items-center justify-between gap-3 mb-2 min-h-7"><span className="text-[12px] font-black uppercase tracking-widest text-neutral-400">{team.standing}</span>{form.length > 0 && <div className="flex gap-1.5">{form.map((result, index) => <span key={`${result}-${index}`} className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${formResultClass(result)}`}>{result}</span>)}</div>}</div>}
                <div className={`flex items-center ${teamIndex === 1 ? 'justify-end text-right' : ''} ${isWide ? 'gap-3' : 'gap-4'} min-w-0`}>
                  {teamIndex === 1 && <div className="min-w-0 flex-1"><div className="font-black uppercase tracking-tight text-white leading-tight break-words" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchPreviewTeamFontSize(team.name, isWide), advancedLayout, 'headline', 22, 54) }}>{team.name}</div>{team.manager?.trim() && <div className="font-bold text-neutral-300 uppercase mt-1" style={{ fontSize: scaledTemplateFontSize(16, advancedLayout, 'body', 12, 20) }}>Manager: {team.manager}</div>}</div>}
                  {logoSrc && <div className={`${isWide ? 'w-[76px] h-[76px]' : 'w-[96px] h-[96px]'} flex-shrink-0 flex items-center justify-center`}><img src={logoSrc} alt={logo?.name || `${team.name} logo`} className="max-w-full max-h-full object-contain drop-shadow-xl" style={{ opacity: (logo?.opacity ?? 100) / 100 }} referrerPolicy="no-referrer" /></div>}
                  {teamIndex === 0 && <div className="min-w-0 flex-1"><div className="font-black uppercase tracking-tight text-white leading-tight break-words" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchPreviewTeamFontSize(team.name, isWide), advancedLayout, 'headline', 22, 54) }}>{team.name}</div>{team.manager?.trim() && <div className="font-bold text-neutral-300 uppercase mt-1" style={{ fontSize: scaledTemplateFontSize(16, advancedLayout, 'body', 12, 20) }}>Manager: {team.manager}</div>}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {hasBattle && <div className={`${isWide ? 'p-4' : 'p-6'} rounded-2xl border backdrop-blur-md shadow-xl flex items-start gap-5`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', borderColor: `${theme.primaryAccent}30` }}><div className={`${isWide ? 'p-2.5' : 'p-3'} rounded-2xl border text-white flex-shrink-0`} style={{ backgroundColor: `${theme.primaryAccent}20`, borderColor: `${theme.primaryAccent}50`, color: theme.primaryAccent }}><IconSwords size={isWide ? 24 : 28} /></div><div><div className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: theme.primaryAccent }}>{data.keyBattleTitle?.trim() || 'KEY TACTICAL BATTLE'}</div>{data.keyBattleDetails?.trim() && <p className="font-bold text-white leading-snug" style={{ fontSize: scaledTemplateFontSize(isWide ? 19 : 22, advancedLayout, 'verdict', 14, 28) }}>{data.keyBattleDetails}</p>}</div></div>}

        {tacticalKeys.length > 0 && <div className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: 'rgba(255, 255, 255, 0.08)' }}><div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-3">{tacticalDecidersLabel(tacticalKeys.length)}</div><div className={`grid ${tacticalKeys.length === 1 ? 'grid-cols-1' : tacticalKeys.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>{tacticalKeys.map((key, index) => <div key={`${key}-${index}`} className={`${isWide ? 'p-3' : 'p-4'} rounded-xl border bg-black/40 flex items-start gap-3`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}><span className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center text-black flex-shrink-0" style={{ backgroundColor: theme.primaryAccent }}>{index + 1}</span><span className="font-semibold text-neutral-200 leading-snug" style={{ fontSize: scaledTemplateFontSize(isWide ? 15 : 17, advancedLayout, 'body', 12, 22) }}>{key}</span></div>)}</div></div>}
      </div>
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
