import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconBallFootball, IconStar } from '@tabler/icons-react';
import { matchAnalysisHeaderLabel, matchAnalysisMetricShare, matchAnalysisScoreFontSize, visibleMatchAnalysisScorers, visibleMatchAnalysisStats, visibleMatchAnalysisTakeaways } from '../../services/matchAnalysis';
import { usableLogoSrc } from '../../services/templateVisualPolicy';
import { scaledTemplateFontSize } from '../../services/templateTypography';

interface TemplateProps { project: Project; }

export const MatchAnalysisView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['match-analysis'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent, visuals } = activeTemplate;
  const data = templateContent.matchAnalysisData || {
    competition: 'PREMIER LEAGUE', scoreline: { team1: 'ARSENAL', score1: 2, team2: 'MAN CITY', score2: 1 }, scorersTeam1: ["Saka 34'", "Havertz 78'"], scorersTeam2: ["Haaland 51'"],
    stats: [{ label: 'Expected Goals (xG)', val1: '2.14', val2: '1.08', val1Num: 2.14, val2Num: 1.08 }, { label: 'Possession %', val1: '48%', val2: '52%', val1Num: 48, val2Num: 52 }],
    tacticalSummary: 'Tactical breakdown summary of the clash.', keyTakeaways: ['Key takeaway 1', 'Key takeaway 2'], performerTitle: 'PLAYER OF THE MATCH', performerName: 'PLAYER NAME', performerNote: 'Match impact details',
  };
  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9' || project.aspectRatio === 'x-landscape';
  const stats = visibleMatchAnalysisStats(data.stats);
  const takeaways = visibleMatchAnalysisTakeaways(data.keyTakeaways);
  const scorersTeam1 = visibleMatchAnalysisScorers(data.scorersTeam1);
  const scorersTeam2 = visibleMatchAnalysisScorers(data.scorersTeam2);
  const hasScorers = scorersTeam1.length > 0 || scorersTeam2.length > 0;
  const hasPerformer = Boolean(data.performerName?.trim());
  const team2Accent = theme.secondaryAccent || '#64748b';
  const team1Logo = visuals.logos?.[0];
  const team2Logo = visuals.logos?.[1];
  const team1LogoSrc = team1Logo?.visible ? usableLogoSrc(team1Logo.src) : '';
  const team2LogoSrc = team2Logo?.visible ? usableLogoSrc(team2Logo.src) : '';
  const matchupFontSize = matchAnalysisScoreFontSize(data.scoreline.team1, data.scoreline.team2, isWide);

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      <div>
        <div className="flex items-center gap-3 mb-2"><span className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border" style={{ backgroundColor: `${theme.primaryAccent}20`, borderColor: `${theme.primaryAccent}50`, color: theme.primaryAccent }}>{matchAnalysisHeaderLabel(data.competition)}</span></div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 w-full">
          <div className="min-w-0 flex items-center gap-3" data-semantic-logo-slot="home-team">
            {team1LogoSrc && <div className={`${isWide ? 'w-[70px] h-[70px]' : 'w-[92px] h-[92px]'} flex-shrink-0 flex items-center justify-center`}><img src={team1LogoSrc} alt={team1Logo?.name || `${data.scoreline.team1} logo`} className="max-w-full max-h-full object-contain drop-shadow-xl" style={{ opacity: (team1Logo?.opacity ?? 100) / 100 }} referrerPolicy="no-referrer" /></div>}
            <div className="font-black uppercase tracking-tight text-white leading-[0.92] break-words min-w-0" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchupFontSize, advancedLayout, 'headline', 26, 72) }}>{data.scoreline.team1}</div>
          </div>
          <div className="font-black tabular-nums leading-none tracking-tight px-2 text-center" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchupFontSize, advancedLayout, 'stat', 26, 72), color: theme.primaryAccent }}>{data.scoreline.score1}–{data.scoreline.score2}</div>
          <div className="min-w-0 flex items-center justify-end gap-3 text-right" data-semantic-logo-slot="away-team">
            <div className="font-black uppercase tracking-tight text-white leading-[0.92] break-words min-w-0" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(matchupFontSize, advancedLayout, 'headline', 26, 72) }}>{data.scoreline.team2}</div>
            {team2LogoSrc && <div className={`${isWide ? 'w-[70px] h-[70px]' : 'w-[92px] h-[92px]'} flex-shrink-0 flex items-center justify-center`}><img src={team2LogoSrc} alt={team2Logo?.name || `${data.scoreline.team2} logo`} className="max-w-full max-h-full object-contain drop-shadow-xl" style={{ opacity: (team2Logo?.opacity ?? 100) / 100 }} referrerPolicy="no-referrer" /></div>}
          </div>
        </div>
        {hasScorers && <div className={`grid grid-cols-2 ${isWide ? 'gap-6 mt-1' : 'gap-10 mt-2'} w-full text-neutral-300 font-semibold`} style={{ fontSize: scaledTemplateFontSize(isWide ? 14 : 16, advancedLayout, 'body', 11, 21) }}><div className="flex items-start gap-2">{scorersTeam1.length > 0 && <><IconBallFootball size={18} className="mt-0.5 flex-shrink-0" style={{ color: theme.primaryAccent }} /><span>{scorersTeam1.join(', ')}</span></>}</div><div className="flex items-start justify-end gap-2 text-right">{scorersTeam2.length > 0 && <><span>{scorersTeam2.join(', ')}</span><IconBallFootball size={18} className="mt-0.5 flex-shrink-0" style={{ color: team2Accent }} /></>}</div></div>}
      </div>

      <div className={`flex-1 w-full ${isWide ? 'my-4' : 'my-6'} flex flex-col ${isWide ? 'gap-3' : 'gap-5'} justify-center`}>
        {data.tacticalSummary?.trim() && <div className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: `${theme.primaryAccent}30` }}><div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-1">Match Overview</div><p className="text-white font-medium leading-relaxed" style={{ fontSize: scaledTemplateFontSize(isWide ? 17 : 21, advancedLayout, 'verdict', 13, 27) }}>{data.tacticalSummary}</p></div>}

        {stats.length > 0 && <div className={`rounded-2xl ${isWide ? 'p-4 gap-3' : 'p-6 gap-4'} border backdrop-blur-md flex flex-col shadow-xl`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: 'rgba(255, 255, 255, 0.08)' }}><div className="text-xs font-black tracking-widest uppercase text-neutral-400">Key Match Metrics</div><div className={`grid ${stats.length > 2 && isWide ? 'grid-cols-2' : 'grid-cols-1'} gap-x-6 gap-y-3`}>{stats.map((stat, index) => { const player1Share = matchAnalysisMetricShare(stat); return <div key={`${stat.label}-${index}`} className="flex flex-col gap-1.5"><div className="flex items-center justify-between font-bold" style={{ fontSize: scaledTemplateFontSize(isWide ? 14 : 16, advancedLayout, 'stat', 11, 21) }}><span style={{ color: theme.primaryAccent }}>{stat.val1}</span><span className="text-neutral-400 uppercase tracking-wider text-xs font-black text-center px-3">{stat.label}</span><span style={{ color: team2Accent }}>{stat.val2}</span></div><div className="h-3 rounded-full bg-neutral-800 overflow-hidden flex"><div className="h-full rounded-l-full" style={{ width: `${player1Share}%`, backgroundColor: theme.primaryAccent }} /><div className="h-full rounded-r-full" style={{ width: `${100 - player1Share}%`, backgroundColor: team2Accent }} /></div></div>; })}</div></div>}

        <div className={`grid ${takeaways.length > 0 && hasPerformer && isWide ? 'grid-cols-[1.4fr_.8fr]' : 'grid-cols-1'} gap-4`}>
          {takeaways.length > 0 && <div className={`rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: 'rgba(255, 255, 255, 0.08)' }}><div className="text-xs font-black tracking-widest uppercase text-neutral-400 mb-2.5">Key Takeaways</div><div className="flex flex-col gap-2">{takeaways.map((takeaway, idx) => <div key={idx} className="flex items-start gap-2.5 text-neutral-200 font-semibold" style={{ fontSize: scaledTemplateFontSize(isWide ? 15 : 17, advancedLayout, 'body', 12, 22) }}><span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: theme.primaryAccent }} /><span>{takeaway}</span></div>)}</div></div>}
          {hasPerformer && <div className="rounded-2xl p-4 border backdrop-blur-md flex items-center justify-between gap-5 shadow-xl" style={{ backgroundColor: 'rgba(10, 14, 26, 0.9)', borderColor: `${theme.primaryAccent}40` }}><div className="flex items-center gap-3 min-w-0"><div className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0" style={{ backgroundColor: `${theme.primaryAccent}15`, borderColor: `${theme.primaryAccent}35`, color: theme.primaryAccent }}><IconStar size={22} /></div><div className="min-w-0"><div className="text-[11px] font-black uppercase tracking-widest text-neutral-400">{data.performerTitle?.trim() || 'PLAYER OF THE MATCH'}</div><div className="font-black uppercase tracking-tight text-white leading-none" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(isWide ? 22 : 26, advancedLayout, 'subtitle', 16, 34) }}>{data.performerName}</div></div></div>{data.performerNote?.trim() && <div className="text-right font-bold text-neutral-300 max-w-[48%]" style={{ fontSize: scaledTemplateFontSize(isWide ? 13 : 15, advancedLayout, 'body', 10, 20) }}>{data.performerNote}</div>}</div>}
        </div>
      </div>
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
