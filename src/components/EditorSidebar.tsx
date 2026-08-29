import { COUNTRIES } from '../constants/countries';
import { parsePlayerPack, applyPlayerPackToProject } from '../services/playerPack';
import React, { useState } from 'react';
import {
  IconLayoutGrid,
  IconDatabase,
  IconPhoto,
  IconAdjustments,
  IconBook2,
  IconPlus,
  IconTrash,
  IconUpload,
  IconFlipHorizontal,
  IconEye,
  IconEyeOff,
  IconShieldCheck,
  IconInfoCircle,
  IconShieldX,
  IconUserEdit,
  IconAlertCircle,
  IconLock,
  IconLockOpen,
  IconCheck,
  IconSparkles,
  IconChevronRight,
} from '@tabler/icons-react';
import {
  Project,
  TemplateType,
  CanvasAspectRatio,
  ThemeColors,
  StatIconType,
  BgPatternType,
  ComparisonMetric,
} from '../types';
import {
  CANVAS_DIMENSIONS,
  THEME_PRESETS,
  TEMPLATE_METADATA,
  DEFAULT_PROJECTS,
} from '../constants/presets';
import { ICON_OPTIONS, StatIcon } from './StatIcon';
import { TemplateForms } from './TemplateForms';
import { ClubLogoSelector } from './ClubLogoSelector';
import { ImageCropModal } from './ImageCropModal';

interface EditorSidebarProps {
  project: Project;
  onChange: (updated: Project) => void;
  onOpenDesignGuidelines?: () => void;
  onOpenQualityCheck?: () => void;
  className?: string;
}

type MainTab = 'templates' | 'data' | 'visuals' | 'layout' | 'guidelines';

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  project,
  onChange,
  onOpenDesignGuidelines,
  onOpenQualityCheck,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('data');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('All');
  const [cropState, setCropState] = useState<{ src: string; type: 'primary' | 'secondary' | number } | null>(null);
  const [inspectedStats, setInspectedStats] = useState<Record<string, boolean>>({});
  const toggleInspect = (id: string) => setInspectedStats(prev => ({...prev, [id]: !prev[id]}));
  const playerPackInputRef = React.useRef<HTMLInputElement>(null);

  const handlePlayerPackImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { data, error, unknownKeys } = parsePlayerPack(event.target?.result as string);
        
        if (error || !data) {
          alert(error || 'Failed to parse Player Pack.');
          return;
        }
        
        const updatedProject = applyPlayerPackToProject(project, data);
        onChange(updatedProject);
        
        if (unknownKeys && unknownKeys.length > 0) {
          alert(`Player Pack imported successfully!\nNote: Unmapped fields were ignored: ${unknownKeys.join(', ')}`);
        } else {
          alert('Player Pack imported successfully!');
        }
      } catch (err: any) {
        alert(err.message || 'Error processing Player Pack file');
      }
      if (playerPackInputRef.current) playerPackInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const activeTemplate = project.templates[project.templateType] || project.templates['scouting-report'];
  const { theme, layout: advancedLayout, visuals } = activeTemplate;
  const { logos, imageTransform, secondaryImageTransform, playerImageSrc, secondaryPlayerImageSrc } = visuals;
  const { player, credits } = project.sharedData;
  const { profile, stats, strengths, development, comparisonData, transferData, matchPreviewData, matchAnalysisData, tacticalData, statHighlightData, rankingData, quoteData, threadCoverData, matchResultData, teamProfileData } = activeTemplate.content;

  const updateVisuals = (updates: any) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, visuals: { ...activeTemplate.visuals, ...updates } } } });
  const updateContent = (updates: any) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, content: { ...activeTemplate.content, ...updates } } } });
  const updateShared = (updates: any) => onChange({ ...project, sharedData: { ...project.sharedData, ...updates } });
  const updateTheme = (theme: any) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, theme } } });
  const updateLayout = (layout: any) => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...activeTemplate, layout } } });


  // Switch template with default fallback data
  const handleTemplateSwitch = (newType: TemplateType) => {
    onChange({ ...project, templateType: newType });
  };

  // Switch aspect ratio
  const handleRatioSwitch = (ratio: CanvasAspectRatio) => {
    onChange({
      ...project,
      aspectRatio: ratio });
  };

  // Theme update
  const applyThemePreset = (preset: ThemeColors) => {
    updateTheme(preset);
  };

  const updateThemeField = (field: keyof ThemeColors, value: any) => {
    updateTheme({ ...theme, [field]: value });
  };

  // Image Transform Update
  const updateImageTransform = (field: keyof typeof imageTransform, value: any) => {
    updateVisuals({ imageTransform: { ...imageTransform, [field]: value } });
  };

  // Secondary Image Transform Update
  const updateSecondaryImageTransform = (field: keyof typeof imageTransform, value: any) => {
    const current = secondaryImageTransform || { ...imageTransform };
    updateVisuals({ secondaryImageTransform: { ...current, [field]: value } });
  };

  // Logo Update
  const updateLogo = (index: number, field: keyof typeof logos[0], value: any) => {
    const nextLogos = [...logos];
    if (nextLogos[index]) {
      nextLogos[index] = {
        ...nextLogos[index],
        [field]: value,
      };
      updateVisuals({ logos: nextLogos });
    }
  };

  // File Upload Handlers
  
  const handlePlayerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isSecondary = false) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { default: imageCompression } = await import('browser-image-compression');
        const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setCropState({ src: result, type: isSecondary ? 'secondary' : 'primary' });
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error(err);
        window.alert('Image processing failed. The existing visual was kept.');
      }
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { default: imageCompression } = await import('browser-image-compression');
        const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800, useWebWorker: true });
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          // Set crop state for logos using index
          setCropState({ src: result, type: index });
        };
        reader.readAsDataURL(compressedFile);
      } catch (err) {
        console.error(err);
        window.alert('Image processing failed. The existing visual was kept.');
      }
    }
  };
  
  const handleCropComplete = async (croppedDataUrl: string) => {
    if (!cropState) return;
    
    if (cropState.type === 'primary') {
      updateVisuals({ playerImageSrc: croppedDataUrl });
    } else if (cropState.type === 'secondary') {
      updateVisuals({ secondaryPlayerImageSrc: croppedDataUrl });
    } else if (typeof cropState.type === 'number') {
      const newLogos = [...activeTemplate.visuals.logos];
      const targetLogo = newLogos[cropState.type];
      if (targetLogo) {
        targetLogo.src = croppedDataUrl;
        targetLogo.visible = true;
        updateVisuals({ logos: newLogos });
      }
    }
    setCropState(null);
  };
  
  const extractThemeFromImage = async (src: string) => {
    if (!src) return;

    try {
      const { Vibrant } = await import('node-vibrant/browser');
      const palette = await Vibrant.from(src).getPalette();
      const primary = palette.Vibrant?.hex || theme.primaryAccent;
      const secondary = palette.LightVibrant?.hex || palette.Muted?.hex || theme.secondaryAccent;
      const bg1 = palette.DarkMuted?.hex || palette.DarkVibrant?.hex || theme.bg1;

      if (!window.confirm('Apply the generated palette to this template?')) return;

      updateTheme({
        ...theme,
        primaryAccent: primary,
        secondaryAccent: secondary,
        bg1,
      });
    } catch (error) {
      console.error('Theme extraction failed', error);
      window.alert('Could not generate a theme from this image. The current theme was kept.');
    }
  };

  // Filtered Templates
  const filteredTemplates = TEMPLATE_METADATA.filter((t) => {
    if (templateCategoryFilter === 'All') return true;
    return t.category === templateCategoryFilter;
  });

  return (
    <aside
      className={`w-full md:w-[420px] lg:w-[460px] bg-neutral-950/95 border-r border-neutral-800/90 flex flex-col h-full select-none ${className}`}
    >
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 p-2 gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'templates'
              ? 'bg-neutral-800 text-cyan-400 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <IconLayoutGrid size={16} />
          <span>Templates</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'data'
              ? 'bg-neutral-800 text-cyan-400 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <IconDatabase size={16} />
          <span>Data & Text</span>
        </button>

        <button
          onClick={() => setActiveTab('visuals')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'visuals'
              ? 'bg-neutral-800 text-cyan-400 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <IconPhoto size={16} />
          <span>Visuals</span>
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'layout'
              ? 'bg-neutral-800 text-cyan-400 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <IconAdjustments size={16} />
          <span>Layout</span>
        </button>

        <button
          onClick={() => setActiveTab('guidelines')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'guidelines'
              ? 'bg-neutral-800 text-cyan-400 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <IconBook2 size={16} />
          <span>Guide</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm text-neutral-200 custom-scrollbar">
        {/* ======================================================== */}
        {/* TAB 1: TEMPLATES & RATIOS */}
        {/* ======================================================== */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Visual Mode Selector */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-inner">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                <span>Visual Presentation Mode</span>
                <span className="text-cyan-400 font-mono text-[11px] uppercase">{project.visualMode || 'editorial'}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { mode: 'editorial', label: 'Editorial', desc: 'Balanced & Magazine' },
                  { mode: 'data', label: 'Data', desc: 'Analytical & Tactical' },
                  { mode: 'poster', label: 'Poster', desc: 'Dramatic & Bold' },
                ].map((m) => (
                  <button
                    key={m.mode}
                    onClick={() => onChange({ ...project, visualMode: m.mode as any })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      (project.visualMode || 'editorial') === m.mode
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                        : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-900'
                    }`}
                  >
                    <div className="font-bold text-xs">{m.label}</div>
                    <div className="text-[10px] text-neutral-500 leading-tight mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>Aspect Ratio (Canvas Dimensions)</span>
                <span className="text-cyan-400">{CANVAS_DIMENSIONS[project.aspectRatio]?.label}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CANVAS_DIMENSIONS).map((dim) => (
                  <button
                    key={dim.ratio}
                    onClick={() => handleRatioSwitch(dim.ratio)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      project.aspectRatio === dim.ratio
                        ? 'bg-cyan-500/15 border-cyan-500/60 text-white shadow-md'
                        : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <div className="font-bold text-xs uppercase">{dim.label}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{dim.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-400">
                Template Category
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {['All', 'Scouting & Player', 'Matchday & Team', 'Editorial & News'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTemplateCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      templateCategoryFilter === cat
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 12 Templates Grid */}
            <div className="space-y-2.5">
              <label className="text-xs font-black uppercase tracking-wider text-neutral-400">
                Select Graphic Template ({filteredTemplates.length})
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {filteredTemplates.map((t) => {
                  const isActive = project.templateType === t.type;
                  return (
                    <button
                      key={t.type}
                      onClick={() => handleTemplateSwitch(t.type)}
                      className={`p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-950/40 to-neutral-900 border-cyan-500/80 text-white shadow-xl ring-1 ring-cyan-500/40'
                          : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs uppercase tracking-wide text-white">
                            {t.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              isActive
                                ? 'bg-cyan-500 text-black'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {t.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                          {t.description}
                        </p>
                      </div>

                      {isActive ? (
                        <div className="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center flex-shrink-0 mt-0.5">
                          <IconCheck size={14} strokeWidth={3} />
                        </div>
                      ) : (
                        <IconChevronRight size={18} className="text-neutral-600 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: DATA & TEXT (DYNAMIC PER TEMPLATE) */}
        {/* ======================================================== */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Player Pack Import */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Data Sources
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Import a Player Pack JSON to instantly populate statistics, profile, and details without losing visual settings.
              </p>
              <input
                type="file"
                accept="application/json"
                ref={playerPackInputRef}
                onChange={handlePlayerPackImport}
                className="hidden"
              />
              <button
                onClick={() => playerPackInputRef.current?.click()}
                className="w-full py-2.5 px-3 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-800/50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <IconUpload size={14} />
                Import Player Pack JSON
              </button>
            </div>

            {/* Scouting Report Data Form */}
            {project.templateType === 'scouting-report' && (
              <div className="space-y-5">
                {/* Player Profile Fields */}
                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Player Identity
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={player?.name || ""}
                      onChange={(e) =>
                        updateShared({ player: { ...player, name: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Position(s)</label>
                      <input
                        type="text"
                        value={player.positions}
                        onChange={(e) =>
                          updateShared({ player: { ...player, positions: e.target.value } })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Club</label>
                      <input
                        type="text"
                        value={player.club}
                        onChange={(e) =>
                          updateShared({ player: { ...player, club: e.target.value } })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Age</label>
                      <input
                        type="text"
                        value={player.age}
                        onChange={(e) =>
                          updateShared({ player: { ...player, age: e.target.value } })
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none text-center"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-1">Nationality</label>
                        <input
                          type="text"
                          value={player.nationality}
                          onChange={(e) => {
                            const val = e.target.value;
                            const matched = COUNTRIES.find(c => c.name.toLowerCase() === val.toLowerCase());
                            updateShared({ 
                              player: { 
                                ...player, 
                                nationality: val, 
                                ...(matched ? { countryFlag: matched.flag } : {})
                              } 
                            });
                          }}
                          className="w-full px-2 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 block mb-1">Flag</label>
                        <input
                          type="text"
                          value={player.countryFlag || ''}
                          onChange={(e) =>
                            updateShared({ player: { ...player, countryFlag: e.target.value } })
                          }
                          className="w-full px-2 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none text-center"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Foot</label>
                      <input
                        type="text"
                        value={player.preferredFoot}
                        onChange={(e) =>
                          updateShared({ player: { ...player, preferredFoot: e.target.value } })
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none text-center"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 block mb-1">Height</label>
                      <input
                        type="text"
                        value={player.height}
                        onChange={(e) =>
                          updateShared({ player: { ...player, height: e.target.value } })
                        }
                        className="w-full px-2 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Executive Scouting Summary
                  </div>
                  <textarea
                    rows={3}
                    value={profile.summary}
                    onChange={(e) =>
                      updateContent({ profile: { ...profile, summary: e.target.value } })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* 4 Core Stats */}
                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Key Performance Metrics (4 Cards)
                  </div>
                  {stats.slice(0, 4).map((st, idx) => {
                    const status = st.provenance?.status || 'missing';
                    let StatusIcon = IconAlertCircle;
                    let statusColor = 'text-neutral-500';
                    let statusText = 'Missing Source';

                    if (status === 'verified') {
                      StatusIcon = IconShieldCheck;
                      statusColor = 'text-green-400';
                      statusText = 'Verified Data';
                    } else if (status === 'manual') {
                      StatusIcon = IconUserEdit;
                      statusColor = 'text-yellow-400';
                      statusText = 'Manual Entry';
                    } else if (status === 'calculated') {
                      StatusIcon = IconInfoCircle;
                      statusColor = 'text-cyan-400';
                      statusText = 'Calculated Data';
                    }
                    
                    const isInspecting = inspectedStats[st.id || idx];

                    return (
                    <div key={st.id || idx} className="p-3 rounded-lg bg-black/40 border border-neutral-800 space-y-2 relative">
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                         <button onClick={() => toggleInspect(st.id || String(idx))} className={`p-1.5 rounded hover:bg-neutral-800 transition-colors flex items-center gap-1 ${isInspecting ? 'bg-neutral-800' : ''}`} title="Data Inspector">
                            <StatusIcon size={14} className={statusColor} />
                         </button>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Value</label>
                          <input
                            type="text"
                            value={st.value}
                            onChange={(e) => {
                              const next = [...stats];
                              next[idx] = { ...next[idx], value: e.target.value };
                              updateContent({ stats: next });
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-black/70 border border-neutral-700 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-7">
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Metric Label</label>
                          <input
                            type="text"
                            value={st.label}
                            onChange={(e) => {
                              const next = [...stats];
                              next[idx] = { ...next[idx], label: e.target.value };
                              updateContent({ stats: next });
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-black/70 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Context / %tile</label>
                          <input
                            type="text"
                            value={st.subValue || ''}
                            placeholder="e.g. 96th %tile"
                            onChange={(e) => {
                              const next = [...stats];
                              next[idx] = { ...next[idx], subValue: e.target.value };
                              updateContent({ stats: next });
                            }}
                            className="w-full px-2 py-1 rounded bg-black/70 border border-neutral-700 text-[11px] text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 block mb-0.5">Icon</label>
                          <select
                            value={st.icon}
                            onChange={(e) => {
                              const next = [...stats];
                              next[idx] = { ...next[idx], icon: e.target.value as StatIconType };
                              updateContent({ stats: next });
                            }}
                            className="w-full px-2 py-1 rounded bg-black/70 border border-neutral-700 text-[11px] text-white focus:border-cyan-400 focus:outline-none"
                          >
                            {ICON_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {isInspecting && (
                         <div className="mt-4 pt-3 border-t border-neutral-800 space-y-3 animate-in fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                                <IconDatabase size={12} className="text-cyan-500" />
                                Data Inspector
                              </span>
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full border ${status === 'verified' ? 'bg-green-950/30 border-green-900 text-green-400' : status === 'manual' ? 'bg-yellow-950/30 border-yellow-900 text-yellow-400' : status === 'calculated' ? 'bg-cyan-950/30 border-cyan-900 text-cyan-400' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}>{statusText}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 bg-neutral-950/50 p-2 rounded border border-neutral-800/50">
                               <div>
                                 <label className="text-[9px] text-neutral-500 block mb-0.5">Source Provider</label>
                                 <div className="text-[10px] text-neutral-300 truncate" title={st.provenance?.source || 'Not available'}>{st.provenance?.source || 'Not available'}</div>
                               </div>
                               <div>
                                 <label className="text-[9px] text-neutral-500 block mb-0.5">Competition</label>
                                 <div className="text-[10px] text-neutral-300 truncate" title={st.provenance?.competition || 'Not available'}>{st.provenance?.competition || 'Not available'}</div>
                               </div>
                               <div>
                                 <label className="text-[9px] text-neutral-500 block mb-0.5">Season/Timeframe</label>
                                 <div className="text-[10px] text-neutral-300 truncate" title={st.provenance?.season || 'Not available'}>{st.provenance?.season || 'Not available'}</div>
                               </div>
                               <div>
                                 <label className="text-[9px] text-neutral-500 block mb-0.5">Sample Size</label>
                                 <div className="text-[10px] text-neutral-300 truncate" title={st.provenance?.sampleSize || 'Not available'}>{st.provenance?.sampleSize || 'Not available'}</div>
                               </div>
                            </div>
                            {st.provenance?.sourceUrl && (
                              <div>
                                <label className="text-[9px] text-neutral-500 block mb-0.5">Source URL</label>
                                <a href={st.provenance.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:underline truncate block">
                                  {st.provenance.sourceUrl}
                                </a>
                              </div>
                            )}
                            {st.provenance?.retrievedAt && (
                              <div className="text-[9px] text-neutral-600 text-right">
                                Retrieved: {new Date(st.provenance.retrievedAt).toLocaleDateString()}
                              </div>
                            )}
                         </div>
                      )}
                    </div>
                  )
                  })}
                </div>

                {/* Strengths & Development */}
                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Key Strengths
                  </div>
                  {strengths.map((str, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={str}
                        onChange={(e) => {
                          const next = [...strengths];
                          next[i] = e.target.value;
                          updateContent({ strengths: next });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const next = strengths.filter((_, idx) => idx !== i);
                          updateContent({ strengths: next });
                        }}
                        className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-red-400"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      updateContent({ strengths: [...strengths, 'New Player Strength'] })
                    }
                    className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 flex items-center justify-center gap-1"
                  >
                    <IconPlus size={14} /> Add Strength
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3 mt-4">
                  <div className="text-xs font-black uppercase tracking-wider text-orange-400">
                    Areas for Development
                  </div>
                  {development.map((dev, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={dev}
                        onChange={(e) => {
                          const next = [...development];
                          next[i] = e.target.value;
                          updateContent({ development: next });
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const next = development.filter((_, idx) => idx !== i);
                          updateContent({ development: next });
                        }}
                        className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-red-400"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      updateContent({ development: [...development, 'New Area to Improve'] })
                    }
                    className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 flex items-center justify-center gap-1"
                  >
                    <IconPlus size={14} /> Add Development Area
                  </button>
                </div>
              </div>
            )}

            {/* Player Comparison Form */}
            {project.templateType === 'player-comparison' && comparisonData && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Comparison Details
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={comparisonData.subtitle}
                      onChange={(e) =>
                        updateContent({ comparisonData: { ...comparisonData!, subtitle: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Player 2 (Opponent) Info
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Name</label>
                      <input
                        type="text"
                        value={comparisonData.player2.name}
                        onChange={(e) =>
                          updateContent({ comparisonData: {
                              ...comparisonData!,
                              player2: { ...comparisonData!.player2, name: e.target.value } } })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Club</label>
                      <input
                        type="text"
                        value={comparisonData.player2.club}
                        onChange={(e) =>
                          updateContent({ comparisonData: {
                              ...comparisonData!,
                              player2: { ...comparisonData!.player2, club: e.target.value } } })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Age</label>
                      <input
                        type="text"
                        value={comparisonData.player2.age}
                        onChange={(e) =>
                          updateContent({ comparisonData: {
                              ...comparisonData!,
                              player2: { ...comparisonData!.player2, age: e.target.value } } })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Positions</label>
                      <input
                        type="text"
                        value={comparisonData.player2.positions}
                        onChange={(e) =>
                          updateContent({ comparisonData: {
                              ...comparisonData!,
                              player2: { ...comparisonData!.player2, positions: e.target.value } } })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                    <span>Comparison Metrics</span>
                  </div>
                  {comparisonData.metrics.map((metric, i) => (
                    <div key={metric.id || i} className="p-3 rounded-lg bg-black/40 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={metric.label}
                          placeholder="Metric Label"
                          onChange={(e) => {
                            const next = [...comparisonData!.metrics];
                            next[i] = { ...next[i], label: e.target.value };
                            updateContent({ comparisonData: { ...comparisonData!, metrics: next } });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const next = comparisonData!.metrics.filter((_, idx) => idx !== i);
                            updateContent({ comparisonData: { ...comparisonData!, metrics: next } });
                          }}
                          className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-red-400"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-neutral-500 block mb-0.5">Player 1 Value</label>
                          <input
                            type="text"
                            value={metric.val1}
                            onChange={(e) => {
                              const next = [...comparisonData!.metrics];
                              next[i] = { ...next[i], val1: e.target.value };
                              updateContent({ comparisonData: { ...comparisonData!, metrics: next } });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs tabular-nums text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-500 block mb-0.5">Player 2 Value</label>
                          <input
                            type="text"
                            value={metric.val2}
                            onChange={(e) => {
                              const next = [...comparisonData!.metrics];
                              next[i] = { ...next[i], val2: e.target.value };
                              updateContent({ comparisonData: { ...comparisonData!, metrics: next } });
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs tabular-nums text-white focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newMetric: ComparisonMetric = {
                        id: `metric-${Date.now()}`,
                        label: 'New Metric',
                        val1: '0',
                        val2: '0',
                      };
                      updateContent({ comparisonData: {
                          ...comparisonData!,
                          metrics: [...comparisonData!.metrics, newMetric],
                        } });
                    }}
                    className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 flex items-center justify-center gap-1"
                  >
                    <IconPlus size={14} /> Add Metric
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Analytical Verdict
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Title</label>
                    <input
                      type="text"
                      value={comparisonData.verdictTitle}
                      onChange={(e) =>
                        updateContent({ comparisonData: { ...comparisonData!, verdictTitle: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Verdict Text</label>
                    <textarea
                      value={comparisonData.verdictText}
                      onChange={(e) =>
                        updateContent({ comparisonData: { ...comparisonData!, verdictText: e.target.value } })
                      }
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Graphic Form */}
            {project.templateType === 'transfer-graphic' && transferData && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Transfer Headline & Clubs
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Headline</label>
                    <input
                      type="text"
                      value={transferData.headline}
                      onChange={(e) =>
                        updateContent({ transferData: { ...transferData!, headline: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">From Club</label>
                      <input
                        type="text"
                        value={transferData.fromClub}
                        onChange={(e) =>
                          updateContent({ transferData: { ...transferData!, fromClub: e.target.value } })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">To Club</label>
                      <input
                        type="text"
                        value={transferData.toClub}
                        onChange={(e) =>
                          updateContent({ transferData: { ...transferData!, toClub: e.target.value } })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Transfer Fee</label>
                      <input
                        type="text"
                        value={transferData.transferFee}
                        onChange={(e) =>
                          updateContent({ transferData: { ...transferData!, transferFee: e.target.value } })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Contract Terms</label>
                      <input
                        type="text"
                        value={transferData.contractLength}
                        onChange={(e) =>
                          updateContent({ transferData: { ...transferData!, contractLength: e.target.value } })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Summary</label>
                    <textarea
                      rows={2}
                      value={transferData.detailsSummary}
                      onChange={(e) =>
                        updateContent({ transferData: { ...transferData!, detailsSummary: e.target.value } })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-2">Key Conditions</label>
                    <div className="space-y-2">
                      {transferData.keyConditions.map((condition, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={condition}
                            onChange={(e) => {
                              const next = [...transferData!.keyConditions];
                              next[idx] = e.target.value;
                              updateContent({ transferData: { ...transferData!, keyConditions: next } });
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const next = transferData!.keyConditions.filter((_, i) => i !== idx);
                              updateContent({ transferData: { ...transferData!, keyConditions: next } });
                            }}
                            className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-red-400"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          updateContent({ transferData: {
                              ...transferData!,
                              keyConditions: [...transferData!.keyConditions, 'New condition...'],
                            } })
                        }
                        className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 flex items-center justify-center gap-1"
                      >
                        <IconPlus size={14} /> Add Condition
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Template-Specific Additional Forms */}
            <TemplateForms project={project} onChange={onChange} />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: VISUALS & IMAGES */}
        {/* ======================================================== */}
        {activeTab === 'visuals' && (
          <div className="space-y-6">
            {/* Player Photo Cutout Layer */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                  Player Cutout Image
                </span>
                <label className="cursor-pointer px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5">
                  <IconUpload size={14} />
                  <span>Upload PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePlayerPhotoUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>

              
              {playerImageSrc && (
                <button
                  onClick={() => extractThemeFromImage(playerImageSrc)}
                  className="w-full mt-2 py-2 px-3 bg-fuchsia-950/40 hover:bg-fuchsia-900/60 text-fuchsia-400 border border-fuchsia-800/50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <IconSparkles size={14} />
                  Generate Theme from Image
                </button>
              )}
              {/* Transform Sliders */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Scale Size</span>
                    <span>{Math.round(imageTransform.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={imageTransform.scale}
                    onChange={(e) => updateImageTransform('scale', parseFloat(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Horizontal X</span>
                      <span>{imageTransform.x}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={imageTransform.x}
                      onChange={(e) => updateImageTransform('x', parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Vertical Y</span>
                      <span>{imageTransform.y}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={imageTransform.y}
                      onChange={(e) => updateImageTransform('y', parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>

                {/* Visual Filters: Brightness & Contrast */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Brightness</span>
                      <span>{imageTransform.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={imageTransform.brightness}
                      onChange={(e) => updateImageTransform('brightness', parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>Contrast</span>
                      <span>{imageTransform.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={imageTransform.contrast}
                      onChange={(e) => updateImageTransform('contrast', parseInt(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>

                {/* Effect Toggles */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() =>
                      updateImageTransform(
                        'flipHorizontal',
                        !imageTransform.flipHorizontal
                      )
                    }
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      imageTransform.flipHorizontal
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-black/40 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <IconFlipHorizontal size={14} /> Flip X
                  </button>

                  <button
                    onClick={() =>
                      updateImageTransform('bottomFade', !imageTransform.bottomFade)
                    }
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      imageTransform.bottomFade
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-black/40 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    Torso Fade
                  </button>
                </div>
              </div>
            </div>

            {/* Theme Presets */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Editorial Theme Presets
              </div>
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyThemePreset(preset)}
                    className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:border-neutral-600 text-left flex items-center gap-2.5 transition-all"
                  >
                    <div
                      className="w-6 h-6 rounded-lg border border-neutral-700 flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${preset.primaryAccent}, ${preset.bg1})`,
                      }}
                    />
                    <div className="truncate text-xs font-bold text-white">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Texture Pattern */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-4">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3">
                  Background Texture Pattern
                </div>
                <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-48 custom-scrollbar pr-1">
                  {(
                    [
                      'tactical-lines',
                      'subtle-grid',
                      'radial-glow',
                      'stadium-spotlight',
                      'pitch-half',
                      'clean-minimal',
                      'diagonal-speed-lines',
                      'layered-geometric',
                      'pitch-grid',
                      'tactical-board',
                      'halftone',
                      'broadcast-data',
                      'editorial-magazine',
                      'matchday-poster',
                      'dark-spotlight',
                      'angular-shards',
                      'motion-streaks',
                      'subtle-wave',
                      'blueprint',
                      'minimal-data',
                      'dramatic-poster',
                      'split-tone',
                      'radial-spotlight',
                      'abstract-field-lines',
                      'none'
                    ] as BgPatternType[]
                  ).map((pat) => (
                    <button
                      key={pat}
                      onClick={() => updateThemeField('pattern', pat)}
                      className={`p-2 rounded-lg border text-xs font-bold capitalize transition-all ${
                        theme.pattern === pat
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-black/40 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {pat.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Noise / Grain Toggle */}
              <div className="pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Photographic Film Grain
                  </span>
                  <button
                    onClick={() =>
                      updateLayout({ ...advancedLayout, grainEnabled: !advancedLayout?.grainEnabled }) }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      advancedLayout?.grainEnabled ? 'bg-cyan-500' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        advancedLayout?.grainEnabled ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {advancedLayout?.grainEnabled && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                      <span>Grain Intensity</span>
                      <span>{advancedLayout?.grainOpacity || 15}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="1"
                      value={advancedLayout?.grainOpacity || 15}
                      onChange={(e) =>
                        updateLayout({ ...advancedLayout, grainOpacity: parseInt(e.target.value) })
                      }
                      className="w-full accent-cyan-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Club & Sponsor Logos */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Club & Sponsor Logos
              </div>
              {logos.map((logo, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-black/40 border border-neutral-800 space-y-3">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{logo.name}</span>
                    </div>
                    <div className="flex items-center gap-2 w-full mt-2">
                        <ClubLogoSelector 
                          label={logo.name}
                          currentLogoUrl={logo.src}
                          onSelect={(dataUrl) => updateLogo(idx, 'src', dataUrl)}
                          onRemove={() => updateLogo(idx, 'src', '')}
                          onManualUpload={(e) => handleLogoUpload(e, idx)}
                        />
                        <button
                          onClick={() => updateLogo(idx, 'visible', !logo.visible)}
                          className="p-2 rounded bg-neutral-800 text-neutral-400 hover:text-white flex-shrink-0"
                          title="Toggle Visibility"
                        >
                          {logo.visible ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                        </button>
                    </div>
                  </div>
                  {logo.visible && (
                    <div className="space-y-2 mt-2">
                      <div>
                        <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                          <span>Size</span>
                          <span>{logo.size || 120}px</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="300"
                          value={logo.size || 120}
                          onChange={(e) => updateLogo(idx, 'size', parseInt(e.target.value))}
                          className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                            <span>Horiz (X)</span>
                            <span>{logo.x || 0}</span>
                          </div>
                          <input
                            type="range"
                            min="-500"
                            max="500"
                            value={logo.x || 0}
                            onChange={(e) => updateLogo(idx, 'x', parseInt(e.target.value))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                            <span>Vert (Y)</span>
                            <span>{logo.y || 0}</span>
                          </div>
                          <input
                            type="range"
                            min="-500"
                            max="500"
                            value={logo.y || 0}
                            onChange={(e) => updateLogo(idx, 'y', parseInt(e.target.value))}
                            className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ADVANCED LAYOUT & BRAND */}
        {/* ======================================================== */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            {/* Layout Lock Mode */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  {advancedLayout?.locked ? (
                    <IconLock size={16} className="text-amber-400" />
                  ) : (
                    <IconLockOpen size={16} className="text-cyan-400" />
                  )}
                  <span>Template Layout Lock</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {advancedLayout?.locked
                    ? 'Layout locked: Edits text & colors safely without accidental shift.'
                    : 'Unlocked: Dragging canvas elements enabled.'}
                </p>
              </div>

              <button
                onClick={() =>
                  updateLayout({ ...advancedLayout, locked: !advancedLayout?.locked })
                }
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  advancedLayout?.locked
                    ? 'bg-amber-500 text-black'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                {advancedLayout?.locked ? 'Locked' : 'Unlocked'}
              </button>
            </div>

            {/* Display Typography */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Display Headline Font
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Barlow Condensed', val: "'Barlow Condensed', sans-serif" },
                  { label: 'Anton (Impact)', val: "'Anton', sans-serif" },
                  { label: 'Montserrat', val: "'Montserrat', sans-serif" },
                  { label: 'Space Grotesk', val: "'Space Grotesk', sans-serif" },
                ].map((f) => (
                  <button
                    key={f.val}
                    onClick={() =>
                      updateLayout({ ...advancedLayout, fontDisplay: f.val })
                    }
                    className={`p-2.5 rounded-lg border text-xs text-left font-bold transition-all ${
                      advancedLayout?.fontDisplay === f.val
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-black/40 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Signature Footer */}
            <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Attribution & Brand Signature
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Prepared For</label>
                <input
                  type="text"
                  value={credits.preparedFor}
                  onChange={(e) =>
                    updateShared({ credits: { ...credits, preparedFor: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Visual Signature</label>
                <input
                  type="text"
                  value={credits.visualBy}
                  onChange={(e) =>
                    updateShared({ credits: { ...credits, visualBy: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: GUIDELINES & PRE-FLIGHT QA */}
        {/* ======================================================== */}
        {activeTab === 'guidelines' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <IconSparkles size={16} />
                <span>BasitBiOyun Philosophy</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Clean, serious, football-focused, and strictly anti-slop. High-contrast display typography, data precision, and sports magazine editorial presence.
              </p>
            </div>

            <button
              onClick={onOpenDesignGuidelines}
              className="w-full py-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              <IconBook2 size={16} className="text-cyan-400" />
              <span>Open Design System Reference</span>
            </button>

            <button
              onClick={onOpenQualityCheck}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <IconShieldCheck size={18} />
              <span>Run Pre-Flight Quality Audit</span>
            </button>
          </div>
        )}
      </div>
      {cropState && <ImageCropModal imageSrc={cropState.src} onCropComplete={handleCropComplete} onCancel={() => setCropState(null)} />}
    </aside>
  );
};
