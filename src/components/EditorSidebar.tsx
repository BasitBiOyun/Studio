import React, { useState } from 'react';
import { Project } from '../types';
import { CANVAS_DIMENSIONS } from '../constants/presets';
import { useOutputLanguage } from '../hooks/useOutputLanguage';
import { EditorSidebarV3 } from './EditorSidebarV3';
import { AssetLibraryModal } from './AssetLibraryModal';
import { EntityDatabaseModal } from './EntityDatabaseModal';
import {
  BRAND_PRESETS,
  BrandPresetId,
  applyBrandPreset,
} from '../services/brandPresets';
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
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false);
  const [entityDatabaseOpen, setEntityDatabaseOpen] = useState(false);
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const currentTypography = (activeTemplate.layout as any)?.typography || DEFAULT_TEMPLATE_TYPOGRAPHY;

  const applyPreset = (presetId: BrandPresetId) => {
    onChange(applyBrandPreset(project, presetId));
  };

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

      <div className="absolute left-3 bottom-3 z-[80] w-[142px] sm:w-[182px] pointer-events-none flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setEntityDatabaseOpen(true)}
          className="pointer-events-auto w-full rounded-xl border border-sky-800/80 bg-sky-950/80 px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-sky-300 shadow-2xl backdrop-blur-xl hover:border-sky-600 hover:text-sky-200"
          data-testid="entity-database-open"
        >
          {isTr ? 'Kulüp & Turnuva DB' : 'Club & Competition DB'}
        </button>

        <button
          type="button"
          onClick={() => setAssetLibraryOpen(true)}
          className="pointer-events-auto w-full rounded-xl border border-emerald-800/80 bg-emerald-950/80 px-3 py-2.5 text-left text-[11px] font-black uppercase tracking-wider text-emerald-300 shadow-2xl backdrop-blur-xl hover:border-emerald-600 hover:text-emerald-200"
          data-testid="asset-library-open"
        >
          {isTr ? 'Varlık Kütüphanesi' : 'Asset Library'}
        </button>

        <details className="group pointer-events-auto rounded-xl border border-neutral-700/90 bg-neutral-950/95 shadow-2xl backdrop-blur-xl overflow-hidden open:w-[calc(100vw-24px)] sm:open:w-[330px] max-w-[330px]">
          <summary className="cursor-pointer select-none px-3 py-2.5 text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center justify-between gap-2">
            <span>{isTr ? 'Marka Presetleri' : 'Brand Presets'}</span>
            <span className="hidden sm:inline text-[9px] font-bold tracking-normal normal-case text-neutral-500">5</span>
          </summary>

          <div className="w-[calc(100vw-24px)] sm:w-[330px] max-w-[330px] border-t border-neutral-800 p-3 space-y-2 max-h-[38vh] overflow-y-auto">
            <div className="text-[10px] leading-relaxed text-neutral-500">
              {isTr
                ? 'Yalnızca görsel sistemi değiştirir. İçerik, oyuncu görselleri ve semantic logo slotları korunur.'
                : 'Changes only the visual system. Content, player images and semantic logo slots stay intact.'}
            </div>

            {BRAND_PRESETS.map((preset) => {
              const active = activeTemplate.theme.name === preset.label;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  aria-pressed={active}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? 'border-amber-500/80 bg-amber-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex -space-x-1.5 shrink-0">
                      <span className="h-4 w-4 rounded-full border border-white/25" style={{ backgroundColor: preset.theme.primaryAccent }} />
                      <span className="h-4 w-4 rounded-full border border-white/25" style={{ backgroundColor: preset.theme.secondaryAccent }} />
                    </span>
                    <span className="text-[11px] font-black">{preset.label}</span>
                  </div>
                  <div className="mt-1 text-[9px] leading-snug text-neutral-500">{preset.description}</div>
                </button>
              );
            })}
          </div>
        </details>

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

      <AssetLibraryModal
        open={assetLibraryOpen}
        project={project}
        onChange={onChange}
        onClose={() => setAssetLibraryOpen(false)}
        isTr={isTr}
      />

      <EntityDatabaseModal
        open={entityDatabaseOpen}
        project={project}
        onChange={onChange}
        onClose={() => setEntityDatabaseOpen(false)}
        isTr={isTr}
      />
    </div>
  );
};
