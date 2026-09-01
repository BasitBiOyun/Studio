import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconBallFootball, IconStar } from '@tabler/icons-react';
import { matchResultHeaderContext, matchResultMvpNameFontSize, matchResultScoreFontSize, visibleMatchResultScorers, visibleMatchResultStats } from '../../services/matchResult';
import { usableLogoSrc } from '../../services/templateVisualPolicy';
import { scaledTemplateFontSize } from '../../services/templateTypography';

interface TemplateProps { project: Project; }

export const MatchResultView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['match-result'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent, visuals } = activeTemplate;
  const data = templateContent.matchResultData || {
    competition: 'CHAMPIONS LEAGUE', stage: 'FINAL', team1: 'REAL MADRID', team2: 'BAYERN MUNICH', score1: 3, score2: 1,
    scorers1: ["Vinicius 21'", "Bellingham 54'"], scorers2: ["Kane 73'"], matchStats: [], mvpPlayer: 'VINICIUS JR', mvpStat: '1 Goal • 1 Assist', matchSummary: 'Decisive performance.',
  };
  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const fontBody = advancedLayout?.fontBody || "'Plus Jakarta Sans', sans-serif";
  const isWide = project.aspectRatio === '16:9' || project.aspectRatio === 'x-landscape';
  const headerContext = matchResultHeaderContext(data.competition, data.stage);
  const scorers1 = visibleMatchResultScorers(data.scorers1 || []);
  const scorers2 = visibleMatchResultScorers(data.scorers2 || []);
  const stats = visibleMatchResultStats(data.matchStats || []);
  const summary = String(data.matchSummary || '').trim();
  const mvpPlayer = String(data.mvpPlayer || '').trim();
  const mvpStat = String(data.mvpStat || '').trim();
  const hasMvp = Boolean(mvpPlayer || mvpStat);
  const matchupFontSize = matchResultScoreFontSize(data.team1, data.team2, isWide);
  const homeLogo = visuals.logos?.[0];
  const awayLogo = visuals.logos?.[1];
  const homeLogoSrc = homeLogo?.visible ? usableLogoSrc(homeLogo.src) : '';
  const awayLogoSrc = awayLogo?.visible ? usableLogoSrc(awayLogo.src) : '';

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      <div>
        <div className="flex items-center gap-3 mb-3 flex-wrap">{headerContext && <span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border" style={{ backgroundColor: `${theme.primaryAccent}20`, borderColor: `${theme.primaryAccent}50`, color: theme.primaryAccent }}>{headerContext}</span>}<span className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">FULL TIME</span></div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-5 w-full">
          <div className="min-w-0 text-left" data-semantic-logo-slot="home-team">
            <div className="flex items-start gap-3">{homeLogoSrc && <div className={`${isWide ? 'w-[62px] h-[62px]' : 'w-[78px] h-[78px]'} flex-shrink-0 flex items-center justify-center`}><img src={homeLogoSrc} alt={homeLogo?.name || `${data.team1} logo`} className="max-w-full max-h-full object-contain drop-shadow-xl" style={{ opacity: (homeLogo?.opacity ?? 100) / 100 }} referrerPolicy="no-referrer" /></div>}<div className="font-black uppercase tracking-tight text-white leading-none drop-shadow-lg break-words" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchupFontSize, advancedLayout, 'headline', 26, 72) }}>{data.team1}</div></div>
            {scorers1.length > 0 && <div className="mt-2 flex items-start gap-2 text-neutral-300 font-semibold" style={{ fontSize: scaledTemplateFontSize(isWide ? 13 : 16, advancedLayout, 'body', 10, 21) }}><IconBallFootball size={isWide ? 15 : 18} style={{ color: theme.primaryAccent }} className="flex-shrink-0 mt-0.5" /><span className="leading-snug">{scorers1.join(', ')}</span></div>}
          </div>
          <div className="font-black tabular-nums leading-none tracking-tight px-2" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchupFontSize, advancedLayout, 'stat', 26, 72), color: theme.primaryAccent }}>{data.score1}–{data.score2}</div>
          <div className="min-w-0 text-right" data-semantic-logo-slot="away-team">
            <div className="flex items-start justify-end gap-3"><div className="font-black uppercase tracking-tight text-white leading-none drop-shadow-lg break-words" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchupFontSize, advancedLayout, 'headline', 26, 72) }}>{data.team2}</div>{awayLogoSrc && <div className={`${isWide ? 'w-[62px] h-[62px]' : 'w-[78px] h-[78px]'} flex-shrink-0 flex items-center justify-center`}><img src={awayLogoSrc} alt={awayLogo?.name || `${data.team2} logo`} className="max-w-full max-h-full object-contain drop-shadow-xl" style={{ opacity: (awayLogo?.opacity ?? 100) / 100 }} referrerPolicy="no-referrer" /></div>}</div>
            {scorers2.length > 0 && <div className="mt-2 flex items-start justify-end gap-2 text-neutral-300 font-semibold" style={{ fontSize: scaledTemplateFontSize(isWide ? 13 : 16, advancedLayout, 'body', 10, 21) }}><span className="leading-snug">{scorers2.join(', ')}</span><IconBallFootball size={isWide ? 15 : 18} style={{ color: theme.secondaryAccent }} className="flex-shrink-0 mt-0.5" /></div>}
          </div>
        </div>
      </div>

      <div className={`flex-1 w-full ${isWide ? 'my-4' : 'my-6'} flex flex-col ${isWide ? 'gap-4' : 'gap-5'} justify-center`}>
        {summary && <div className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: `${theme.primaryAccent}30` }}><div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">FULL TIME SUMMARY</div><p className="text-white font-medium leading-relaxed" style={{ fontFamily: fontBody, fontSize: scaledTemplateFontSize(isWide ? 17 : 21, advancedLayout, 'verdict', 13, 27) }}>{summary}</p></div>}

        {stats.length > 0 && <div className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md grid ${stats.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-4 shadow-xl`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>{stats.map((st, i) => <div key={`${st.label}-${i}`} className={`${isWide ? 'p-3' : 'p-3.5'} rounded-xl bg-black/40 border flex items-center justify-between gap-3`} style={{ borderColor: 'rgba(255,255,255,0.06)' }}><span className="font-black tabular-nums" style={{ color: theme.primaryAccent, fontSize: scaledTemplateFontSize(isWide ? 18 : 20, advancedLayout, 'stat', 14, 26) }}>{st.val1}</span><span className="text-xs font-bold uppercase tracking-wider text-neutral-400 text-center flex-1">{st.label}</span><span className="font-black tabular-nums" style={{ color: theme.secondaryAccent, fontSize: scaledTemplateFontSize(isWide ? 18 : 20, advancedLayout, 'stat', 14, 26) }}>{st.val2}</span></div>)}</div>}

        {hasMvp && <div className={`rounded-2xl ${isWide ? 'p-4' : 'p-5'} border backdrop-blur-md flex items-center justify-between gap-6 shadow-xl`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', borderColor: `${theme.primaryAccent}40` }}><div className="flex items-center gap-3 min-w-0"><div className={`${isWide ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl flex items-center justify-center border flex-shrink-0`} style={{ backgroundColor: `${theme.primaryAccent}15`, borderColor: `${theme.primaryAccent}35`, color: theme.primaryAccent }}><IconStar size={isWide ? 21 : 24} /></div><div className="min-w-0"><div className="text-[11px] font-black uppercase tracking-widest text-neutral-400">PLAYER OF THE MATCH</div>{mvpPlayer && <div className="font-black uppercase tracking-tight text-white leading-none" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchResultMvpNameFontSize(mvpPlayer, isWide), advancedLayout, 'subtitle', 16, 38) }}>{mvpPlayer}</div>}</div></div>{mvpStat && <div className="text-right font-bold text-neutral-300 max-w-[40%]" style={{ fontSize: scaledTemplateFontSize(isWide ? 15 : 17, advancedLayout, 'body', 12, 22) }}>{mvpStat}</div>}</div>}
      </div>
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
