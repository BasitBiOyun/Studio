import React from 'react';
import { Project } from '../types';
import { CANVAS_DIMENSIONS } from '../constants/presets';
import { useOutputLanguage } from '../hooks/useOutputLanguage';
import { EditorSidebarV3 } from './EditorSidebarV3';
import {
  DEFAULT_TEMPLATE_TYPOGRAPHY,
  TemplateTypographyRole,
} from '../services/templateTypography';

interface EditorSidebarProps {
  project: Project;
  onChange: (updated: Project) => void;
  onOpenDesignGuidelines?: () => void;
  onOpenQualityCheck?: () => void;
  className?: string;
}

if (!(CANVAS_DIMENSIONS as any)['9:16']) {
  (CANVAS_DIMENSIONS as any)['9:16'] = {
    ratio: '9:16',
    width: 1080,
    height: 1920,
    label: '9:16 Vertical',
    desc: '1080 × 1920 (Export up to 4320×7680) • Story, Reels & vertical social',
  };
}

const TYPOGRAPHY_CONTROLS: Array<{
  role: TemplateTypographyRole;
  en: string;
  tr: string;
}> = [
  { role: 'headline', en: 'Headline', tr: 'Ana Başlık' },
  { role: 'subtitle', en: 'Subtitle', tr: 'Alt Başlık' },
  { role: 'body', en: 'Body', tr: 'Gövde Metni' },
  { role: 'verdict', en: 'Verdict', tr: 'Değerlendirme' },
  { role: 'stat', en: 'Stat / Value', tr: 'İstatistik / Değer' },
];

export const EditorSidebar: React.FC<EditorSidebarProps> = (props) => {
  const { project, onChange } = props;
  const outputLanguage = useOutputLanguage();
  const isTr = outputLanguage === 'tr';
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const currentTypography = (activeTemplate.layout as any)?.typography || DEFAULT_TEMPLATE_TYPOGRAPHY;

  const updateTypography = (role: TemplateTypographyRole, value: number) => {
    const nextLayout = {
      ...activeTemplate.layout,
      typography: {
        ...DEFAULT_TEMPLATE_TYPOGRAPHY,
        ...currentTypography,
        [role]: value,
      },
    } as any;

    onChange({
      ...project,
      updatedAt: Date.now(),
      templates: {
        ...project.templates,
        [project.templateType]: {
          ...activeTemplate,
          layout: nextLayout,
        },
      },
    });
  };

  const resetTypography = () => {
    onChange({
      ...project,
      updatedAt: Date.now(),
      templates: {
        ...project.templates,
        [project.templateType]: {
          ...activeTemplate,
          layout: {
            ...activeTemplate.layout,
            typography: { ...DEFAULT_TEMPLATE_TYPOGRAPHY },
          } as any,
        },
      },
    });
  };

  return (
    <div className="relative h-full w-full">
      <EditorSidebarV3 {...props} />

      <div className="absolute left-3 bottom-3 z-[80] w-[132px] sm:w-[172px] pointer-events-none">
        <details className="group pointer-events-auto rounded-xl border border-neutral-700/90 bg-neutral-950/95 shadow-2xl backdrop-blur-xl overflow-hidden open:w-[calc(100vw-24px)] sm:open:w-[310px] max-w-[310px]">
          <summary className="cursor-pointer select-none px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-cyan-300 flex items-center justify-between gap-2">
            <span>{isTr ? 'Yazı Boyutları' : 'Typography Sizes'}</span>
            <span className="hidden sm:inline text-[9px] font-bold tracking-normal normal-case text-neutral-500">75–125%</span>
          </summary>

          <div className="w-[calc(100vw-24px)] sm:w-[310px] max-w-[310px] border-t border-neutral-800 p-3 space-y-2.5 max-h-[52vh] overflow-y-auto">
            <div className="text-[10px] leading-relaxed text-neutral-500">
              {isTr
                ? 'Her metin rolünü ayrı ölçekler. Şablonun kendi otomatik sığdırma mantığını korur.'
                : 'Scales each text role independently while preserving the template’s automatic fit logic.'}
            </div>

            {TYPOGRAPHY_CONTROLS.map(({ role, en, tr }) => {
              const value = Number(currentTypography?.[role] ?? 1);
              return (
                <div key={role}>
                  <div className="mb-1 flex items-center justify-between text-[10px] text-neutral-400">
                    <span>{isTr ? tr : en}</span>
                    <span className="font-bold text-neutral-300">{Math.round(value * 100)}%</span>
                  </div>
                  <input
                    aria-label={`${en} size`}
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={value}
                    onChange={(event) => updateTypography(role, Number(event.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              );
            })}

            <button
              type="button"
              onClick={resetTypography}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-[10px] font-bold text-neutral-300 hover:border-cyan-800 hover:text-cyan-300"
            >
              {isTr ? 'Yazı Boyutlarını Sıfırla' : 'Reset Typography Sizes'}
            </button>
          </div>
        </details>
      </div>
    </div>
  );
};
