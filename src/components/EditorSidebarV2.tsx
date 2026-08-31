import React, { useMemo, useRef, useState } from 'react';
import {
  IconAdjustments,
  IconBook2,
  IconCheck,
  IconChevronRight,
  IconDatabase,
  IconEye,
  IconEyeOff,
  IconFlipHorizontal,
  IconLayoutGrid,
  IconLock,
  IconLockOpen,
  IconPhoto,
  IconPlus,
  IconSparkles,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import {
  BgPatternType,
  CanvasAspectRatio,
  ComparisonMetric,
  PlayerInfo,
  Project,
  TemplateType,
  ThemeColors,
} from '../types';
import {
  CANVAS_DIMENSIONS,
  TEMPLATE_METADATA,
  THEME_PRESETS,
} from '../constants/presets';
import { COUNTRIES } from '../constants/countries';
import { TemplateForms } from './TemplateForms';
import { ClubLogoSelector } from './ClubLogoSelector';
import { ImageCropModal } from './ImageCropModal';
import {
  applyTemplatePackToProject,
  parseTemplatePack,
  templatePackLabel,
} from '../services/templatePack';
import {
  getTemplateVisualPolicy,
  usablePlayerImageSrc,
} from '../services/templateVisualPolicy';
import { upscaleImage2x } from '../services/clientUpscaler';

interface EditorSidebarProps {
  project: Project;
  onChange: (updated: Project) => void;
  onOpenDesignGuidelines?: () => void;
  onOpenQualityCheck?: () => void;
  className?: string;
}

type MainTab = 'templates' | 'data' | 'visuals' | 'layout' | 'guidelines';
type CropTarget = 'primary' | 'secondary' | number;

const box = 'p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3';
const label = 'text-[11px] text-neutral-400 block mb-1';
const input = 'w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none';
const sectionTitle = 'text-xs font-black uppercase tracking-wider text-cyan-400';

const LOGO_LABELS: Record<TemplateType, string[]> = {
  'scouting-report': ['Player Club Logo', 'Competition / Secondary Logo', 'Optional Extra Logo'],
  'player-comparison': ['Player 1 Club Logo', 'Player 2 Club Logo', 'Optional Competition Logo'],
  'transfer-graphic': ['From Club Logo', 'To Club Logo', 'Optional Competition Logo'],
  'match-preview': ['Team 1 Logo', 'Team 2 Logo', 'Competition Logo'],
  'match-analysis': ['Team 1 Logo', 'Team 2 Logo', 'Competition Logo'],
  'tactical-analysis': ['Team / Club Logo', 'Opponent / Secondary Logo', 'Competition Logo'],
  'stat-highlight': ['Player / Club Logo', 'Competition Logo', 'Optional Extra Logo'],
  'ranking-top-list': ['Competition Logo', 'Highlighted Club Logo', 'Optional Extra Logo'],
  'quote-opinion': ['Author Club Logo', 'Source / Competition Logo', 'Optional Extra Logo'],
  'thread-cover': ['Topic / Club Logo', 'Competition Logo', 'Optional Extra Logo'],
  'match-result': ['Team 1 Logo', 'Team 2 Logo', 'Competition Logo'],
  'team-profile': ['Team Logo / Background Crest', 'League Logo', 'Optional Extra Logo'],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function patchPlayer(player: PlayerInfo, field: keyof PlayerInfo, value: string): PlayerInfo {
  if (field !== 'nationality') return { ...player, [field]: value };
  const matched = COUNTRIES.find((country) => country.name.toLowerCase() === value.toLowerCase());
  return {
    ...player,
    nationality: value,
    ...(matched ? { countryFlag: matched.flag } : {}),
  };
}

const Field: React.FC<{
  title: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}> = ({ title, value, onChange, type = 'text', className = '' }) => (
  <div className={className}>
    <label className={label}>{title}</label>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={input} />
  </div>
);

const TextAreaField: React.FC<{
  title: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}> = ({ title, value, onChange, rows = 3 }) => (
  <div>
    <label className={label}>{title}</label>
    <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className={`${input} resize-y`} />
  </div>
);

export const EditorSidebarV2: React.FC<EditorSidebarProps> = ({
  project,
  onChange,
  onOpenDesignGuidelines,
  onOpenQualityCheck,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('data');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('All');
  const [cropState, setCropState] = useState<{ src: string; type: CropTarget } | null>(null);
  const [upscaling, setUpscaling] = useState<'primary' | 'secondary' | null>(null);
  const templateJsonInputRef = useRef<HTMLInputElement>(null);

  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { content, visuals, layout, theme } = activeTemplate;
  const { player, credits } = project.sharedData;
  const policy = getTemplateVisualPolicy(project.templateType);
  const packLabel = templatePackLabel(project.templateType);
  const primaryImage = usablePlayerImageSrc(visuals.playerImageSrc);
  const secondaryImage = usablePlayerImageSrc(visuals.secondaryPlayerImageSrc);
  const logoLabels = LOGO_LABELS[project.templateType];

  const filteredTemplates = useMemo(
    () => TEMPLATE_METADATA.filter((item) => templateCategoryFilter === 'All' || item.category === templateCategoryFilter),
    [templateCategoryFilter],
  );

  const updateTemplate = (updates: Partial<typeof activeTemplate>) => {
    onChange({
      ...project,
      updatedAt: Date.now(),
      templates: {
        ...project.templates,
        [project.templateType]: { ...activeTemplate, ...updates },
      },
    });
  };

  const updateContent = (updates: Record<string, any>) => updateTemplate({ content: { ...content, ...updates } });
  const updateVisuals = (updates: Record<string, any>) => updateTemplate({ visuals: { ...visuals, ...updates } });
  const updateTheme = (nextTheme: ThemeColors) => updateTemplate({ theme: nextTheme });
  const updateLayout = (updates: Record<string, any>) => updateTemplate({ layout: { ...layout, ...updates } });

  const updateSharedPlayer = (nextPlayer: PlayerInfo) => onChange({
    ...project,
    updatedAt: Date.now(),
    sharedData: { ...project.sharedData, player: nextPlayer },
  });

  const handleTemplateJsonImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = parseTemplatePack(await file.text(), project.templateType);
      if (result.error || !result.data) {
        window.alert(result.error || 'Template JSON could not be imported.');
        return;
      }
      onChange(applyTemplatePackToProject(project, project.templateType, result.data));
      if (result.warnings.length > 0) window.alert(`JSON imported. Notes: ${result.warnings.join(', ')}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not import JSON.');
    } finally {
      if (templateJsonInputRef.current) templateJsonInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'primary' | 'secondary') => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { default: imageCompression } = await import('browser-image-compression');
      const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 2400, useWebWorker: true });
      const reader = new FileReader();
      reader.onload = (loadEvent) => setCropState({ src: String(loadEvent.target?.result || ''), type });
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error(error);
      window.alert('Image processing failed.');
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const { default: imageCompression } = await import('browser-image-compression');
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1000, useWebWorker: true });
      const reader = new FileReader();
      reader.onload = (loadEvent) => setCropState({ src: String(loadEvent.target?.result || ''), type: index });
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error(error);
      window.alert('Logo processing failed.');
    }
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    if (!cropState) return;
    if (cropState.type === 'primary') updateVisuals({ playerImageSrc: croppedDataUrl });
    else if (cropState.type === 'secondary') updateVisuals({ secondaryPlayerImageSrc: croppedDataUrl });
    else {
      const logos = clone(visuals.logos);
      if (logos[cropState.type]) {
        logos[cropState.type].src = croppedDataUrl;
        logos[cropState.type].visible = true;
        updateVisuals({ logos });
      }
    }
    setCropState(null);
  };

  const updateLogo = (index: number, field: string, value: any) => {
    const logos = clone(visuals.logos);
    if (!logos[index]) return;
    logos[index] = { ...logos[index], [field]: value };
    updateVisuals({ logos });
  };

  const runUpscale = async (target: 'primary' | 'secondary') => {
    const src = target === 'primary' ? primaryImage : secondaryImage;
    if (!src || upscaling) return;
    try {
      setUpscaling(target);
      const result = await upscaleImage2x(src);
      updateVisuals(target === 'primary' ? { playerImageSrc: result } : { secondaryPlayerImageSrc: result });
    } catch (error) {
      console.error(error);
      window.alert('Free AI upscale could not complete on this device/browser.');
    } finally {
      setUpscaling(null);
    }
  };

  const renderImageEditor = (target: 'primary' | 'secondary') => {
    const isSecondary = target === 'secondary';
    const allowed = isSecondary ? policy.allowSecondaryImage : policy.allowPrimaryImage;
    if (!allowed) return null;
    const src = isSecondary ? secondaryImage : primaryImage;
    const transform = isSecondary ? (visuals.secondaryImageTransform || visuals.imageTransform) : visuals.imageTransform;
    const imageLabel = isSecondary ? policy.secondaryImageLabel : policy.primaryImageLabel;
    const patchTransform = (field: string, value: any) => updateVisuals(
      isSecondary
        ? { secondaryImageTransform: { ...transform, [field]: value } }
        : { imageTransform: { ...transform, [field]: value } },
    );

    return (
      <div className={box}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className={sectionTitle}>{imageLabel || (isSecondary ? 'Secondary Image' : 'Image')}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Optional unless the template specifically needs a subject image.</div>
          </div>
          <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5">
            <IconUpload size={14} /> Upload
            <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event, target)} className="hidden" />
          </label>
        </div>

        {src ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => void runUpscale(target)} disabled={Boolean(upscaling)} className="py-2 rounded-lg border border-fuchsia-800/60 bg-fuchsia-950/30 text-fuchsia-300 text-xs font-bold disabled:opacity-50">
                <IconSparkles size={14} className="inline mr-1" /> {upscaling === target ? 'Upscaling…' : 'Free AI 2×'}
              </button>
              <button onClick={() => updateVisuals(isSecondary ? { secondaryPlayerImageSrc: '' } : { playerImageSrc: '' })} className="py-2 rounded-lg border border-red-900/60 bg-red-950/20 text-red-300 text-xs font-bold">
                <IconTrash size={14} className="inline mr-1" /> Remove
              </button>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1"><span>Scale</span><span>{Math.round(transform.scale * 100)}%</span></div>
              <input type="range" min="0.35" max="3.5" step="0.05" value={transform.scale} onChange={(event) => patchTransform('scale', Number(event.target.value))} className="w-full accent-cyan-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="flex justify-between text-[10px] text-neutral-400"><span>X</span><span>{transform.x}%</span></div><input type="range" min="-150" max="150" value={transform.x} onChange={(event) => patchTransform('x', Number(event.target.value))} className="w-full accent-cyan-400" /></div>
              <div><div className="flex justify-between text-[10px] text-neutral-400"><span>Y</span><span>{transform.y}%</span></div><input type="range" min="-150" max="150" value={transform.y} onChange={(event) => patchTransform('y', Number(event.target.value))} className="w-full accent-cyan-400" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => patchTransform('flipHorizontal', !transform.flipHorizontal)} className={`py-2 rounded-lg border text-xs font-semibold ${transform.flipHorizontal ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-black/40 border-neutral-800 text-neutral-400'}`}><IconFlipHorizontal size={14} className="inline mr-1" /> Flip</button>
              <button onClick={() => patchTransform('bottomFade', !transform.bottomFade)} className={`py-2 rounded-lg border text-xs font-semibold ${transform.bottomFade ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-black/40 border-neutral-800 text-neutral-400'}`}>Bottom Fade</button>
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-neutral-700 bg-black/20 px-3 py-4 text-center text-[11px] text-neutral-500">No image selected. The template remains clean without a fallback photo.</div>
        )}
      </div>
    );
  };

  const renderScoutingData = () => {
    const profile = content.profile;
    const stats = content.stats || [];
    return (
      <div className="space-y-4">
        <div className={box}>
          <div className={sectionTitle}>Player Identity</div>
          <Field title="Full Name" value={player.name} onChange={(value) => updateSharedPlayer(patchPlayer(player, 'name', value))} />
          <div className="grid grid-cols-2 gap-2">
            <Field title="Position(s)" value={player.positions} onChange={(value) => updateSharedPlayer(patchPlayer(player, 'positions', value))} />
            <Field title="Club" value={player.club} onChange={(value) => updateSharedPlayer(patchPlayer(player, 'club', value))} />
            <Field title="Nationality" value={player.nationality} onChange={(value) => updateSharedPlayer(patchPlayer(player, 'nationality', value))} />
            <Field title="Flag" value={player.countryFlag || ''} onChange={(value) => updateSharedPlayer({ ...player, countryFlag: value })} />
            <Field title="Age" value={player.age} onChange={(value) => updateSharedPlayer(patchPlayer(player, 'age', value))} />
            <Field title="Preferred Foot" value={player.preferredFoot} onChange={(value) => updateSharedPlayer(patchPlayer(player, 'preferredFoot', value))} />
            <Field title="Height" value={player.height} onChange={(value) => updateSharedPlayer(patchPlayer(player, 'height', value))} />
          </div>
        </div>
        <div className={box}>
          <div className={sectionTitle}>Scouting Text</div>
          <TextAreaField title="Executive Summary" value={profile.summary} onChange={(value) => updateContent({ profile: { ...profile, summary: value } })} />
          <TextAreaField title="Role & Tactical Profile" value={profile.tacticalProfile} onChange={(value) => updateContent({ profile: { ...profile, tacticalProfile: value } })} />
        </div>
        <div className={box}>
          <div className={sectionTitle}>Performance Metrics</div>
          {stats.slice(0, 6).map((stat, index) => (
            <div key={stat.id || index} className="grid grid-cols-[1fr_1.5fr] gap-2">
              <Field title="Value" value={stat.value} onChange={(value) => { const next = clone(stats); next[index].value = value; updateContent({ stats: next }); }} />
              <Field title="Metric" value={stat.label} onChange={(value) => { const next = clone(stats); next[index].label = value; updateContent({ stats: next }); }} />
            </div>
          ))}
        </div>
        {(['strengths', 'development'] as const).map((key) => {
          const items = content[key] || [];
          return (
            <div className={box} key={key}>
              <div className={sectionTitle}>{key === 'strengths' ? 'Key Strengths' : 'Development Areas'}</div>
              {items.map((item, index) => (
                <div key={`${key}-${index}`} className="flex gap-2">
                  <input value={item} onChange={(event) => { const next = [...items]; next[index] = event.target.value; updateContent({ [key]: next }); }} className={input} />
                  <button onClick={() => updateContent({ [key]: items.filter((_, itemIndex) => itemIndex !== index) })} className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400"><IconTrash size={14} /></button>
                </div>
              ))}
              <button onClick={() => updateContent({ [key]: [...items, ''] })} className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300"><IconPlus size={14} className="inline mr-1" /> Add</button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderComparisonData = () => {
    const data = content.comparisonData;
    if (!data) return null;
    const updateData = (patch: Record<string, any>) => updateContent({ comparisonData: { ...data, ...patch } });
    const playerEditor = (key: 'player1' | 'player2', title: string) => {
      const current = data[key];
      return (
        <div className={box}>
          <div className={sectionTitle}>{title}</div>
          <Field title="Name" value={current.name} onChange={(value) => updateData({ [key]: { ...current, name: value } })} />
          <div className="grid grid-cols-2 gap-2">
            <Field title="Club" value={current.club} onChange={(value) => updateData({ [key]: { ...current, club: value } })} />
            <Field title="Position" value={current.positions} onChange={(value) => updateData({ [key]: { ...current, positions: value } })} />
            <Field title="Age" value={current.age} onChange={(value) => updateData({ [key]: { ...current, age: value } })} />
            <Field title="Nationality" value={current.nationality} onChange={(value) => updateData({ [key]: patchPlayer(current, 'nationality', value) })} />
          </div>
        </div>
      );
    };
    return (
      <div className="space-y-4">
        {playerEditor('player1', 'Player 1')}
        {playerEditor('player2', 'Player 2')}
        <div className={box}>
          <div className={sectionTitle}>Comparison Context</div>
          <Field title="Subtitle" value={data.subtitle} onChange={(value) => updateData({ subtitle: value })} />
          {data.metrics.map((metric: ComparisonMetric, index: number) => (
            <div key={metric.id || index} className="grid grid-cols-[1.5fr_.7fr_.7fr_auto] gap-2 items-end">
              <Field title="Metric" value={metric.label} onChange={(value) => { const metrics = clone(data.metrics); metrics[index].label = value; updateData({ metrics }); }} />
              <Field title="P1" value={metric.val1} onChange={(value) => { const metrics = clone(data.metrics); metrics[index].val1 = value; updateData({ metrics }); }} />
              <Field title="P2" value={metric.val2} onChange={(value) => { const metrics = clone(data.metrics); metrics[index].val2 = value; updateData({ metrics }); }} />
              <button onClick={() => updateData({ metrics: data.metrics.filter((_: any, metricIndex: number) => metricIndex !== index) })} className="mb-0.5 p-2.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400"><IconTrash size={14} /></button>
            </div>
          ))}
          <button onClick={() => updateData({ metrics: [...data.metrics, { id: `metric-${Date.now()}`, label: '', val1: '', val2: '', higherIsBetter: true }] })} className="w-full py-2 rounded-lg bg-neutral-800 text-xs font-bold"><IconPlus size={14} className="inline mr-1" /> Add Metric</button>
          <Field title="Verdict Title" value={data.verdictTitle} onChange={(value) => updateData({ verdictTitle: value })} />
          <TextAreaField title="Verdict" value={data.verdictText} onChange={(value) => updateData({ verdictText: value })} />
        </div>
      </div>
    );
  };

  const renderTransferData = () => {
    const data = content.transferData;
    if (!data) return null;
    const updateData = (patch: Record<string, any>) => updateContent({ transferData: { ...data, ...patch } });
    return (
      <div className="space-y-4">
        <div className={box}>
          <div className={sectionTitle}>Transfer Identity</div>
          <Field title="Player" value={data.player.name} onChange={(value) => updateData({ player: { ...data.player, name: value } })} />
          <div className="grid grid-cols-2 gap-2">
            <Field title="From Club" value={data.fromClub} onChange={(value) => updateData({ fromClub: value })} />
            <Field title="To Club" value={data.toClub} onChange={(value) => updateData({ toClub: value })} />
            <Field title="Transfer Fee" value={data.transferFee} onChange={(value) => updateData({ transferFee: value })} />
            <Field title="Contract" value={data.contractLength} onChange={(value) => updateData({ contractLength: value })} />
          </div>
          <Field title="Headline" value={data.headline} onChange={(value) => updateData({ headline: value })} />
          <Field title="Badge" value={data.badgeText} onChange={(value) => updateData({ badgeText: value })} />
          <TextAreaField title="Summary" value={data.detailsSummary} onChange={(value) => updateData({ detailsSummary: value })} />
        </div>
        <div className={box}>
          <div className={sectionTitle}>Transfer Conditions</div>
          {data.keyConditions.map((condition: string, index: number) => (
            <div key={index} className="flex gap-2">
              <input value={condition} onChange={(event) => { const next = [...data.keyConditions]; next[index] = event.target.value; updateData({ keyConditions: next }); }} className={input} />
              <button onClick={() => updateData({ keyConditions: data.keyConditions.filter((_: string, itemIndex: number) => itemIndex !== index) })} className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-red-400"><IconTrash size={14} /></button>
            </div>
          ))}
          <button onClick={() => updateData({ keyConditions: [...data.keyConditions, ''] })} className="w-full py-2 rounded-lg bg-neutral-800 text-xs font-bold"><IconPlus size={14} className="inline mr-1" /> Add Condition</button>
        </div>
      </div>
    );
  };

  return (
    <aside className={`w-full md:w-[420px] lg:w-[460px] bg-neutral-950/95 border-r border-neutral-800/90 flex flex-col h-full select-none ${className}`}>
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 p-2 gap-1 overflow-x-auto no-scrollbar">
        {([
          ['templates', IconLayoutGrid, 'Templates'],
          ['data', IconDatabase, 'Data & Text'],
          ['visuals', IconPhoto, 'Visuals'],
          ['layout', IconAdjustments, 'Layout'],
          ['guidelines', IconBook2, 'Guide'],
        ] as const).map(([tab, Icon, text]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${activeTab === tab ? 'bg-neutral-800 text-cyan-400' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'}`}>
            <Icon size={16} /><span>{text}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm text-neutral-200 custom-scrollbar">
        {activeTab === 'templates' && (
          <div className="space-y-5">
            <div className={box}>
              <div className={sectionTitle}>Visual Presentation Mode</div>
              <div className="grid grid-cols-3 gap-2">
                {['editorial', 'data', 'poster'].map((mode) => <button key={mode} onClick={() => onChange({ ...project, visualMode: mode as any })} className={`py-2 rounded-lg border text-xs font-bold capitalize ${(project.visualMode || 'editorial') === mode ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-neutral-800 bg-black/30 text-neutral-400'}`}>{mode}</button>)}
              </div>
            </div>
            <div className={box}>
              <div className={sectionTitle}>Aspect Ratio</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CANVAS_DIMENSIONS).map((dim) => <button key={dim.ratio} onClick={() => onChange({ ...project, aspectRatio: dim.ratio as CanvasAspectRatio })} className={`p-2 rounded-lg border text-left ${project.aspectRatio === dim.ratio ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'border-neutral-800 bg-black/30 text-neutral-400'}`}><div className="text-xs font-black">{dim.label}</div><div className="text-[10px]">{dim.width}×{dim.height}</div></button>)}
              </div>
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['All', 'Scouting & Player', 'Matchday & Team', 'Editorial & News'].map((category) => <button key={category} onClick={() => setTemplateCategoryFilter(category)} className={`px-3 py-1.5 rounded-lg text-[11px] whitespace-nowrap ${templateCategoryFilter === category ? 'bg-cyan-500 text-black font-bold' : 'bg-neutral-900 border border-neutral-800 text-neutral-400'}`}>{category}</button>)}
            </div>
            <div className="space-y-2">
              {filteredTemplates.map((item) => <button key={item.type} onClick={() => onChange({ ...project, templateType: item.type })} className={`w-full p-3 rounded-xl border text-left flex items-center justify-between ${project.templateType === item.type ? 'bg-cyan-950/40 border-cyan-500/80' : 'bg-neutral-900/60 border-neutral-800'}`}><div><div className="text-xs font-black uppercase">{item.label}</div><div className="text-[10px] text-neutral-500 mt-1">{item.description}</div></div>{project.templateType === item.type ? <IconCheck size={17} className="text-cyan-400" /> : <IconChevronRight size={17} className="text-neutral-600" />}</button>)}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-5">
            <div className={box}>
              <div className={sectionTitle}>Data Sources · {packLabel}</div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">This importer follows the active template. It updates only that template's data and preserves its visual settings.</p>
              <input ref={templateJsonInputRef} type="file" accept=".json,application/json" onChange={handleTemplateJsonImport} className="hidden" />
              <button onClick={() => templateJsonInputRef.current?.click()} className="w-full py-2.5 px-3 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/50 rounded-lg text-xs font-bold"><IconUpload size={14} className="inline mr-1.5" /> Import {packLabel} JSON</button>
            </div>
            {project.templateType === 'scouting-report' ? renderScoutingData() : project.templateType === 'player-comparison' ? renderComparisonData() : project.templateType === 'transfer-graphic' ? renderTransferData() : <TemplateForms project={project} onChange={onChange} />}
          </div>
        )}

        {activeTab === 'visuals' && (
          <div className="space-y-5">
            <div className="rounded-xl bg-cyan-950/20 border border-cyan-900/50 p-3">
              <div className="text-xs font-black text-cyan-300 uppercase">{TEMPLATE_METADATA.find((item) => item.type === project.templateType)?.label} Visuals</div>
              <div className="text-[10px] text-neutral-400 mt-1">Only visual controls relevant to this template are shown below.</div>
            </div>
            {renderImageEditor('primary')}
            {renderImageEditor('secondary')}
            {!policy.allowPrimaryImage && !policy.allowSecondaryImage && <div className={box}><div className={sectionTitle}>Subject Images</div><div className="text-[11px] text-neutral-400">This template does not use a player cutout. Use the logo controls below instead.</div></div>}

            <div className={box}>
              <div className={sectionTitle}>Template Logos</div>
              {visuals.logos.map((logo, index) => (
                <div key={logo.id || index} className="rounded-lg bg-black/35 border border-neutral-800 p-3 space-y-2">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold text-white">{logoLabels[index] || logo.name}</span><button onClick={() => updateLogo(index, 'visible', !logo.visible)} className="p-1.5 rounded bg-neutral-800 text-neutral-400">{logo.visible ? <IconEye size={15} /> : <IconEyeOff size={15} />}</button></div>
                  <ClubLogoSelector label={logoLabels[index] || logo.name} currentLogoUrl={logo.src} onSelect={(dataUrl) => { updateLogo(index, 'src', dataUrl); updateLogo(index, 'visible', true); }} onRemove={() => updateLogo(index, 'src', '')} onManualUpload={(event) => handleLogoUpload(event, index)} />
                  {logo.visible && <><div><div className="flex justify-between text-[10px] text-neutral-400"><span>Size</span><span>{logo.size}px</span></div><input type="range" min="30" max={project.templateType === 'team-profile' && index === 0 ? '420' : '300'} value={logo.size} onChange={(event) => updateLogo(index, 'size', Number(event.target.value))} className="w-full accent-cyan-400" /></div><div><div className="flex justify-between text-[10px] text-neutral-400"><span>Opacity</span><span>{logo.opacity}%</span></div><input type="range" min="5" max="100" value={logo.opacity} onChange={(event) => updateLogo(index, 'opacity', Number(event.target.value))} className="w-full accent-cyan-400" /></div></>}
                </div>
              ))}
            </div>

            <div className={box}>
              <div className={sectionTitle}>Editorial Theme</div>
              <div className="grid grid-cols-2 gap-2">{THEME_PRESETS.map((preset) => <button key={preset.name} onClick={() => updateTheme(preset)} className="p-2 rounded-lg border border-neutral-800 bg-black/30 text-left text-xs font-bold">{preset.name}</button>)}</div>
            </div>
            <div className={box}>
              <div className={sectionTitle}>Background Pattern</div>
              <div className="grid grid-cols-3 gap-2">{(['tactical-lines','subtle-grid','radial-glow','stadium-spotlight','pitch-half','clean-minimal','minimal-data','dark-spotlight','none'] as BgPatternType[]).map((pattern) => <button key={pattern} onClick={() => updateTheme({ ...theme, pattern })} className={`p-2 rounded-lg border text-[10px] capitalize ${theme.pattern === pattern ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-black/30 border-neutral-800 text-neutral-400'}`}>{pattern.replace(/-/g, ' ')}</button>)}</div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-5">
            <div className={`${box} flex items-center justify-between`}><div><div className="text-xs font-black uppercase text-white flex items-center gap-2">{layout.locked ? <IconLock size={16} className="text-amber-400" /> : <IconLockOpen size={16} className="text-cyan-400" />} Template Layout Lock</div><div className="text-[10px] text-neutral-500 mt-1">Unlock only when you need direct canvas movement.</div></div><button onClick={() => updateLayout({ locked: !layout.locked })} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${layout.locked ? 'bg-amber-500 text-black' : 'bg-neutral-800'}`}>{layout.locked ? 'Locked' : 'Unlocked'}</button></div>
            <div className={box}><div className={sectionTitle}>Display Font</div><div className="grid grid-cols-2 gap-2">{[["'Barlow Condensed', sans-serif",'Barlow Condensed'],["'Anton', sans-serif",'Anton'],["'Montserrat', sans-serif",'Montserrat'],["'Space Grotesk', sans-serif",'Space Grotesk']].map(([value, name]) => <button key={value} onClick={() => updateLayout({ fontDisplay: value })} className={`p-2 rounded-lg border text-xs font-bold ${layout.fontDisplay === value ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-black/30 border-neutral-800 text-neutral-400'}`}>{name}</button>)}</div></div>
            <div className={box}><div className={sectionTitle}>Attribution</div><Field title="Prepared For" value={credits.preparedFor} onChange={(value) => onChange({ ...project, sharedData: { ...project.sharedData, credits: { ...credits, preparedFor: value } } })} /><div className="text-[10px] text-neutral-500">The BasitBiOyun logo is fixed in the footer. No extra Visual by text is rendered.</div></div>
          </div>
        )}

        {activeTab === 'guidelines' && (
          <div className="space-y-4"><div className={box}><div className={sectionTitle}>BasitBiOyun Design System</div><p className="text-xs text-neutral-300 leading-relaxed">Clean football editorial graphics. Template-specific data, purposeful imagery, strong hierarchy and no decorative filler.</p></div><button onClick={onOpenDesignGuidelines} className="w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold">Open Design System Reference</button><button onClick={onOpenQualityCheck} className="w-full py-3 rounded-xl bg-cyan-500 text-black text-xs font-black uppercase">Run Pre-Flight Quality Audit</button></div>
        )}
      </div>
      {cropState && <ImageCropModal imageSrc={cropState.src} onCropComplete={handleCropComplete} onCancel={() => setCropState(null)} />}
    </aside>
  );
};
