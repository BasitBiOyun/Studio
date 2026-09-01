import React, { useEffect, useId, useLayoutEffect, useRef } from 'react';
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

export const ScoutingCard = React.forwardRef<HTMLDivElement, ScoutingCardProps>(
  ({ project, interactive = true }, ref) => {
    const { templateType = 'scouting-report', aspectRatio = '1:1' } = project;
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
    const backgroundLogo = visualPolicy.backgroundLogoIndex === undefined
      ? null
      : effectiveLogos[visualPolicy.backgroundLogoIndex] || null;
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
          visualMode={project.visualMode || 'editorial'}
          watermarkText={project.name || project.sharedData?.player?.name}
          aspectRatio={project.aspectRatio}
          grainEnabled={advancedLayout?.grainEnabled}
          grainOpacity={advancedLayout?.grainOpacity}
        />

        <BackgroundCrestLayer logo={backgroundLogo} />

        {visualPolicy.renderPrimaryAsGlobalLayer && effectivePrimaryImage && (
          <PlayerPhotoLayer
            imageSrc={effectivePrimaryImage}
            transform={imageTransform}
            bgBottomColor={theme.bg2}
            accentColor={theme.primaryAccent}
            interactive={directEditingEnabled}
          />
        )}

        {visualPolicy.renderSecondaryAsGlobalLayer && effectiveSecondaryImage && secondaryImageTransform && (
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
      </div>
    );
  }
);

ScoutingCard.displayName = 'ScoutingCard';
