import React from 'react';
import { LogoConfig } from '../../types';

interface BackgroundCrestLayerProps {
  logo?: LogoConfig | null;
}

export const BackgroundCrestLayer: React.FC<BackgroundCrestLayerProps> = ({ logo }) => {
  if (!logo?.src || logo.visible === false) return null;

  const scale = 0.95 + Math.min(Math.max(logo.size || 120, 30), 300) / 420;
  const opacity = Math.min(0.18, Math.max(0.055, ((logo.opacity ?? 100) / 100) * 0.14));

  return (
    <div className="absolute inset-0 z-[6] overflow-hidden pointer-events-none select-none" aria-hidden="true">
      <img
        src={logo.src}
        alt=""
        className="absolute right-[-4%] top-1/2 w-[58%] h-[78%] object-contain"
        style={{
          transform: `translate(${logo.x / 6}%, calc(-50% + ${logo.y / 6}%)) scale(${scale})`,
          transformOrigin: 'center',
          opacity,
          filter: 'saturate(0.82) contrast(1.04)',
        }}
        crossOrigin={logo.src.startsWith('http') ? 'anonymous' : undefined}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
