import React from 'react';
import { ImageTransform } from '../../types';

interface PlayerPhotoLayerProps {
  imageSrc: string;
  transform: ImageTransform;
  bgBottomColor: string;
  accentColor?: string;
  isSecondary?: boolean;
  interactive?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  className?: string;
}

export const PlayerPhotoLayer: React.FC<PlayerPhotoLayerProps> = ({
  imageSrc,
  transform,
  bgBottomColor,
  accentColor = '#00d2ff',
  isSecondary = false,
  interactive = false,
  onPointerDown,
  className = '',
}) => {
  if (!imageSrc) return null;

  const filterStyle = [
    `brightness(${transform.brightness}%)`,
    `contrast(${transform.contrast}%)`,
    `saturate(${transform.saturation}%)`,
    transform.grayscale ? 'grayscale(100%)' : '',
    transform.shadow ? 'drop-shadow(0 30px 50px rgba(0,0,0,0.92)) drop-shadow(0 10px 20px rgba(0,0,0,0.8))' : '',
    transform.edgeGlow ? `drop-shadow(0 0 40px ${accentColor}60)` : '',
  ]
    .filter(Boolean)
    .join(' ');

  const transformStyle: React.CSSProperties = {
    transform: `translate(${transform.x}%, ${transform.y}%) scale(${transform.scale}) ${
      transform.flipHorizontal ? 'scaleX(-1)' : ''
    }`,
    transformOrigin: 'bottom center',
    filter: filterStyle,
    opacity: (transform.opacity ?? 100) / 100,
  };

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-10 flex items-end justify-center overflow-hidden select-none ${className}`}
    >
      <div
        className="absolute w-[600px] h-[800px] rounded-full pointer-events-none blur-[110px] opacity-35"
        style={{
          backgroundColor: accentColor,
          transform: `translate(${transform.x * 0.8}%, ${transform.y * 0.8 - 10}%)`,
          transformOrigin: 'bottom center',
        }}
      />

      <div
        onPointerDown={interactive ? onPointerDown : undefined}
        data-moveable-id={isSecondary ? 'secondary-image' : 'primary-image'}
        data-x={transform.x}
        data-y={transform.y}
        data-scale={transform.scale}
        className={`moveable-target relative w-full h-full flex items-end justify-center ${
          interactive ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : ''
        }`}
        style={transformStyle}
      >
        <img
          src={imageSrc}
          alt={isSecondary ? 'Secondary player visual' : 'Primary player visual'}
          className="max-w-none max-h-full object-contain pointer-events-none select-none"
          crossOrigin={imageSrc.startsWith('http') ? 'anonymous' : undefined}
          referrerPolicy="no-referrer"
          loading="eager"
          onError={(e) => {
            console.warn('Player visual failed to load.', imageSrc);
            e.currentTarget.style.display = 'none';
          }}
        />

        {transform.bottomFade && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[220px] pointer-events-none"
            style={{
              background: `linear-gradient(to top,
                ${bgBottomColor} 0%,
                ${bgBottomColor}E6 25%,
                ${bgBottomColor}80 60%,
                transparent 100%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};
