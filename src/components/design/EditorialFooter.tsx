import React from 'react';
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
} from '@tabler/icons-react';
import { Credits, ThemeColors, VisualMode } from '../../types';
import brandLogoUrl from '../../assets/basitbioyunLogoData';

export type FooterSocialKey = 'x' | 'youtube' | 'tiktok' | 'instagram';

export interface FooterSocialItem {
  visible: boolean;
  handle: string;
}

export type FooterSocials = Record<FooterSocialKey, FooterSocialItem>;

export const DEFAULT_FOOTER_SOCIALS: FooterSocials = {
  x: { visible: true, handle: '@BasitBiOyun' },
  youtube: { visible: true, handle: '@BasitBiOyun' },
  tiktok: { visible: true, handle: '@BasitBiOyun' },
  instagram: { visible: true, handle: '@BasitBiOyun' },
};

export function getFooterSocials(credits: Credits): FooterSocials {
  const saved = (credits as Credits & { socials?: Partial<FooterSocials> }).socials || {};
  return (Object.keys(DEFAULT_FOOTER_SOCIALS) as FooterSocialKey[]).reduce((result, key) => {
    result[key] = {
      ...DEFAULT_FOOTER_SOCIALS[key],
      ...(saved[key] || {}),
    };
    return result;
  }, {} as FooterSocials);
}

const SOCIAL_META = {
  x: { label: 'X', Icon: IconBrandX },
  youtube: { label: 'YouTube', Icon: IconBrandYoutube },
  tiktok: { label: 'TikTok', Icon: IconBrandTiktok },
  instagram: { label: 'Instagram', Icon: IconBrandInstagram },
} as const;

interface EditorialFooterProps {
  credits: Credits;
  theme: ThemeColors;
  visualMode?: VisualMode;
  className?: string;
}

export const EditorialFooter: React.FC<EditorialFooterProps> = ({
  credits,
  theme,
  visualMode = 'editorial',
  className = '',
}) => {
  const socials = getFooterSocials(credits);
  const visibleSocials = (Object.keys(socials) as FooterSocialKey[]).filter(
    (key) => socials[key].visible && socials[key].handle.trim(),
  );
  const compact = visibleSocials.length >= 4;

  return (
    <div
      className={`relative z-20 w-full flex items-center justify-between border-t pt-4 select-none ${className}`}
      style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
      data-footer-mode={visualMode}
    >
      <div className={`flex min-w-0 items-center ${compact ? 'gap-3' : 'gap-5'}`}>
        {visibleSocials.map((key) => {
          const item = socials[key];
          const { Icon, label } = SOCIAL_META[key];
          return (
            <div key={key} className="flex items-center gap-1.5 min-w-0 text-neutral-400" title={`${label} ${item.handle}`}>
              <Icon size={compact ? 15 : 16} strokeWidth={2} style={{ color: theme.primaryAccent }} />
              <span className={`${compact ? 'text-[11px]' : 'text-[12px]'} font-bold tracking-wide whitespace-nowrap`}>
                {item.handle}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative h-[20px] w-[78px] flex-shrink-0 ml-4" aria-label="BasitBiOyun">
        <img
          src={brandLogoUrl}
          alt="BasitBiOyun"
          draggable={false}
          className="pointer-events-none absolute right-0 bottom-[-3px] w-[72px] h-[72px] object-cover select-none rounded-[3px]"
        />
      </div>
    </div>
  );
};
