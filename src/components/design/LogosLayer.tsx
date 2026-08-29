import React from 'react';
import { LogoConfig } from '../../types';

interface LogosLayerProps {
  logos: LogoConfig[];
  className?: string;
}

export const LogosLayer: React.FC<LogosLayerProps> = ({ logos, className = '' }) => {
  const visibleLogos = (logos || []).filter((logo) => logo.visible && logo.src);

  if (visibleLogos.length === 0) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none z-30 ${className}`}>
      {visibleLogos.map((logo, index) => {
        const defaultTop = 70;
        const defaultRight = 70 + index * 160;

        const style: React.CSSProperties = {
          position: 'absolute',
          top: `${defaultTop + (logo.y || 0)}px`,
          right: `${defaultRight - (logo.x || 0)}px`,
          width: `${logo.size || 120}px`,
          height: `${logo.size || 120}px`,
          opacity: (logo.opacity ?? 100) / 100,
        };

        return (
          <div
            key={logo.id || index}
            style={style}
            data-moveable-id={`logo-${logo.id || index}`}
            data-x={logo.x || 0}
            data-y={logo.y || 0}
            data-scale={1}
            className="moveable-target flex items-center justify-center pointer-events-auto"
          >
            <img
              src={logo.src}
              alt={logo.name || 'Logo'}
              className="max-w-full max-h-full object-contain filter drop-shadow(0 15px 25px rgba(0,0,0,0.7))"
              crossOrigin={logo.src?.startsWith('http') ? 'anonymous' : undefined}
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.warn('Logo visual failed to load.', logo.src);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
