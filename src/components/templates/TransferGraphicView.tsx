import React from 'react';
import { Project } from '../../types';
import { EditorialHeader } from '../design/EditorialHeader';
import { EditorialFooter } from '../design/EditorialFooter';
import { IconArrowRight, IconCheck, IconCash, IconFileCertificate } from '@tabler/icons-react';

interface TemplateProps {
  project: Project;
}

export const TransferGraphicView: React.FC<TemplateProps> = ({ project }) => {
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { player, credits } = project.sharedData;
  const { theme, layout: advancedLayout, content: templateContent } = activeTemplate;
  const { transferData } = templateContent;
  const visualMode = project.visualMode || 'editorial';
  const data = transferData || {
    player: project.sharedData?.player,
    headline: 'HERE WE GO!',
    badgeText: 'OFFICIAL TRANSFER',
    transferFee: '€65,000,000',
    contractLength: '5-YEAR CONTRACT',
    fromClub: 'OLD CLUB',
    toClub: 'NEW CLUB',
    detailsSummary: 'Total agreement reached between clubs.',
    keyConditions: ['Agreement completed', 'Medical passed'],
  };

  const fontDisplay = advancedLayout?.fontDisplay || "'Barlow Condensed', sans-serif";
  const isWide = project.aspectRatio === '16:9';

  return (
    <div className={`relative z-20 w-full h-full flex flex-col justify-between ${isWide ? 'p-8' : 'p-14 md:p-16'} select-none`}>
      {/* Top Header with Headline */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span
            className="px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border"
            style={{
              backgroundColor: `${theme.primaryAccent}20`,
              borderColor: `${theme.primaryAccent}50`,
              color: theme.primaryAccent,
            }}
          >
            {data.badgeText}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Exclusive Transfer Breakdown
          </span>
        </div>

        <h1
          className="text-[120px] font-black uppercase tracking-tight text-white leading-[0.88] drop-shadow-lg"
          style={{
            fontFamily: fontDisplay,
            color: theme.primaryAccent,
          }}
        >
          {data.headline}
        </h1>

        <div
          className="text-[48px] font-black uppercase tracking-tight text-white mt-1"
          style={{ fontFamily: fontDisplay }}
        >
          {data.player.name} ➔ {data.toClub}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-8 my-6 items-center">
        {/* Left Data Column */}
        <div className="col-span-8 flex flex-col gap-6 max-w-[1300px]">
          {/* Club Transition Flow Banner */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md flex items-center justify-between shadow-2xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.9)',
              borderColor: `${theme.primaryAccent}40`,
            }}
          >
            <div className="text-left">
              <div className="text-[12px] font-black uppercase tracking-widest text-neutral-400">
                Departing Club
              </div>
              <div
                className="text-[40px] font-black uppercase tracking-tight text-white leading-tight"
                style={{ fontFamily: fontDisplay }}
              >
                {data.fromClub}
              </div>
            </div>

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border text-white shadow-xl"
              style={{
                backgroundColor: `${theme.primaryAccent}25`,
                borderColor: `${theme.primaryAccent}60`,
                color: theme.primaryAccent,
              }}
            >
              <IconArrowRight size={32} />
            </div>

            <div className="text-right">
              <div className="text-[12px] font-black uppercase tracking-widest text-neutral-400">
                New Club
              </div>
              <div
                className="text-[40px] font-black uppercase tracking-tight leading-tight"
                style={{
                  fontFamily: fontDisplay,
                  color: theme.primaryAccent,
                }}
              >
                {data.toClub}
              </div>
            </div>
          </div>

          {/* Key Financial Badges Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Transfer Fee Card */}
            <div
              className="rounded-2xl p-6 border backdrop-blur-md shadow-xl"
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: `${theme.primaryAccent}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-2 text-neutral-400">
                <IconCash size={isWide ? 16 : 20} style={{ color: theme.primaryAccent }} />
                <span className="text-[12px] font-black uppercase tracking-widest">
                  Transfer Fee
                </span>
              </div>
              <div
                className="text-[52px] font-black uppercase tracking-tight text-white leading-none tabular-nums"
                style={{ fontFamily: fontDisplay }}
              >
                {data.transferFee}
              </div>
            </div>

            {/* Contract Length Card */}
            <div
              className="rounded-2xl p-6 border backdrop-blur-md shadow-xl"
              style={{
                backgroundColor: 'rgba(10, 14, 26, 0.85)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-2 mb-2 text-neutral-400">
                <IconFileCertificate size={isWide ? 16 : 20} style={{ color: theme.primaryAccent }} />
                <span className="text-[12px] font-black uppercase tracking-widest">
                  Contract Terms
                </span>
              </div>
              <div
                className="text-[42px] font-black uppercase tracking-tight text-white leading-none"
                style={{ fontFamily: fontDisplay }}
              >
                {data.contractLength}
              </div>
            </div>
          </div>

          {/* Transfer Summary & Conditions */}
          <div
            className="rounded-2xl p-6 border backdrop-blur-md shadow-xl"
            style={{
              backgroundColor: 'rgba(10, 14, 26, 0.85)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <p className="text-[20px] text-white font-medium leading-relaxed mb-4">
              {data.detailsSummary}
            </p>

            <div className="flex flex-col gap-2.5">
              {data.keyConditions.map((cond, idx) => (
                <div key={idx} className="flex items-center gap-3 text-[17px] text-neutral-200 font-semibold">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-black flex-shrink-0"
                    style={{ backgroundColor: theme.primaryAccent }}
                  >
                    <IconCheck size={14} strokeWidth={3} />
                  </div>
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Empty for Player Photo */}
        <div className="col-span-4 h-full pointer-events-none" />
      </div>

      {/* Footer */}
      <EditorialFooter credits={credits} theme={theme} />
    </div>
  );
};
