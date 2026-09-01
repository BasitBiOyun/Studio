import React from 'react';
import { Project } from '../../types';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconArrowRight, IconCheck, IconCash, IconFileCertificate } from '@tabler/icons-react';
import { formatTransferPlayerMeta, transferHeadlineFontSize, transferPlayerLineFontSize, visibleTransferConditions } from '../../services/transfer';
import { usableLogoSrc } from '../../services/templateVisualPolicy';
import { scaledTemplateFontSize } from '../../services/templateTypography';
import { getActiveTemplateVariantId } from '../../services/templateVariants';
import { getActiveAutoLayoutPresetId } from '../../services/autoLayoutPresets';

interface TemplateProps { project: Project; }

export const TransferGraphicView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['transfer-graphic'];
  const { credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent, visuals } = activeTemplate;
  const data = templateContent.transferData || {
    player: project.sharedData?.player, headline: 'HERE WE GO!', badgeText: 'OFFICIAL TRANSFER', transferFee: '€65,000,000', contractLength: '5-YEAR CONTRACT', fromClub: 'OLD CLUB', toClub: 'NEW CLUB', detailsSummary: 'Total agreement reached between clubs.', keyConditions: ['Agreement completed', 'Medical passed'],
  };
  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9' || project.aspectRatio === 'x-landscape';
  const variant = getActiveTemplateVariantId(project) || 'transfer-editorial';
  const isMinimal = variant === 'transfer-minimal';
  const isBreaking = variant === 'transfer-breaking';
  const autoLayout = getActiveAutoLayoutPresetId(project);
  const fullContent = autoLayout === 'no-subject-full-content';
  const playerLeft = autoLayout === 'player-left';
  const playerMeta = formatTransferPlayerMeta(data.player);
  const conditions = visibleTransferConditions(data.keyConditions);
  const hasFee = Boolean(data.transferFee?.trim());
  const hasContract = Boolean(data.contractLength?.trim());
  const hasFinancials = hasFee || hasContract;
  const hasClubFlow = Boolean(data.fromClub?.trim() || data.toClub?.trim());
  const hasDetails = Boolean(data.detailsSummary?.trim() || conditions.length);
  const fromClubLogo = visuals.logos?.[0];
  const toClubLogo = visuals.logos?.[1];
  const fromClubLogoSrc = fromClubLogo?.visible ? usableLogoSrc(fromClubLogo.src) : '';
  const toClubLogoSrc = toClubLogo?.visible ? usableLogoSrc(toClubLogo.src) : '';
  const defaultContentColumnClass = isMinimal ? 'col-span-7' : isBreaking ? 'col-span-9' : 'col-span-8';
  const playerLeftContentColumnClass = isMinimal ? 'col-span-7 col-start-6' : isBreaking ? 'col-span-9 col-start-4' : 'col-span-8 col-start-5';
  const contentColumnClass = fullContent ? 'col-span-12' : playerLeft ? playerLeftContentColumnClass : defaultContentColumnClass;
  const headerWidthClass = fullContent
    ? 'max-w-full'
    : playerLeft
      ? 'ml-auto max-w-[70%] text-right'
      : isBreaking
        ? 'max-w-[78%]'
        : isMinimal
          ? 'max-w-[68%]'
          : '';

  const renderClubIdentity = (side: 'from-club' | 'to-club', label: string, clubName: string, logoSrc: string, logoName?: string, logoOpacity = 100) => {
    const isDestination = side === 'to-club';
    const logoSize = isBreaking ? (isWide ? 'w-[90px] h-[90px]' : 'w-[118px] h-[118px]') : isMinimal ? (isWide ? 'w-[58px] h-[58px]' : 'w-[72px] h-[72px]') : (isWide ? 'w-[82px] h-[82px]' : 'w-[108px] h-[108px]');
    return (
      <div className={`min-w-0 flex-1 flex flex-col ${isDestination ? 'items-end text-right' : 'items-start text-left'}`} data-semantic-logo-slot={side}>
        {logoSrc && <div className={`${logoSize} mb-2 flex items-center justify-center`}><img src={logoSrc} alt={logoName || `${clubName} logo`} className="max-w-full max-h-full object-contain drop-shadow-2xl" style={{ opacity: logoOpacity / 100 }} referrerPolicy="no-referrer" /></div>}
        {!isMinimal && <div className="text-[11px] font-black uppercase tracking-widest text-neutral-400">{label}</div>}
        <div className="font-black uppercase tracking-tight leading-tight break-words max-w-full" style={{ fontFamily: fontDisplay, color: isDestination ? theme.primaryAccent : '#ffffff', fontSize: scaledTemplateFontSize(isMinimal ? (isWide ? 20 : 24) : isWide ? 23 : 28, advancedLayout, 'subtitle', 17, 36) }}>{clubName || '—'}</div>
      </div>
    );
  };

  return (
    <div data-template-variant={variant} data-layout-content={fullContent ? 'full' : playerLeft ? 'right' : 'left'} className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? (isMinimal ? 'p-7' : 'p-8') : (isMinimal ? 'p-11 md:p-12' : 'p-14 md:p-16')} select-none`}>
      <div className={headerWidthClass}>
        <div className={`flex items-center gap-3 ${playerLeft ? 'justify-end' : ''} ${isMinimal ? 'mb-1' : 'mb-2'}`}>
          {data.badgeText && <span className={`${isBreaking ? 'px-5 py-2 text-sm' : isMinimal ? 'px-3 py-1 text-[10px]' : 'px-4 py-1.5 text-xs'} rounded-full font-black tracking-widest uppercase border`} style={{ backgroundColor: isBreaking ? theme.primaryAccent : `${theme.primaryAccent}20`, borderColor: `${theme.primaryAccent}60`, color: isBreaking ? '#05070b' : theme.primaryAccent }}>{data.badgeText}</span>}
          {!isBreaking && <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">{playerMeta}</span>}
        </div>
        <h1 className="font-black uppercase tracking-tight text-white leading-[0.88] drop-shadow-lg" style={{ fontFamily: fontDisplay, color: theme.primaryAccent, fontSize: scaledTemplateFontSize(transferHeadlineFontSize(data.headline, isWide) * (isBreaking ? 1.08 : isMinimal ? 0.76 : 1), advancedLayout, 'headline', 30, 126) }}>{data.headline}</h1>
        <div className="font-black uppercase tracking-tight text-white mt-1" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(transferPlayerLineFontSize(data.player.name, data.toClub, isWide) * (isMinimal ? 0.82 : 1), advancedLayout, 'subtitle', 20, 60) }}>{data.player.name} ➔ {data.toClub}</div>
        {isBreaking && <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-neutral-300">{playerMeta}</div>}
      </div>

      <div className={`flex-1 grid grid-cols-12 ${isWide ? 'gap-5 my-4' : 'gap-8 my-6'} items-center`}>
        <div className={`${contentColumnClass} flex flex-col ${isWide ? 'gap-4' : 'gap-6'} max-w-[1450px]`}>
          {hasClubFlow && (
            <div className={`${isBreaking ? 'rounded-[28px]' : isMinimal ? 'rounded-xl' : 'rounded-2xl'} ${isWide ? (isMinimal ? 'p-3' : 'p-4') : (isMinimal ? 'p-4' : 'p-6')} border backdrop-blur-md flex items-center justify-between shadow-2xl`} style={{ backgroundColor: isBreaking ? `${theme.primaryAccent}14` : isMinimal ? 'rgba(5, 8, 16, 0.68)' : 'rgba(10, 14, 26, 0.9)', borderColor: isBreaking ? `${theme.primaryAccent}75` : `${theme.primaryAccent}40` }}>
              {renderClubIdentity('from-club', 'Departing Club', data.fromClub, fromClubLogoSrc, fromClubLogo?.name, fromClubLogo?.opacity)}
              <div className={`${isMinimal ? 'w-9 h-9 rounded-xl' : isWide ? 'w-12 h-12 rounded-2xl' : 'w-14 h-14 rounded-2xl'} mx-5 flex items-center justify-center border text-white shadow-xl flex-shrink-0`} style={{ backgroundColor: isBreaking ? theme.primaryAccent : `${theme.primaryAccent}25`, borderColor: `${theme.primaryAccent}60`, color: isBreaking ? '#05070b' : theme.primaryAccent }}><IconArrowRight size={isMinimal ? 20 : isWide ? 27 : 32} /></div>
              {renderClubIdentity('to-club', 'New Club', data.toClub, toClubLogoSrc, toClubLogo?.name, toClubLogo?.opacity)}
            </div>
          )}

          {hasFinancials && (
            <div className={`grid ${hasFee && hasContract ? 'grid-cols-2' : 'grid-cols-1'} ${isMinimal ? 'gap-2' : 'gap-4'}`}>
              {hasFee && <div className={`${isMinimal ? 'rounded-xl p-3' : isWide ? 'rounded-2xl p-4' : 'rounded-2xl p-6'} border backdrop-blur-md shadow-xl`} style={{ backgroundColor: isMinimal ? 'rgba(5, 8, 16, 0.62)' : 'rgba(10, 14, 26, 0.85)', borderColor: `${theme.primaryAccent}30` }}><div className="flex items-center gap-2 mb-2 text-neutral-400"><IconCash size={isMinimal ? 14 : isWide ? 16 : 20} style={{ color: theme.primaryAccent }} /><span className="text-[12px] font-black uppercase tracking-widest">Transfer Fee</span></div><div className="font-black uppercase tracking-tight text-white leading-none tabular-nums" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(isMinimal ? (isWide ? 30 : 38) : isWide ? 40 : 52, advancedLayout, 'stat', 26, 66) }}>{data.transferFee}</div></div>}
              {hasContract && <div className={`${isMinimal ? 'rounded-xl p-3' : isWide ? 'rounded-2xl p-4' : 'rounded-2xl p-6'} border backdrop-blur-md shadow-xl`} style={{ backgroundColor: isMinimal ? 'rgba(5, 8, 16, 0.62)' : 'rgba(10, 14, 26, 0.85)', borderColor: 'rgba(255, 255, 255, 0.1)' }}><div className="flex items-center gap-2 mb-2 text-neutral-400"><IconFileCertificate size={isMinimal ? 14 : isWide ? 16 : 20} style={{ color: theme.primaryAccent }} /><span className="text-[12px] font-black uppercase tracking-widest">Contract Terms</span></div><div className="font-black uppercase tracking-tight text-white leading-none" style={{ fontFamily: fontDisplay, fontSize: scaledTemplateFontSize(isMinimal ? (isWide ? 27 : 34) : isWide ? 34 : 42, advancedLayout, 'stat', 24, 54) }}>{data.contractLength}</div></div>}
            </div>
          )}

          {hasDetails && (
            <div className={`${isMinimal ? 'rounded-xl px-4 py-3' : isBreaking ? 'rounded-[24px]' : 'rounded-2xl'} ${!isMinimal && (isWide ? 'p-4' : 'p-6')} border backdrop-blur-md shadow-xl`} style={{ backgroundColor: isMinimal ? 'rgba(5, 8, 16, 0.55)' : 'rgba(10, 14, 26, 0.85)', borderColor: isBreaking ? `${theme.primaryAccent}35` : 'rgba(255, 255, 255, 0.08)' }}>
              {data.detailsSummary && <p className={`text-white font-medium leading-relaxed ${conditions.length ? (isMinimal ? 'mb-2' : 'mb-4') : ''}`} style={{ fontSize: scaledTemplateFontSize(isMinimal ? (isWide ? 13 : 15) : isWide ? 17 : 20, advancedLayout, 'body', 12, 26) }}>{data.detailsSummary}</p>}
              {conditions.length > 0 && <div className={isMinimal || isBreaking ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2.5'}>{conditions.map((condition, idx) => <div key={idx} className={`flex items-center gap-2 text-neutral-200 font-semibold ${isMinimal || isBreaking ? 'rounded-full border border-white/10 bg-black/25 px-2.5 py-1' : ''}`} style={{ fontSize: scaledTemplateFontSize(isMinimal ? 12 : isWide ? 15 : 17, advancedLayout, 'body', 11, 22) }}><div className={`${isMinimal || isBreaking ? 'w-4 h-4' : 'w-5 h-5'} rounded-full flex items-center justify-center text-black flex-shrink-0`} style={{ backgroundColor: theme.primaryAccent }}><IconCheck size={isMinimal ? 11 : 14} strokeWidth={3} /></div><span>{condition}</span></div>)}</div>}
            </div>
          )}
        </div>
        {!fullContent && !playerLeft && <div className={`${isMinimal ? 'col-span-5' : isBreaking ? 'col-span-3' : 'col-span-4'} h-full pointer-events-none`} />}
      </div>
      <EditorialFooter credits={credits} theme={theme} visualMode={isBreaking ? 'poster' : 'editorial'} />
    </div>
  );
};