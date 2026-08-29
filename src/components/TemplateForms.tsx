import React from 'react';
import { Project, ComparisonMetric, StatItem, RankingTopItem } from '../types';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface FormProps {
  project: Project;
  onChange: (project: Project) => void;
}

const MatchPreviewForm: React.FC<FormProps> = ({ project, onChange }) => {
  const data = project.templates[project.templateType]?.content.matchPreviewData;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Match Details</div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Competition</label><input type="text" value={data.competition} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, competition: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Match Date</label><input type="text" value={data.matchDate} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, matchDate: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Kickoff Time & Venue</label><input type="text" value={data.kickoffTime} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, kickoffTime: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {['team1', 'team2'].map((teamKey, tIdx) => {
          const tKey = teamKey as 'team1' | 'team2';
          return (
            <div key={tIdx} className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Team {tIdx + 1}</div>
              <div><label className="text-[11px] text-neutral-400 block mb-1">Name</label><input type="text" value={data[tKey].name} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, [tKey]: { ...data[tKey], name: e.target.value } } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
              <div><label className="text-[11px] text-neutral-400 block mb-1">Manager</label><input type="text" value={data[tKey].manager} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, [tKey]: { ...data[tKey], manager: e.target.value } } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
              <div><label className="text-[11px] text-neutral-400 block mb-1">Standing</label><input type="text" value={data[tKey].standing} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, [tKey]: { ...data[tKey], standing: e.target.value } } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
            </div>
          )
        })}
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Key Battle</div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Title</label><input type="text" value={data.keyBattleTitle} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, keyBattleTitle: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Details</label><textarea rows={2} value={data.keyBattleDetails} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, keyBattleDetails: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Tactical Keys</div>
        {data.tacticalKeys.map((k, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="text" value={k} onChange={e => { const keys = [...data.tacticalKeys]; keys[i] = e.target.value; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, tacticalKeys: keys } } } } }); }} className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" />
            <button onClick={() => { const keys = data.tacticalKeys.filter((_, idx) => idx !== i); onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, tacticalKeys: keys } } } } }); }} className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-red-400"><IconTrash size={14} /></button>
          </div>
        ))}
        <button onClick={() => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchPreviewData: { ...data, tacticalKeys: [...data.tacticalKeys, 'New tactical key...'] } } } } })} className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 flex items-center justify-center gap-1"><IconPlus size={14} /> Add Tactical Key</button>
      </div>
    </div>
  );
};

const MatchAnalysisForm: React.FC<FormProps> = ({ project, onChange }) => {
  const data = project.templates[project.templateType]?.content.matchAnalysisData;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Match Details & Scoreline</div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Competition</label><input type="text" value={data.competition} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, competition: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[11px] text-neutral-400 block mb-1">Team 1</label><input type="text" value={data.scoreline.team1} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, scoreline: { ...data.scoreline, team1: e.target.value } } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Score 1</label><input type="number" value={data.scoreline.score1} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, scoreline: { ...data.scoreline, score1: parseInt(e.target.value) || 0 } } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white tabular-nums focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Team 2</label><input type="text" value={data.scoreline.team2} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, scoreline: { ...data.scoreline, team2: e.target.value } } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Score 2</label><input type="number" value={data.scoreline.score2} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, scoreline: { ...data.scoreline, score2: parseInt(e.target.value) || 0 } } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white tabular-nums focus:border-cyan-400 focus:outline-none" /></div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Match Stats</div>
        {data.stats.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="text" value={s.label} placeholder="Stat Label" onChange={e => { const sArr = [...data.stats]; sArr[i] = { ...sArr[i], label: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, stats: sArr } } } } }); }} className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none" />
            <input type="text" value={s.val1} placeholder="T1" onChange={e => { const sArr = [...data.stats]; sArr[i] = { ...sArr[i], val1: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, stats: sArr } } } } }); }} className="w-16 px-2 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white tabular-nums focus:border-cyan-400 focus:outline-none" />
            <input type="text" value={s.val2} placeholder="T2" onChange={e => { const sArr = [...data.stats]; sArr[i] = { ...sArr[i], val2: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, stats: sArr } } } } }); }} className="w-16 px-2 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white tabular-nums focus:border-cyan-400 focus:outline-none" />
            <button onClick={() => { const sArr = data.stats.filter((_, idx) => idx !== i); onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, stats: sArr } } } } }); }} className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-red-400"><IconTrash size={14} /></button>
          </div>
        ))}
        <button onClick={() => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, stats: [...data.stats, { label: "New Stat", val1: "0", val2: "0" }] } } } } })} className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 flex items-center justify-center gap-1"><IconPlus size={14} /> Add Stat</button>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Analysis & Performer</div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Tactical Summary</label><textarea rows={3} value={data.tacticalSummary} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, tacticalSummary: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Performer Title</label><input type="text" value={data.performerTitle} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, performerTitle: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Performer Name</label><input type="text" value={data.performerName} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, performerName: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Performer Note</label><textarea rows={2} value={data.performerNote} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchAnalysisData: { ...data, performerNote: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
      </div>
    </div>
  );
};

const TacticalAnalysisForm: React.FC<FormProps> = ({ project, onChange }) => {
  const data = project.templates[project.templateType]?.content.tacticalData;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Tactical Overview</div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Topic</label><input type="text" value={data.topic} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, tacticalData: { ...data, topic: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Team / Coach</label><input type="text" value={data.teamOrCoach} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, tacticalData: { ...data, teamOrCoach: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Formation</label><input type="text" value={data.formation} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, tacticalData: { ...data, formation: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Tactical Note</label><textarea rows={2} value={data.tacticalNote} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, tacticalData: { ...data, tacticalNote: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Core Principles</div>
        {data.corePrinciples.map((cp, i) => (
          <div key={i} className="p-3 bg-black/40 border border-neutral-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <input type="text" value={cp.title} placeholder="Title" onChange={e => { const cps = [...data.corePrinciples]; cps[i] = { ...cps[i], title: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, tacticalData: { ...data, corePrinciples: cps } } } } }); }} className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none" />
              <button onClick={() => { const cps = data.corePrinciples.filter((_, idx) => idx !== i); onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, tacticalData: { ...data, corePrinciples: cps } } } } }); }} className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-red-400"><IconTrash size={14} /></button>
            </div>
            <textarea rows={2} value={cp.description} placeholder="Description" onChange={e => { const cps = [...data.corePrinciples]; cps[i] = { ...cps[i], description: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, tacticalData: { ...data, corePrinciples: cps } } } } }); }} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" />
          </div>
        ))}
        <button onClick={() => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, tacticalData: { ...data, corePrinciples: [...data.corePrinciples, { title: 'New Principle', description: 'Description...' }] } } } } })} className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 flex items-center justify-center gap-1"><IconPlus size={14} /> Add Principle</button>
      </div>
    </div>
  );
};

const StatHighlightForm: React.FC<FormProps> = ({ project, onChange }) => {
  const data = project.templates[project.templateType]?.content.statHighlightData;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Hero Stat & Details</div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[11px] text-neutral-400 block mb-1">Hero Stat</label><input type="text" value={data.heroStat} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, heroStat: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white tabular-nums font-bold focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Rank Badge</label><input type="text" value={data.rankBadge} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, rankBadge: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        </div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Hero Stat Label</label><input type="text" value={data.heroStatLabel} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, heroStatLabel: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Category Tag</label><input type="text" value={data.categoryTag} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, categoryTag: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Sample Size Note</label><input type="text" value={data.sampleSize} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, sampleSize: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Editorial Verdict</label><textarea rows={3} value={data.editorialVerdict} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, editorialVerdict: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Context Metrics</div>
        {data.contextMetrics.map((cm, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="text" value={cm.label} placeholder="Label" onChange={e => { const cms = [...data.contextMetrics]; cms[i] = { ...cms[i], label: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, contextMetrics: cms } } } } }); }} className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none" />
            <input type="text" value={cm.value} placeholder="Value" onChange={e => { const cms = [...data.contextMetrics]; cms[i] = { ...cms[i], value: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, contextMetrics: cms } } } } }); }} className="w-20 px-2 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white tabular-nums focus:border-cyan-400 focus:outline-none" />
            <button onClick={() => { const cms = data.contextMetrics.filter((_, idx) => idx !== i); onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, contextMetrics: cms } } } } }); }} className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-red-400"><IconTrash size={14} /></button>
          </div>
        ))}
        <button onClick={() => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, statHighlightData: { ...data, contextMetrics: [...data.contextMetrics, { id: Date.now().toString(), label: 'New Metric', value: '0', icon: 'check' }] } } } } })} className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 flex items-center justify-center gap-1"><IconPlus size={14} /> Add Metric</button>
      </div>
    </div>
  );
};

const RankingTopListForm: React.FC<FormProps> = ({ project, onChange }) => {
  const data = project.templates[project.templateType]?.content.rankingData;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Ranking Headers</div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Category Title</label><input type="text" value={data.categoryTitle} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, categoryTitle: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Subtitle</label><input type="text" value={data.subtitle} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, subtitle: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[11px] text-neutral-400 block mb-1">Metric Header</label><input type="text" value={data.metricHeader} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, metricHeader: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Season Filter</label><input type="text" value={data.seasonFilter} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, seasonFilter: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Ranking Items</div>
        {data.items.map((item, i) => (
          <div key={i} className="p-3 bg-black/40 border border-neutral-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <input type="number" value={item.rank} onChange={e => { const its = [...data.items]; its[i] = { ...its[i], rank: parseInt(e.target.value) || 0 }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, items: its } } } } }); }} className="w-12 px-2 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white text-center tabular-nums focus:border-cyan-400 focus:outline-none" />
              <input type="text" value={item.playerName} placeholder="Name" onChange={e => { const its = [...data.items]; its[i] = { ...its[i], playerName: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, items: its } } } } }); }} className="flex-1 px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none" />
              <button onClick={() => { const its = data.items.filter((_, idx) => idx !== i); onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, items: its } } } } }); }} className="p-1.5 rounded bg-neutral-800 text-neutral-400 hover:text-red-400"><IconTrash size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={item.club} placeholder="Club" onChange={e => { const its = [...data.items]; its[i] = { ...its[i], club: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, items: its } } } } }); }} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" />
              <input type="text" value={item.val} placeholder="Value" onChange={e => { const its = [...data.items]; its[i] = { ...its[i], val: e.target.value }; onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, items: its } } } } }); }} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white tabular-nums focus:border-cyan-400 focus:outline-none" />
            </div>
          </div>
        ))}
        <button onClick={() => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, rankingData: { ...data, items: [...data.items, { id: Date.now().toString(), rank: data.items.length + 1, playerName: 'New Player', club: 'Club', val: '0' }] } } } } })} className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300 flex items-center justify-center gap-1"><IconPlus size={14} /> Add Item</button>
      </div>
    </div>
  );
};

const QuoteOpinionForm: React.FC<FormProps> = ({ project, onChange }) => {
  const data = project.templates[project.templateType]?.content.quoteData;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Quote Content</div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Quote</label><textarea rows={4} value={data.quote} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, quoteData: { ...data, quote: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-sm font-medium text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Key Punchline</label><input type="text" value={data.keyPunchline} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, quoteData: { ...data, keyPunchline: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none" /></div>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Author & Context</div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[11px] text-neutral-400 block mb-1">Author Name</label><input type="text" value={data.authorName} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, quoteData: { ...data, authorName: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Author Role</label><input type="text" value={data.authorRole} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, quoteData: { ...data, authorRole: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Topic Tag</label><input type="text" value={data.topicTag} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, quoteData: { ...data, topicTag: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Source Date</label><input type="text" value={data.sourceDate} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, quoteData: { ...data, sourceDate: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        </div>
      </div>
    </div>
  );
};

const ThreadCoverForm: React.FC<FormProps> = ({ project, onChange }) => {
  const data = project.templates[project.templateType]?.content.threadCoverData;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Thread Cover</div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Headline</label><input type="text" value={data.headline} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, threadCoverData: { ...data, headline: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Subtitle</label><textarea rows={2} value={data.subtitle} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, threadCoverData: { ...data, subtitle: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[11px] text-neutral-400 block mb-1">Badge</label><input type="text" value={data.badge} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, threadCoverData: { ...data, badge: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Author Handle</label><input type="text" value={data.authorHandle} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, threadCoverData: { ...data, authorHandle: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        </div>
      </div>
    </div>
  );
};

const MatchResultForm: React.FC<FormProps> = ({ project, onChange }) => {
  const data = project.templates[project.templateType]?.content.matchResultData;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Match Details</div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[11px] text-neutral-400 block mb-1">Competition</label><input type="text" value={data.competition} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchResultData: { ...data, competition: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Stage/Date</label><input type="text" value={data.stage} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchResultData: { ...data, stage: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Scoreline</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div><label className="text-[11px] text-neutral-400 block mb-1">Team 1</label><input type="text" value={data.team1} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchResultData: { ...data, team1: e.target.value } } } } })} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none" /></div>
            <div><label className="text-[11px] text-neutral-400 block mb-1">Score</label><input type="number" value={data.score1} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchResultData: { ...data, score1: parseInt(e.target.value) || 0 } } } } })} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white tabular-nums font-bold focus:border-cyan-400 focus:outline-none" /></div>
          </div>
          <div className="space-y-2">
            <div><label className="text-[11px] text-neutral-400 block mb-1">Team 2</label><input type="text" value={data.team2} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchResultData: { ...data, team2: e.target.value } } } } })} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white font-bold focus:border-cyan-400 focus:outline-none" /></div>
            <div><label className="text-[11px] text-neutral-400 block mb-1">Score</label><input type="number" value={data.score2} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchResultData: { ...data, score2: parseInt(e.target.value) || 0 } } } } })} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white tabular-nums font-bold focus:border-cyan-400 focus:outline-none" /></div>
          </div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Match Summary</div>
        <textarea rows={3} value={data.matchSummary} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, matchResultData: { ...data, matchSummary: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" />
      </div>
    </div>
  );
};

const TeamProfileForm: React.FC<FormProps> = ({ project, onChange }) => {
  const data = project.templates[project.templateType]?.content.teamProfileData;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Team Details</div>
        <div><label className="text-[11px] text-neutral-400 block mb-1">Name</label><input type="text" value={data.teamName} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, teamProfileData: { ...data, teamName: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-sm font-bold text-white focus:border-cyan-400 focus:outline-none" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-[11px] text-neutral-400 block mb-1">Manager</label><input type="text" value={data.manager} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, teamProfileData: { ...data, manager: e.target.value } } } } })} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">League</label><input type="text" value={data.league} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, teamProfileData: { ...data, league: e.target.value } } } } })} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">League Rank</label><input type="text" value={data.leagueRank} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, teamProfileData: { ...data, leagueRank: e.target.value } } } } })} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
          <div><label className="text-[11px] text-neutral-400 block mb-1">Tactical Style</label><input type="text" value={data.tacticalStyleTag} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, teamProfileData: { ...data, tacticalStyleTag: e.target.value } } } } })} className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" /></div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-cyan-400">Tactical Summary</div>
        <textarea rows={3} value={data.tacticalSummary} onChange={e => onChange({ ...project, templates: { ...project.templates, [project.templateType]: { ...project.templates[project.templateType], content: { ...project.templates[project.templateType].content, teamProfileData: { ...data, tacticalSummary: e.target.value } } } } })} className="w-full px-3 py-2 rounded-lg bg-black/60 border border-neutral-700 text-xs text-white focus:border-cyan-400 focus:outline-none" />
      </div>
    </div>
  );
};

export const TemplateForms: React.FC<FormProps> = (props) => {
  const t = props.project.templateType;
  return (
    <>
      {t === 'match-preview' && <MatchPreviewForm {...props} />}
      {t === 'match-analysis' && <MatchAnalysisForm {...props} />}
      {t === 'tactical-analysis' && <TacticalAnalysisForm {...props} />}
      {t === 'stat-highlight' && <StatHighlightForm {...props} />}
      {t === 'ranking-top-list' && <RankingTopListForm {...props} />}
      {t === 'quote-opinion' && <QuoteOpinionForm {...props} />}
      {t === 'thread-cover' && <ThreadCoverForm {...props} />}
      {t === 'match-result' && <MatchResultForm {...props} />}
      {t === 'team-profile' && <TeamProfileForm {...props} />}
    </>
  );
};
