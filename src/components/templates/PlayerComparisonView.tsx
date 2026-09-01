import React from 'react';
import { PlayerInfo, Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconVs, IconScale } from '@tabler/icons-react';
import { formatComparisonContext, getMetricWinner, visibleComparisonMetrics } from '../../services/comparison';
import { usablePlayerImageSrc } from '../../services/templateVisualPolicy';
import { scaledTemplateFontSize } from '../../services/templateTypography';
import { getActiveTemplateVariantId } from '../../services/templateVariants';

interface TemplateProps { project: Project; }

function playerMeta(player: PlayerInfo): string {
  return [player.positions, player.age ? `${player.age} Y/O` : ''].filter(Boolean).join(' • ');
}

function playerNameSize(name: string, isWide: boolean): number {
  const length = String(name || '').trim().length;
  if (length > 19) return isWide ? 28 : 32;
  if (length > 14) return isWide ? 32 : 36;
  return isWide ? 36 : 44;
}

function PlayerAvatar({ src, accent, label, isWide, compact = false }: { src: string; accent: string; label: string; isWide: boolean; compact?: boolean }) {
  if (!src) return null;
  const size = compact ? (isWide ? 'w-14 h-14' : 'w-16 h-16') : (isWide ? 'w-20 h-20' : 'w-24 h-24');
  return <div className={`${size} rounded-full overflow-hidden border-2 flex-shrink-0 bg-black/30 shadow-xl`} style={{ borderColor: `${accent}80` }}><img src={src} alt={label} className="w-full h-full object-contain object-bottom" crossOrigin={src.startsWith('http') ? 'anonymous' : undefined} referrerPolicy="no-referrer" /></div>;
}

export const PlayerComparisonView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['player-comparison'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent, visuals } = activeTemplate;
  const data = templateContent.comparisonData || {
    player1: project.sharedData.player,
    player2: { name: 'OPPONENT PLAYER', age: '21', nationality: 'France', preferredFoot: 'Left', height: '180 cm', positions: 'Winger', club: 'PSG' },
    subtitle: 'U21 WINGERS • HEAD-TO-HEAD METRIC COMPARISON', metrics: [], verdictTitle: 'ANALYTICAL VERDICT', verdictText: 'Detailed performance breakdown.',
  };
  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9' || project.aspectRatio === 'x-landscape';
  const variant = getActiveTemplateVariantId(project) || 'comparison-split';
  const isTable = variant === 'comparison-table';
  const importedContext = (templateContent as any).dataProvenance?.context;
  const subtitle = formatComparisonContext(importedContext) || data.subtitle;
  const metrics = visibleComparisonMetrics(data.metrics);
  const player2Accent = theme.secondaryAccent || '#94a3b8';
  const player1Image = usablePlayerImageSrc(visuals.playerImageSrc);
  const player2Image = usablePlayerImageSrc(visuals.secondaryPlayerImageSrc);

  const renderCompactPlayer = (player: PlayerInfo, src: string, accent: string, side: 'left' | 'right') => (
    <div className={`rounded-2xl ${isWide ? 'p-3' : 'p-4'} border backdrop-blur-md shadow-xl flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`} style={{ backgroundColor: 'rgba(5, 9, 18, 0.9)', borderColor: `${accent}45` }}>
      <PlayerAvatar src={src} accent={accent} label={`${player.name} portrait`} isWide={isWide} compact />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{playerMeta(player)}</div>
        <div className="font-black uppercase tracking-tight text-white leading-tight break-words" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(isWide ? 25 : 30, advancedLayout, 'headline', 20, 40) }}>{player.name}</div>
        <div className="font-bold uppercase tracking-wider" style={{ color: accent, fontSize: scaledTemplateFontSize(14, advancedLayout, 'subtitle', 11, 19) }}>{player.club}</div>
      </div>
    </div>
  );

  return (
    <div data-template-variant={variant} className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : isTable ? 'p-11 md:p-12' : 'p-14 md:p-16'} select-none`}>
      <EditorialHeader categoryBadge={isTable ? 'Head-to-Head • Data Table' : 'Head-to-Head • Analytical Comparison'} title={`${data.player1.name} VS ${data.player2.name}`} subtitle={subtitle} theme={theme} fontDisplay={fontDisplay} layout={advancedLayout} visualMode={isTable ? 'data' : 'editorial'} />

      <div className={`flex-1 ${isWide ? 'my-3 gap-3' : isTable ? 'my-4 gap-4' : 'my-6 gap-6'} flex flex-col justify-center max-w-[2000px] mx-auto w-full`}>
        {isTable ? (
          <div className={`grid grid-cols-2 ${isWide ? 'gap-3' : 'gap-4'}`}>
            {renderCompactPlayer(data.player1, player1Image, theme.primaryAccent, 'left')}
            {renderCompactPlayer(data.player2, player2Image, player2Accent, 'right')}
          </div>
        ) : (
          <div className={`grid grid-cols-12 ${isWide ? 'gap-4' : 'gap-8'} items-center`}>
            <div className={`col-span-5 rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl flex items-center gap-4`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: `${theme.primaryAccent}40` }}>
              <PlayerAvatar src={player1Image} accent={theme.primaryAccent} label={`${data.player1.name} portrait`} isWide={isWide} />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-black uppercase tracking-widest text-neutral-400">{playerMeta(data.player1)}</div>
                <div className="font-black uppercase tracking-tight text-white leading-tight break-words" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(playerNameSize(data.player1.name, isWide), advancedLayout, 'headline', 22, 54) }}>{data.player1.name}</div>
                <div className="font-bold uppercase tracking-wider" style={{ color: theme.primaryAccent, fontSize: scaledTemplateFontSize(18, advancedLayout, 'subtitle', 14, 24) }}>{data.player1.club}</div>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-center"><div className="w-16 h-16 rounded-2xl flex items-center justify-center border font-black text-2xl shadow-2xl backdrop-blur-md" style={{ backgroundColor: 'rgba(10, 14, 26, 0.95)', borderColor: `${theme.primaryAccent}50`, color: theme.primaryAccent }}><IconVs size={32} /></div></div>

            <div className={`col-span-5 rounded-2xl ${isWide ? 'p-4' : 'p-6'} border backdrop-blur-md shadow-xl flex items-center gap-4 text-right`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: `${player2Accent}55` }}>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-black uppercase tracking-widest text-neutral-400">{playerMeta(data.player2)}</div>
                <div className="font-black uppercase tracking-tight text-white leading-tight break-words" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(playerNameSize(data.player2.name, isWide), advancedLayout, 'headline', 22, 54) }}>{data.player2.name}</div>
                <div className="font-bold uppercase tracking-wider" style={{ color: player2Accent, fontSize: scaledTemplateFontSize(18, advancedLayout, 'subtitle', 14, 24) }}>{data.player2.club}</div>
              </div>
              <PlayerAvatar src={player2Image} accent={player2Accent} label={`${data.player2.name} portrait`} isWide={isWide} />
            </div>
          </div>
        )}

        <div className={`rounded-2xl ${isWide ? 'p-4 gap-2' : isTable ? 'p-4 gap-1.5' : 'p-6 gap-4'} border backdrop-blur-md flex flex-col shadow-2xl`} style={{ backgroundColor: isTable ? 'rgba(5, 9, 18, 0.94)' : 'rgba(10, 14, 26, 0.9)', borderColor: isTable ? `${theme.primaryAccent}25` : 'rgba(255, 255, 255, 0.08)' }}>
          {isTable && metrics.length > 0 && (
            <div className="grid grid-cols-12 gap-2 pb-2 border-b border-neutral-700/70 text-[10px] font-black uppercase tracking-[0.16em] text-neutral-500">
              <div className="col-span-6">Metric</div>
              <div className="col-span-3 text-center">{data.player1.name}</div>
              <div className="col-span-3 text-center">{data.player2.name}</div>
            </div>
          )}
          {metrics.map((metric) => {
            const winner = getMetricWinner(metric);
            const player1Wins = winner === 'player1';
            const player2Wins = winner === 'player2';
            if (isTable) {
              return (
                <div key={metric.id} className="grid grid-cols-12 gap-2 py-2 items-center border-b border-neutral-800/70 last:border-0">
                  <div className="col-span-6 font-bold tracking-wide text-neutral-200" style={{ fontSize: scaledTemplateFontSize(isWide ? 15 : 17, advancedLayout, 'body', 13, 22) }}>{metric.label}</div>
                  <div className="col-span-3 text-center"><span className="inline-block font-black tracking-tight tabular-nums px-3 py-1 rounded-lg" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(isWide ? 27 : 31, advancedLayout, 'stat', 21, 40), backgroundColor: player1Wins ? `${theme.primaryAccent}20` : 'transparent', color: player1Wins ? theme.primaryAccent : '#94a3b8' }}>{metric.val1}{metric.unit ? <span className="text-[0.45em] ml-1 opacity-80">{metric.unit}</span> : null}</span></div>
                  <div className="col-span-3 text-center"><span className="inline-block font-black tracking-tight tabular-nums px-3 py-1 rounded-lg" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(isWide ? 27 : 31, advancedLayout, 'stat', 21, 40), backgroundColor: player2Wins ? `${player2Accent}30` : 'transparent', color: player2Wins ? player2Accent : '#94a3b8' }}>{metric.val2}{metric.unit ? <span className="text-[0.45em] ml-1 opacity-80">{metric.unit}</span> : null}</span></div>
                </div>
              );
            }
            return (
              <div key={metric.id} className={`grid grid-cols-12 ${isWide ? 'gap-2 py-1.5' : 'gap-4 py-2.5'} items-center border-b border-neutral-800/60 last:border-0`}>
                <div className="col-span-3 text-left"><span className="font-black tracking-tight tabular-nums px-3 py-1 rounded-lg" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(32, advancedLayout, 'stat', 22, 42), backgroundColor: player1Wins ? `${theme.primaryAccent}20` : 'transparent', color: player1Wins ? theme.primaryAccent : '#94a3b8' }}>{metric.val1}{metric.unit ? <span className="text-[0.45em] ml-1 opacity-80">{metric.unit}</span> : null}</span></div>
                <div className="col-span-6 text-center"><div className="font-bold tracking-wide text-neutral-200" style={{ fontSize: scaledTemplateFontSize(20, advancedLayout, 'body', 14, 26) }}>{metric.label}</div></div>
                <div className="col-span-3 text-right"><span className="font-black tracking-tight tabular-nums px-3 py-1 rounded-lg" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(32, advancedLayout, 'stat', 22, 42), backgroundColor: player2Wins ? `${player2Accent}30` : 'transparent', color: player2Wins ? player2Accent : '#94a3b8' }}>{metric.val2}{metric.unit ? <span className="text-[0.45em] ml-1 opacity-80">{metric.unit}</span> : null}</span></div>
              </div>
            );
          })}
        </div>

        {data.verdictText && (
          <div className={`rounded-2xl ${isTable ? 'p-4' : 'p-5'} border backdrop-blur-md flex items-start gap-4 shadow-xl`} style={{ backgroundColor: 'rgba(10, 14, 26, 0.85)', borderColor: `${theme.primaryAccent}30` }}>
            <div className="p-2 rounded-xl border flex-shrink-0" style={{ backgroundColor: `${theme.primaryAccent}15`, borderColor: `${theme.primaryAccent}35`, color: theme.primaryAccent }}><IconScale size={24} /></div>
            <div><div className="text-xs font-black tracking-widest uppercase mb-1" style={{ color: theme.primaryAccent }}>{data.verdictTitle || 'ANALYTICAL VERDICT'}</div><p className="text-white font-medium leading-relaxed" style={{ fontSize: scaledTemplateFontSize(isTable ? 17 : 19, advancedLayout, 'verdict', 14, 26) }}>{data.verdictText}</p></div>
          </div>
        )}
      </div>
      <EditorialFooter credits={credits} theme={theme} visualMode={isTable ? 'data' : 'editorial'} />
    </div>
  );
};
