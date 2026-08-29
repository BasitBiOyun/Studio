import React, { useRef, useState, useEffect } from 'react';
import { Project, CanvasDimensions } from '../types';
import { CANVAS_DIMENSIONS } from '../constants/presets';
import { BackgroundPattern } from './design/BackgroundPattern';
import { PlayerPhotoLayer } from './design/PlayerPhotoLayer';
import { LogosLayer } from './design/LogosLayer';

// Template Renderers
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
  onUpdateTransform?: (x: number, y: number) => void;
  interactive?: boolean;
}

export const ScoutingCard = React.forwardRef<HTMLDivElement, ScoutingCardProps>(
  ({ project, onUpdateTransform, interactive = true }, ref) => {
    
    const { templateType = 'scouting-report', aspectRatio = '1:1', visualMode = 'editorial' } = project;
    const activeTemplate = project.templates[templateType] || project.templates['scouting-report'];
    const { theme, layout: advancedLayout, visuals: { playerImageSrc, secondaryPlayerImageSrc, imageTransform, secondaryImageTransform, logos } } = activeTemplate;


    const dimensions: CanvasDimensions = CANVAS_DIMENSIONS[aspectRatio] || CANVAS_DIMENSIONS['1:1'];

    // Canvas Drag Interaction
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive || !onUpdateTransform || advancedLayout?.locked) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        initX: imageTransform.x,
        initY: imageTransform.y,
      };
    };

    useEffect(() => {
      const handlePointerMove = (e: PointerEvent) => {
        if (!isDragging || !dragStartRef.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const scaleFactor = dimensions.width / rect.width;

        const deltaX = (e.clientX - dragStartRef.current.startX) * scaleFactor;
        const deltaY = (e.clientY - dragStartRef.current.startY) * scaleFactor;

        // Map delta to percentage offsets
        const pctX = (deltaX / dimensions.width) * 100;
        const pctY = (deltaY / dimensions.height) * 100;

        onUpdateTransform?.(
          Math.round(dragStartRef.current.initX + pctX),
          Math.round(dragStartRef.current.initY + pctY)
        );
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        dragStartRef.current = null;
      };

      if (isDragging) {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
      }

      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };
    }, [isDragging, dimensions, onUpdateTransform]);

    // Render corresponding template
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
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        id="scouting-graphic-root"
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
        {/* Background Visual Texture */}
        <BackgroundPattern
          pattern={theme.pattern}
          primaryAccent={theme.primaryAccent}
          secondaryAccent={theme.secondaryAccent}
          bg1={theme.bg1}
          bg2={theme.bg2}
          gradientAngle={theme.gradientAngle}
          idPrefix={project.id}
          visualMode={project.visualMode || 'editorial'}
          watermarkText={project.sharedData?.player?.name || project.name}
          aspectRatio={project.aspectRatio}
          grainEnabled={advancedLayout?.grainEnabled}
          grainOpacity={advancedLayout?.grainOpacity}
        />

        {/* Player Cutout Layer (Primary) */}
        {playerImageSrc && (
          <PlayerPhotoLayer
            imageSrc={playerImageSrc}
            transform={imageTransform}
            bgBottomColor={theme.bg2}
            accentColor={theme.primaryAccent}
            interactive={interactive && !advancedLayout?.locked}
            onPointerDown={handlePointerDown}
          />
        )}

        {/* Secondary Player Cutout (e.g., Comparison, Transfer, Matchups) */}
        {secondaryPlayerImageSrc && secondaryImageTransform && (
          <PlayerPhotoLayer
            imageSrc={secondaryPlayerImageSrc}
            transform={secondaryImageTransform}
            bgBottomColor={theme.bg2}
            accentColor={theme.secondaryAccent}
            isSecondary
          />
        )}

        {/* Club & Sponsor Logos Layer */}
        <LogosLayer logos={logos} />

        {/* Dynamic Template Typography and Data Layout */}
        <div className="relative z-20 w-full h-full flex flex-col justify-between">
          {renderTemplateContent()}
        </div>
      </div>
    );
  }
);

ScoutingCard.displayName = 'ScoutingCard';
