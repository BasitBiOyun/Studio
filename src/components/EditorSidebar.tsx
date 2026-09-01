import React, { useState } from 'react';
import { Project } from '../types';
import { CANVAS_DIMENSIONS } from '../constants/presets';
import { useOutputLanguage } from '../hooks/useOutputLanguage';
import { EditorSidebarV3 } from './EditorSidebarV3';
import { AssetLibraryModal } from './AssetLibraryModal';
import { EntityDatabaseModal } from './EntityDatabaseModal';
import { BRAND_PRESETS, BrandPresetId, applyBrandPreset } from '../services/brandPresets';
import {
  applyTemplateVariant,
  getActiveTemplateVariantId,
  getTemplateVariants,
  TemplateVariantId,
} from '../services/templateVariants';
import {
  applyAutoLayoutPreset,
  AutoLayoutPresetId,
  getActiveAutoLayoutPresetId,
  getAutoLayoutPresets,
  resetAutoLayout,
} from '../services/autoLayoutPresets';
import { DEFAULT_TEMPLATE_TYPOGRAPHY, TemplateTypographyRole } from '../services/templateTypography';
import { downloadTemplatePack } from '../services/templatePack';

interface EditorSidebarProps {
  project: Project;
  onChange: (updated: Project) => void;
  onOpenDesignGuidelines?: () => void;
  onOpenQualityCheck?: () => void;
  className?: string;
}

if (!(CANVAS_DIMENSIONS as any)['9:16']) {
  (CANVAS_DIMENSIONS as any)['9:16'] = {
    ratio: '9:16', width: 1080, height: 1920, label: '9:16 Vertical',
    desc: '1080 × 1920 (Export up to 4320×7680) • Story, Reels & vertical social',
  };
}

const TYPOGRAPHY_CONTROLS: Array<{ role: TemplateTypographyRole; en: string; tr: string }> = [
  { role: 'headline', en: 'Headline', tr: 'Ana Başlık' },
  { role: 'subtitle', en: 'Subtitle', tr: 'Alt Başlık' },
  { role: 'body', en: 'Body', tr: 'Gövde Metni' },
  { role: 'verdict', en: 'Verdict', tr: 'Değerlendirme' },
  { role: 'stat', en: 'Stat / Value', tr: 'İstatistik / Değer' },
];
const toolSummary = 'cursor-pointer select-none px-3 py-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-between gap-2 min-h-9';
const toolDetails = 'group rounded-lg border bg-neutral-950 overflow-hidden open:col-span-2';
const toolBody = 'border-t p-3 space-y-2 max-h-[30vh] overflow-y-auto';

export const EditorSidebar: React.FC<EditorSidebarProps> = (props) => {
  const { project, onChange } = props;
  const outputLanguage = useOutputLanguage();
  const isTr = outputLanguage === 'tr';
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false);
  const [entityDatabaseOpen, setEntityDatabaseOpen] = useState(false);
  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const currentTypography = (activeTemplate.layout as any)?.typography || DEFAULT_TEMPLATE_TYPOGRAPHY;
  const templateVariants = getTemplateVariants(project.templateType);
  const activeVariantId = getActiveTemplateVariantId(project);
  const autoLayoutPresets = getAutoLayoutPresets(project.templateType);
  const activeAutoLayoutPresetId = getActiveAutoLayoutPresetId(project);

  const applyPreset = (presetId: BrandPresetId) => onChange(applyBrandPreset(project, presetId));
  const applyVariant = (variantId: TemplateVariantId) => onChange(applyTemplateVariant(project, variantId));
  const applyAutoLayout = (presetId: AutoLayoutPresetId) => onChange(applyAutoLayoutPreset(project, presetId));
  const resetAutoLayoutPreset = () => onChange(resetAutoLayout(project));

  const updateTypography = (role: TemplateTypographyRole, value: number) => {
    onChange({
      ...project,
      updatedAt: Date.now(),
      templates: {
        ...project.templates,
        [project.templateType]: {
          ...activeTemplate,
          layout: {
            ...activeTemplate.layout,
            typography: { ...DEFAULT_TEMPLATE_TYPOGRAPHY, ...currentTypography, [role]: value },
          } as any,
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
          layout: { ...activeTemplate.layout, typography: { ...DEFAULT_TEMPLATE_TYPOGRAPHY } } as any,
        },
      },
    });
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <EditorSidebarV3
        {...props}
        className={`${props.className || ''} min-h-0 flex-1 !h-auto`}
      />

      <section
        data-testid="studio-tools-panel"
        className="shrink-0 border-t border-neutral-800 bg-neutral-950/98 p-2"
      >
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">
              {isTr ? 'Studio Araçları' : 'Studio Tools'}
            </div>
            <div className="text-[9px] text-neutral-600">
              {isTr ? 'Ana panelin altında, menüyü kapatmadan' : 'Below the editor, without covering controls'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => downloadTemplatePack(project, project.templateType, false)}
            data-testid="template-data-export"
            className="rounded-lg border border-cyan-900/80 bg-cyan-950/40 px-2.5 py-1.5 text-[10px] font-black text-cyan-300 hover:border-cyan-700 hover:text-cyan-200"
            title={isTr ? 'Aktif şablon verisini JSON olarak dışa aktar' : 'Export active template data as JSON'}
          >
            {isTr ? 'Veri JSON' : 'Data JSON'}
          </button>
        </div>

        <div className="grid max-h-[38vh] grid-cols-2 gap-2 overflow-y-auto pr-0.5 custom-scrollbar">
          <button
            type="button"
            onClick={() => setEntityDatabaseOpen(true)}
            className="min-h-9 rounded-lg border border-sky-900/80 bg-sky-950/40 px-2.5 py-2 text-left text-[10px] font-black uppercase tracking-wide text-sky-300 hover:border-sky-700"
            data-testid="entity-database-open"
          >
            {isTr ? 'Kulüp & Turnuva DB' : 'Club & Competition DB'}
          </button>

          <button
            type="button"
            onClick={() => setAssetLibraryOpen(true)}
            className="min-h-9 rounded-lg border border-emerald-900/80 bg-emerald-950/40 px-2.5 py-2 text-left text-[10px] font-black uppercase tracking-wide text-emerald-300 hover:border-emerald-700"
            data-testid="asset-library-open"
          >
            {isTr ? 'Varlık Kütüphanesi' : 'Asset Library'}
          </button>

          {templateVariants.length > 0 && (
            <details className={`${toolDetails} border-violet-900/80 bg-violet-950/30`} data-testid="template-variants">
              <summary className={`${toolSummary} text-violet-300`} data-testid="template-variants-toggle">
                <span>{isTr ? 'Şablon Varyantları' : 'Template Variants'}</span>
                <span className="text-[9px] text-violet-400/70">{templateVariants.length}</span>
              </summary>
              <div className={`${toolBody} border-violet-900/70`}>
                <div className="text-[10px] leading-relaxed text-neutral-400">
                  {isTr ? 'Aynı içerik ve görseller kullanılır. Yalnızca kompozisyon değişir.' : 'Reuses the same content and visual assets. Only composition changes.'}
                </div>
                {templateVariants.map((variant) => {
                  const active = activeVariantId === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => applyVariant(variant.id)}
                      aria-pressed={active}
                      data-testid={`template-variant-${variant.id}`}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${active ? 'border-violet-400/80 bg-violet-500/15 text-white' : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-violet-800'}`}
                    >
                      <div className="text-[11px] font-black">{isTr ? variant.labelTr : variant.label}</div>
                      <div className="mt-1 text-[9px] leading-snug text-neutral-500">{isTr ? variant.descriptionTr : variant.description}</div>
                    </button>
                  );
                })}
              </div>
            </details>
          )}

          {autoLayoutPresets.length > 0 && (
            <details className={`${toolDetails} border-teal-900/80 bg-teal-950/30`} data-testid="auto-layout-presets">
              <summary className={`${toolSummary} text-teal-300`} data-testid="auto-layout-presets-toggle">
                <span>{isTr ? 'Otomatik Yerleşim' : 'Auto Layout'}</span>
                <span className="text-[9px] text-teal-400/70">{autoLayoutPresets.length}</span>
              </summary>
              <div className={`${toolBody} border-teal-900/70`}>
                <div className="text-[10px] leading-relaxed text-neutral-400">
                  {isTr ? 'Yalnızca aktif şablon için güvenli yerleşimler gösterilir.' : 'Shows only layouts that are safe for the active template.'}
                </div>
                {autoLayoutPresets.map((preset) => {
                  const active = activeAutoLayoutPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyAutoLayout(preset.id)}
                      aria-pressed={active}
                      data-testid={`auto-layout-preset-${preset.id}`}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${active ? 'border-teal-400/80 bg-teal-500/15 text-white' : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-teal-800'}`}
                    >
                      <div className="text-[11px] font-black">{isTr ? preset.labelTr : preset.label}</div>
                      <div className="mt-1 text-[9px] leading-snug text-neutral-500">{isTr ? preset.descriptionTr : preset.description}</div>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={resetAutoLayoutPreset}
                  data-testid="auto-layout-reset"
                  className="w-full rounded-lg border border-teal-900/80 bg-neutral-950 px-3 py-2 text-[10px] font-bold text-neutral-300 hover:border-teal-600 hover:text-teal-300"
                >
                  {isTr ? 'Yerleşimi Varsayılana Döndür' : 'Reset to Safe Default'}
                </button>
              </div>
            </details>
          )}

          <details className={`${toolDetails} border-amber-900/70`} data-testid="brand-presets">
            <summary className={`${toolSummary} text-amber-300`} data-testid="brand-presets-toggle">
              <span>{isTr ? 'Marka Presetleri' : 'Brand Presets'}</span>
              <span className="text-[9px] text-neutral-500">{BRAND_PRESETS.length}</span>
            </summary>
            <div className={`${toolBody} border-neutral-800`}>
              {BRAND_PRESETS.map((preset) => {
                const active = activeTemplate.theme.name === preset.theme.name;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset.id)}
                    data-testid={`brand-preset-${preset.id}`}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${active ? 'border-amber-500/70 bg-amber-500/10 text-white' : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-700'}`}
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

          <details className={`${toolDetails} border-cyan-900/70`} data-testid="typography-sizes">
            <summary className={`${toolSummary} text-cyan-300`}>
              <span>{isTr ? 'Yazı Boyutları' : 'Typography Sizes'}</span>
              <span className="text-[9px] text-neutral-500">75–125%</span>
            </summary>
            <div className={`${toolBody} border-neutral-800`}>
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
      </section>

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
