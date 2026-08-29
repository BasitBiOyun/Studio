import React from 'react';
import { BgPatternType, VisualMode } from '../../types';

interface BackgroundPatternProps {
  pattern: BgPatternType;
  primaryAccent: string;
  secondaryAccent: string;
  bg1: string;
  bg2: string;
  gradientAngle?: number;
  idPrefix?: string;
  visualMode?: VisualMode;
  watermarkText?: string;
  aspectRatio?: string;
  grainEnabled?: boolean;
  grainOpacity?: number;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  pattern,
  primaryAccent,
  secondaryAccent,
  bg1,
  bg2,
  gradientAngle = 135,
  idPrefix = 'bbo',
  visualMode = 'editorial',
  watermarkText = 'SONKO',
  aspectRatio = '1:1',
  grainEnabled = false,
  grainOpacity = 15,
}) => {
  // Clean watermark token (e.g. single surname or short code)
  const watermarkClean = (watermarkText || 'SONKO')
    .split(' - ')[0]
    .split(' VS ')[0]
    .trim()
    .split(' ')
    .pop()
    ?.toUpperCase() || 'BBO';

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* 1. Deep Atmospheric Gradient Base */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 78% 28%, ${primaryAccent}26 0%, transparent 60%),
                       radial-gradient(circle at 18% 85%, ${secondaryAccent}20 0%, transparent 55%),
                       linear-gradient(${gradientAngle}deg, ${bg1} 0%, ${bg2} 100%)`,
        }}
      />

      {/* 2. Structured Architectural Planes & Diagonal Facets */}
      {visualMode === 'poster' ? (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.09]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
        >
          {/* Dynamic high-energy diagonal energy slashes for poster mode */}
          <polygon points="650,0 820,0 480,1000 310,1000" fill={primaryAccent} />
          <polygon points="780,0 840,0 520,1000 460,1000" fill="#ffffff" opacity="0.4" />
          <polygon points="200,0 350,0 50,1000 -100,1000" fill={secondaryAccent} opacity="0.6" />
          <line x1="860" y1="0" x2="540" y2="1000" stroke={primaryAccent} strokeWidth="2" strokeDasharray="12 8" />
        </svg>
      ) : visualMode === 'data' ? (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
        >
          {/* Analytical coordinate grid & zone segmentation */}
          <line x1="680" y1="0" x2="680" y2="1000" stroke={primaryAccent} strokeWidth="2" strokeDasharray="4 6" />
          <line x1="0" y1="280" x2="1000" y2="280" stroke={primaryAccent} strokeWidth="1.5" strokeDasharray="8 8" />
          <line x1="0" y1="780" x2="1000" y2="780" stroke={primaryAccent} strokeWidth="1.5" strokeDasharray="8 8" />
          <rect x="700" y="60" width="240" height="240" fill="none" stroke={primaryAccent} strokeWidth="1" opacity="0.4" />
          <line x1="700" y1="60" x2="720" y2="60" stroke={primaryAccent} strokeWidth="3" />
          <line x1="700" y1="60" x2="700" y2="80" stroke={primaryAccent} strokeWidth="3" />
        </svg>
      ) : (
        /* Editorial Mode: Balanced angular split & framing band */
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.065]"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1000 1000"
        >
          <polygon points="560,0 950,0 820,1000 430,1000" fill={primaryAccent} />
          <line x1="560" y1="0" x2="430" y2="1000" stroke={primaryAccent} strokeWidth="2.5" />
          <line x1="950" y1="0" x2="820" y2="1000" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="16 10" />
        </svg>
      )}

      {/* 3. Watermark Hero Stencil Typography (Behind Cutout) */}
      <div
        className="absolute right-[-4%] top-[12%] text-right font-black uppercase pointer-events-none select-none tracking-tighter"
        style={{
          fontFamily: "'Barlow Condensed', 'Anton', sans-serif",
          fontSize: aspectRatio === '16:9' ? '280px' : aspectRatio === '4:5' ? '420px' : '360px',
          lineHeight: '0.82',
          color: 'transparent',
          WebkitTextStroke: `2.5px ${primaryAccent}18`,
          opacity: visualMode === 'poster' ? 0.35 : 0.22,
          transform: 'rotate(-4deg)',
          zIndex: 1,
        }}
      >
        {watermarkClean}
      </div>

      {/* 4. Pattern Engine Specific Overlays */}
      {(pattern === 'tactical-lines' || pattern === 'tactical-board') && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id={`tacticalGrid_${idPrefix}`} width="320" height="320" patternUnits="userSpaceOnUse">
              <path
                d="M 320 0 L 0 0 0 320"
                fill="none"
                stroke={primaryAccent}
                strokeWidth="1.5"
                strokeDasharray="6 6"
              />
              <circle cx="160" cy="160" r="70" fill="none" stroke={primaryAccent} strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="0" y1="160" x2="320" y2="160" stroke={primaryAccent} strokeWidth="1" strokeDasharray="2 4" />
              <line x1="160" y1="0" x2="160" y2="320" stroke={primaryAccent} strokeWidth="1" strokeDasharray="2 4" />
              {/* Corner crosshairs */}
              <path d="M 10 0 L 0 0 0 10 M 310 0 L 320 0 320 10 M 0 310 L 0 320 10 320 M 320 310 L 320 320 310 320" stroke="#ffffff" strokeWidth="1.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#tacticalGrid_${idPrefix})`} />
        </svg>
      )}

      {(pattern === 'subtle-grid' || pattern === 'minimal-data' || pattern === 'broadcast-data') && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, ${primaryAccent} 1.5px, transparent 1.5px),
              linear-gradient(to bottom, ${primaryAccent} 1.5px, transparent 1.5px),
              radial-gradient(circle, ${primaryAccent} 1.5px, transparent 1.5px)
            `,
            backgroundSize: '80px 80px, 80px 80px, 20px 20px',
          }}
        />
      )}

      {(pattern === 'radial-glow' || pattern === 'radial-spotlight' || pattern === 'split-tone') && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(circle at 80% 35%, ${primaryAccent}45 0%, transparent 60%),
              radial-gradient(circle at 25% 75%, ${secondaryAccent}35 0%, transparent 55%),
              radial-gradient(circle at 50% 50%, ${primaryAccent}15 0%, transparent 70%)
            `,
          }}
        />
      )}

      {(pattern === 'stadium-spotlight' || pattern === 'matchday-poster' || pattern === 'dark-spotlight') && (
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 82% 18%, ${primaryAccent}40 0%, transparent 65%),
              radial-gradient(ellipse at 30% 90%, ${secondaryAccent}30 0%, transparent 60%),
              linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)
            `,
          }}
        />
      )}

      {(pattern === 'pitch-half' || pattern === 'pitch-grid' || pattern === 'abstract-field-lines') && (
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.075]"
          viewBox="0 0 1200 1200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="40" y="40" width="1120" height="1120" fill="none" stroke={primaryAccent} strokeWidth="3" />
          <line x1="40" y1="600" x2="1160" y2="600" stroke={primaryAccent} strokeWidth="3" strokeDasharray="8 6" />
          <circle cx="600" cy="600" r="180" fill="none" stroke={primaryAccent} strokeWidth="3" />
          <circle cx="600" cy="600" r="8" fill={primaryAccent} />
          <rect x="350" y="40" width="500" height="260" fill="none" stroke={primaryAccent} strokeWidth="3" />
          <rect x="460" y="40" width="280" height="100" fill="none" stroke={primaryAccent} strokeWidth="2.5" />
          <circle cx="600" cy="200" r="6" fill={primaryAccent} />
          <path d="M 490 300 A 140 140 0 0 0 710 300" fill="none" stroke={primaryAccent} strokeWidth="2.5" strokeDasharray="6 4" />
        </svg>
      )}
      
      {(pattern === 'diagonal-speed-lines' || pattern === 'motion-streaks' || pattern === 'dramatic-poster') && (
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${primaryAccent} 10px, ${primaryAccent} 12px)`,
          }}
        />
      )}
      
      {(pattern === 'halftone' || pattern === 'editorial-magazine' || pattern === 'blueprint') && (
        <div
          className="absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage: `radial-gradient(${primaryAccent} 2px, transparent 2px)`,
            backgroundSize: '12px 12px',
          }}
        />
      )}
      
      {(pattern === 'layered-geometric' || pattern === 'angular-shards' || pattern === 'subtle-wave') && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(135deg, ${primaryAccent}25 25%, transparent 25%),
              linear-gradient(225deg, ${primaryAccent}25 25%, transparent 25%),
              linear-gradient(45deg, ${primaryAccent}25 25%, transparent 25%),
              linear-gradient(315deg, ${primaryAccent}25 25%, transparent 25%)
            `,
            backgroundPosition: '20px 0, 20px 0, 0 0, 0 0',
            backgroundSize: '40px 40px',
            backgroundRepeat: 'repeat'
          }}
        />
      )}

      {/* 6. Subtle Micro-Halftone Overlay to prevent banding */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* 7. Optional Photographic Film Grain / Noise Overlay */}
      {grainEnabled && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: grainOpacity / 100,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
};
