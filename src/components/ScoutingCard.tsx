import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Project, CanvasDimensions } from '../types';
import { CANVAS_DIMENSIONS } from '../constants/presets';
import { BackgroundPattern } from './design/BackgroundPattern';
import { BackgroundCrestLayer } from './design/BackgroundCrestLayer';
import { PlayerPhotoLayer } from './design/PlayerPhotoLayer';
import { LogosLayer } from './design/LogosLayer';
import { SemanticLogosLayer } from './design/SemanticLogosLayer';
import { useOutputLanguage } from '../hooks/useOutputLanguage';
import { localizeCardElement } from '../services/outputLanguage';
import { attachTransferClubAutocomplete } from '../services/transferClubAutocomplete';
import {
  getTemplateVisualPolicy,
  usableLogoSrc,
  usablePlayerImageSrc,
} from '../services/templateVisualPolicy';
import {
  getActiveTemplateVariantId,
  getTemplateVariantVisualMode,
} from '../services/templateVariants';
import {
  getActiveAutoLayoutPresetId,
  isSubjectHiddenByAutoLayout,
} from '../services/autoLayoutPresets';

import { ScoutingReportView } from './templates/ScoutingReportView';
import { PlayerComparisonView } from './templates/PlayerComparisonView';
import { TransferGraphicView } from './templates/TransferGraphicView';
import { MatchPreviewView } from './templates/MatchPreviewView';
import { MatchAnalysisView } from './templates/MatchAnalysisView';
import { TacticalAnalysisView } from './templates/TacticalAnalysisView';
import { StatHighlightView } from './templates/StatHighlightView';
import { RankingTopListView } from './templates/RankingTopListView';
import { QuoteOpinionView } from './templates/QuoteOpinionView';
import { ThreadCoverView } from './templates/ThreadCoverView';
import { MatchResultView } from './templates/MatchResultView';
import { TeamProfileView } from './templates/TeamProfileView';

interface ScoutingCardProps {
  project: Project;
  interactive?: boolean;
}

type SafeZoneGuide = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  label: string;
};

export const SOCIAL_SAFE_ZONE_GUIDES: Record<string, SafeZoneGuide> = {
  '1:1': { top: 6, right: 6, bottom: 8, left: 6, label: 'X Timeline · 1:1 safe area' },
  '4:5': { top: 7, right: 6, bottom: 10, left: 6, label: 'X Timeline · 4:5 safe area' },
  '16:9': { top: 8, right: 5, bottom: 8, left: 5, label: 'X Timeline · 16:9 safe area' },
  '9:16': { top: 12, right: 7, bottom: 18, left: 7, label: 'X Timeline · 9:16 vertical safe area' },
};

export const ScoutingCard = React.forwardRef<HTMLDivElement, ScoutingCardProps>(
  ({ project, interactive = true }, ref) => {
    const { templateType = 'scouting-report', aspectRatio = '1:1' } = project;
    const [socialSafeZoneVisible, setSocialSafeZoneVisible] = useState(false);
    const activeTemplate = project.templates[templateType] || project.templates['scouting-report'];
    const {
      theme,
      layout: advancedLayout,
      visuals: {
        playerImageSrc,
        secondaryPlayerImageSrc,
        imageTransform,
        secondaryImageTransform,
        logos,
      },
    } = activeTemplate;

    const visualPolicy = getTemplateVisualPolicy(templateType);
    const effectivePrimaryImage = usablePlayerImageSrc(playerImageSrc);
    const effectiveSecondaryImage = usablePlayerImageSrc(secondaryPlayerImageSrc);
    const effectiveLogos = logos.map((logo) => ({
      ...logo,
      src: usableLogoSrc(logo.src),
    }));
    const autoLayoutPreset = getActiveAutoLayoutPresetId(project);
    const baseBackgroundLogo = visualPolicy.backgroundLogoIndex === undefined
      ? null
      : effectiveLogos[visualPolicy.backgroundLogoIndex] || null;
    const backgroundLogo = autoLayoutPreset === 'crest-background'
      ? (effectiveLogos[0] || baseBackgroundLogo)
      : autoLayoutPreset === 'no-subject-full-content' && templateType === 'team-profile'
        ? null
        : baseBackgroundLogo;
    const hideGlobalSubject = isSubjectHiddenByAutoLayout(project);
    const semanticLogoTemplates = new Set([
      'player-comparison',
      'transfer-graphic',
      'match-preview',
      'match-analysis',
      'tactical-analysis',
      'match-result',
      'team-profile',
    ]);
    const semanticLogoIndexes = semanticLogoTemplates.has(templateType)
      ? new Set([0, 1])
      : new Set<number>();
    const foregroundLogos = effectiveLogos.filter((_, index) => (
      index !== visualPolicy.backgroundLogoIndex && !semanticLogoIndexes.has(index)
    ));

    const outputLanguage = useOutputLanguage();
    const localizedContentRef = useRef<HTMLDivElement>(null);
    const cardInstanceId = useId().replace(/:/g, '');
    const templateVariant = getActiveTemplateVariantId(project);
    const variantVisualMode = getTemplateVariantVisualMode(project) || project.visualMode || 'editorial';
    const safeZoneGuide = SOCIAL_SAFE_ZONE_GUIDES[aspectRatio] || SOCIAL_SAFE_ZONE_GUIDES['1:1'];

    useLayoutEffect(() => {
      if (!localizedContentRef.current) return;
      localizeCardElement(localizedContentRef.current, outputLanguage);
    }, [outputLanguage, project]);

    useEffect(() => {
      if (templateType !== 'transfer-graphic') return;
      return attachTransferClubAutocomplete();
    }, [templateType]);

    const dimensions: CanvasDimensions = CANVAS_DIMENSIONS[aspectRatio] || CANVAS_DIMENSIONS['1:1'];
    const directEditingEnabled = interactive && !advancedLayout?.locked;

    const renderTemplateContent = () => {
      switch (templateType) {
        case 'player-comparison':
          return <PlayerComparisonView project={project} />;
        case 'transfer-graphic':
          return <TransferGraphicView project={project} />;
        case 'match-preview':
          return <MatchPreviewView project={project} />;
        case 'match-analysis':
          return <MatchAnalysisView project={project} />;
        case 'tactical-analysis':
          return <TacticalAnalysisView project={project} />;
        case 'stat-highlight':
          return <StatHighlightView project={project} />;
        case 'ranking-top-list':
          return <RankingTopListView project={project} />;
        case 'quote-opinion':
          return <QuoteOpinionView project={project} />;
        case 'thread-cover':
          return <ThreadCoverView project={project} />;
        case 'match-result':
          return <MatchResultView project={project} />;
        case 'team-profile':
          return <TeamProfileView project={project} />;
        case 'scouting-report':
        default:
          return <ScoutingReportView project={project} />;
      }
    };

    return (
      <div
        ref={ref}
        id={interactive ? 'scouting-graphic-root' : undefined}
        data-graphic-root="true"
        data-template-variant={templateVariant || undefined}
        data-auto-layout-preset={autoLayoutPreset}
        lang={outputLanguage === 'tr' ? 'tr-TR' : 'en'}
        className="relative select-none overflow-hidden"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          background: `linear-gradient(${theme.gradientAngle || 135}deg, ${theme.bg1} 0%, ${theme.bg2} 100%)`,
          color: '#f8fafc',
          boxSizing: 'border-box',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <BackgroundPattern
          pattern={theme.pattern}
          primaryAccent={theme.primaryAccent}
          secondaryAccent={theme.secondaryAccent}
          bg1={theme.bg1}
          bg2={theme.bg2}
          gradientAngle={theme.gradientAngle}
          idPrefix={`${project.id}-${cardInstanceId}`}
          visualMode={variantVisualMode}
          watermarkText={project.name || project.sharedData?.player?.name}
          aspectRatio={project.aspectRatio}
          grainEnabled={advancedLayout?.grainEnabled}
          grainOpacity={advancedLayout?.grainOpacity}
        />

        <BackgroundCrestLayer logo={backgroundLogo} />

        {visualPolicy.renderPrimaryAsGlobalLayer && effectivePrimaryImage && !hideGlobalSubject && (
          <PlayerPhotoLayer
            imageSrc={effectivePrimaryImage}
            transform={imageTransform}
            bgBottomColor={theme.bg2}
            accentColor={theme.primaryAccent}
            interactive={directEditingEnabled}
          />
        )}

        {visualPolicy.renderSecondaryAsGlobalLayer && effectiveSecondaryImage && secondaryImageTransform && !hideGlobalSubject && (
          <PlayerPhotoLayer
            imageSrc={effectiveSecondaryImage}
            transform={secondaryImageTransform}
            bgBottomColor={theme.bg2}
            accentColor={theme.secondaryAccent}
            isSecondary
            interactive={directEditingEnabled}
          />
        )}

        <SemanticLogosLayer project={project} logos={effectiveLogos} />
        <LogosLayer logos={foregroundLogos} />

        <div
          key={`card-language-${outputLanguage}`}
          ref={localizedContentRef}
          className="relative z-20 w-full h-full flex flex-col justify-between pointer-events-none"
        >
          {renderTemplateContent()}
        </div>

        {interactive && (
          <button
            type="button"
            data-testid="social-safe-zone-toggle"
            aria-pressed={socialSafeZoneVisible}
            onClick={() => setSocialSafeZoneVisible((visible) => !visible)}
            className="absolute left-5 top-5 z-[95] rounded-xl border border-cyan-300/60 bg-neutral-950/90 px-4 py-2 text-[18px] font-black tracking-wide text-cyan-200 shadow-xl backdrop-blur-md hover:bg-neutral-900"
            title="Toggle X / social safe-zone preview"
          >
            {socialSafeZoneVisible ? 'SAFE ZONE ON' : 'SAFE ZONE'}
          </button>
        )}

        {interactive && socialSafeZoneVisible && (
          <div
            data-testid="social-safe-zone-overlay"
            data-social-safe-zone-overlay="preview-only"
            data-aspect-ratio={aspectRatio}
            className="pointer-events-none absolute inset-0 z-[90]"
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-black/20" />
            <div
              data-testid="social-safe-zone-frame"
              className="absolute border-[3px] border-dashed border-cyan-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.22)]"
              style={{
                top: `${safeZoneGuide.top}%`,
                right: `${safeZoneGuide.right}%`,
                bottom: `${safeZoneGuide.bottom}%`,
                left: `${safeZoneGuide.left}%`,
              }}
            >
              <div className="absolute left-3 top-3 rounded-lg bg-neutral-950/90 px-3 py-1.5 text-[16px] font-black tracking-wide text-cyan-200">
                {safeZoneGuide.label}
              </div>
              <div className="absolute bottom-3 right-3 rounded-lg bg-neutral-950/85 px-3 py-1.5 text-[14px] font-bold text-neutral-200">
                Preview only · never exported
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ScoutingCard.displayName = 'ScoutingCard';