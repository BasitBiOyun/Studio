import React from 'react';
import { LogoConfig, Project } from '../../types';
import { usableLogoSrc } from '../../services/templateVisualPolicy';

interface SemanticLogosLayerProps {
  project: Project;
  logos: LogoConfig[];
}

interface SemanticLogoProps {
  logo?: LogoConfig;
  slot: string;
  className: string;
  muted?: boolean;
}

const SemanticLogo: React.FC<SemanticLogoProps> = ({ logo, slot, className, muted = false }) => {
  const src = logo?.visible ? usableLogoSrc(logo.src) : '';
  if (!logo || !src) return null;

  const opacity = muted
    ? Math.min((logo.opacity ?? 100) / 100, 0.22)
    : (logo.opacity ?? 100) / 100;

  return (
    <div
      className={`absolute flex items-center justify-center pointer-events-none ${className}`}
      data-semantic-logo-slot={slot}
      aria-hidden="true"
    >
      <img
        src={src}
        alt=""
        className="max-w-full max-h-full object-contain drop-shadow-xl"
        style={{ opacity }}
        referrerPolicy="no-referrer"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export const SemanticLogosLayer: React.FC<SemanticLogosLayerProps> = ({ project, logos }) => {
  const { templateType, aspectRatio } = project;
  const primary = logos?.[0];
  const secondary = logos?.[1];
  const isWide = aspectRatio === '16:9' || aspectRatio === 'x-landscape';

  if (templateType === 'match-result') {
    return (
      <div className="absolute inset-0 z-30 pointer-events-none">
        <SemanticLogo
          logo={primary}
          slot="home-team"
          className={`${isWide ? 'left-8 top-[82px] w-[72px] h-[72px]' : 'left-12 top-[126px] w-[92px] h-[92px]'}`}
        />
        <SemanticLogo
          logo={secondary}
          slot="away-team"
          className={`${isWide ? 'right-8 top-[82px] w-[72px] h-[72px]' : 'right-12 top-[126px] w-[92px] h-[92px]'}`}
        />
      </div>
    );
  }

  if (templateType === 'tactical-analysis') {
    const hasSecondary = Boolean(secondary?.visible && usableLogoSrc(secondary.src));
    return (
      <div className="absolute inset-0 z-30 pointer-events-none">
        <SemanticLogo
          logo={primary}
          slot="primary-team"
          className={`${isWide ? 'right-8 top-8 w-[68px] h-[68px]' : 'right-14 top-14 w-[84px] h-[84px]'} ${hasSecondary ? (isWide ? 'translate-x-[-78px]' : 'translate-x-[-96px]') : ''}`}
        />
        {hasSecondary && (
          <SemanticLogo
            logo={secondary}
            slot="opponent-team"
            className={`${isWide ? 'right-8 top-8 w-[68px] h-[68px]' : 'right-14 top-14 w-[84px] h-[84px]'}`}
          />
        )}
      </div>
    );
  }

  if (templateType === 'team-profile') {
    return (
      <div className="absolute inset-0 z-30 pointer-events-none">
        <SemanticLogo
          logo={primary}
          slot="club"
          muted
          className={`${isWide ? 'right-8 top-[118px] w-[260px] h-[260px]' : 'right-10 top-[190px] w-[330px] h-[330px]'}`}
        />
        <SemanticLogo
          logo={secondary}
          slot="competition"
          className={`${isWide ? 'right-8 top-8 w-[72px] h-[72px]' : 'right-14 top-14 w-[88px] h-[88px]'}`}
        />
      </div>
    );
  }

  if (templateType === 'player-comparison') {
    return (
      <div className="absolute inset-0 z-30 pointer-events-none">
        <SemanticLogo
          logo={primary}
          slot="player-1-club"
          className={`${isWide ? 'left-8 top-[190px] w-[62px] h-[62px]' : 'left-12 top-[285px] w-[76px] h-[76px]'}`}
        />
        <SemanticLogo
          logo={secondary}
          slot="player-2-club"
          className={`${isWide ? 'right-8 top-[190px] w-[62px] h-[62px]' : 'right-12 top-[285px] w-[76px] h-[76px]'}`}
        />
      </div>
    );
  }

  return null;
};
