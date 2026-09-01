import React, { useEffect, useMemo, useState } from 'react';
import {
  IconBuildingStadium,
  IconSearch,
  IconTrophy,
  IconX,
} from '@tabler/icons-react';
import { Project } from '../types';
import {
  CLUB_CATALOGUE,
  ClubCatalogueEntry,
  searchLocalClubCatalogue,
} from '../services/clubCatalogue';
import {
  COMPETITION_CATALOGUE,
  CompetitionCatalogueEntry,
  competitionTypeLabel,
  displayCompetitionName,
  displayCompetitionRegion,
  resolveCompetitionLogoUrl,
  searchCompetitionCatalogue,
} from '../services/competitionCatalogue';
import { materializeEntityImage } from '../services/entityLogo';
import {
  EntityKind,
  EntityTargetKey,
  applyClubEntitySelection,
  applyCompetitionEntitySelection,
  getEntityTargets,
} from '../services/entitySelection';

interface Props {
  open: boolean;
  project: Project;
  onChange: (project: Project) => void;
  onClose: () => void;
  isTr: boolean;
}

function initials(value: string): string {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('tr-TR')
    .slice(0, 3);
}

const LogoPreview: React.FC<{ src?: string | null; name: string }> = ({ src, name }) => (
  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 text-[10px] font-black text-neutral-400">
    <span>{initials(name)}</span>
    {src ? (
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-contain bg-neutral-950/90 p-1"
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={(event) => { event.currentTarget.style.display = 'none'; }}
      />
    ) : null}
  </div>
);

export const EntityDatabaseModal: React.FC<Props> = ({
  open,
  project,
  onChange,
  onClose,
  isTr,
}) => {
  const [mode, setMode] = useState<EntityKind>('club');
  const [query, setQuery] = useState('');
  const [targetKey, setTargetKey] = useState<EntityTargetKey | ''>('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const language: 'tr' | 'en' = isTr ? 'tr' : 'en';

  const targets = useMemo(
    () => getEntityTargets(project, mode),
    [project.templateType, project.templates, mode],
  );

  useEffect(() => {
    const stillValid = targets.some((target) => target.key === targetKey);
    if (!stillValid) setTargetKey(targets[0]?.key || '');
  }, [targets, targetKey]);

  useEffect(() => {
    if (!open) return;
    setStatus('');
  }, [open, mode, project.templateType]);

  const clubResults = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    return searchLocalClubCatalogue(trimmed, 36);
  }, [query]);

  const competitionResults = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];
    return searchCompetitionCatalogue(trimmed, 36);
  }, [query]);

  if (!open) return null;

  const selectClub = async (club: ClubCatalogueEntry) => {
    if (!targetKey || applyingId) return;
    setApplyingId(club.id);
    try {
      const visual = await materializeEntityImage(club.logoUrl, club.name);
      onChange(applyClubEntitySelection(project, targetKey, club, visual, true));
      setStatus(isTr ? `${club.name} seçili slota uygulandı.` : `${club.name} applied to the selected slot.`);
    } finally {
      setApplyingId(null);
    }
  };

  const selectCompetition = async (competition: CompetitionCatalogueEntry) => {
    if (!targetKey || applyingId) return;
    setApplyingId(competition.id);
    try {
      const remoteLogo = await resolveCompetitionLogoUrl(competition);
      const visual = await materializeEntityImage(remoteLogo || competition.logoUrl, competition.canonicalName);
      onChange(applyCompetitionEntitySelection(project, targetKey, competition, visual, language, true));
      const label = displayCompetitionName(competition, language);
      setStatus(isTr ? `${label} seçili slota uygulandı.` : `${label} applied to the selected slot.`);
    } finally {
      setApplyingId(null);
    }
  };

  const resultCount = mode === 'club' ? clubResults.length : competitionResults.length;
  const catalogueSize = mode === 'club' ? CLUB_CATALOGUE.length : COMPETITION_CATALOGUE.length;

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center bg-black/80 p-3 sm:p-6" data-testid="entity-database-modal">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 px-4 py-4 sm:px-5">
          <div>
            <div className="text-sm font-black uppercase tracking-[0.14em] text-sky-300">
              {isTr ? 'Kulüp & Turnuva Veritabanı' : 'Club & Competition Database'}
            </div>
            <div className="mt-1 text-[11px] text-neutral-500">
              {isTr
                ? 'Katalog seçimi yalnızca seçili semantic slotu ve güvenle eşleştirilebilen ilgili kimlik metnini değiştirir.'
                : 'Catalogue selection changes only the selected semantic slot and safely mapped identity text.'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-800 p-2 text-neutral-400 hover:border-neutral-600 hover:text-white"
            data-testid="entity-database-close"
            aria-label={isTr ? 'Kapat' : 'Close'}
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="border-b border-neutral-800 p-4 md:border-b-0 md:border-r">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
              <button
                type="button"
                onClick={() => { setMode('club'); setQuery(''); }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${mode === 'club' ? 'border-sky-500 bg-sky-500/10 text-sky-200' : 'border-neutral-800 bg-neutral-900 text-neutral-400'}`}
                data-testid="entity-mode-club"
              >
                <IconBuildingStadium size={16} />
                {isTr ? 'Kulüpler' : 'Clubs'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('competition'); setQuery(''); }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-bold ${mode === 'competition' ? 'border-amber-500 bg-amber-500/10 text-amber-200' : 'border-neutral-800 bg-neutral-900 text-neutral-400'}`}
                data-testid="entity-mode-competition"
              >
                <IconTrophy size={16} />
                {isTr ? 'Turnuvalar / Ligler' : 'Competitions / Leagues'}
              </button>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-neutral-500">
                {isTr ? 'Hedef Semantic Slot' : 'Target Semantic Slot'}
              </label>
              <select
                value={targetKey}
                onChange={(event) => setTargetKey(event.target.value as EntityTargetKey)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-xs text-white outline-none focus:border-sky-600"
                data-testid="entity-target"
              >
                {targets.map((target) => (
                  <option key={target.key} value={target.key}>
                    {isTr ? target.labelTr : target.labelEn}
                  </option>
                ))}
              </select>
              {targets.length === 0 ? (
                <div className="mt-2 text-[10px] leading-relaxed text-amber-400">
                  {isTr ? 'Bu şablonda bu entity türü için uygun slot yok.' : 'This template has no compatible slot for this entity type.'}
                </div>
              ) : null}
            </div>

            <div className="mt-4 rounded-lg border border-neutral-800 bg-black/30 p-3 text-[10px] leading-relaxed text-neutral-500">
              <div className="font-bold text-neutral-300">{catalogueSize} {isTr ? 'kayıt' : 'records'}</div>
              <div className="mt-1">
                {isTr
                  ? 'Kulüpler ülke ve lig bilgisiyle gelir. Turnuvalar canonical ad, TR/EN ad, bölge, tür ve varsa gerçek logo kaynağı taşır.'
                  : 'Clubs include country and league. Competitions carry canonical name, TR/EN names, region, type and a real logo source when available.'}
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="border-b border-neutral-800 p-4">
              <div className="relative">
                <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={mode === 'club'
                    ? (isTr ? 'Fenerbahçe, Liverpool, Benfica…' : 'Fenerbahçe, Liverpool, Benfica…')
                    : (isTr ? 'Şampiyonlar Ligi, Süper Lig…' : 'Champions League, Premier League…')}
                  className="w-full rounded-xl border border-neutral-700 bg-black/50 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-500"
                  data-testid="entity-search"
                  autoFocus
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500">
                <span>{query.trim().length < 2 ? (isTr ? 'Aramak için en az 2 karakter yaz.' : 'Type at least 2 characters to search.') : `${resultCount} ${isTr ? 'sonuç' : 'results'}`}</span>
                {status ? <span className="font-bold text-emerald-400" data-testid="entity-applied-status">{status}</span> : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              {mode === 'club' ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {clubResults.map((club) => (
                    <button
                      type="button"
                      key={`${club.id}-${club.country}`}
                      onClick={() => selectClub(club)}
                      disabled={!targetKey || Boolean(applyingId)}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 text-left hover:border-sky-700 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                      data-entity-id={club.id}
                      data-entity-name={club.name}
                    >
                      <LogoPreview src={club.logoUrl} name={club.name} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-black text-white">{club.name}</div>
                        <div className="mt-0.5 truncate text-[10px] text-neutral-500">{club.country}{club.league ? ` • ${club.league}` : ''}</div>
                      </div>
                      {applyingId === club.id ? <span className="text-[9px] font-bold text-sky-300">{isTr ? 'Uygulanıyor' : 'Applying'}</span> : null}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {competitionResults.map((competition) => {
                    const label = displayCompetitionName(competition, language);
                    return (
                      <button
                        type="button"
                        key={competition.id}
                        onClick={() => selectCompetition(competition)}
                        disabled={!targetKey || Boolean(applyingId)}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 text-left hover:border-amber-700 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                        data-entity-id={competition.id}
                        data-entity-name={label}
                      >
                        <LogoPreview src={competition.logoUrl} name={label} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-black text-white">{label}</div>
                          <div className="mt-0.5 truncate text-[10px] text-neutral-500">
                            {displayCompetitionRegion(competition, language)} • {competitionTypeLabel(competition.type, language)}
                          </div>
                          {language === 'tr' && competition.displayNameTr !== competition.canonicalName ? (
                            <div className="mt-0.5 truncate text-[9px] text-neutral-600">{competition.canonicalName}</div>
                          ) : null}
                        </div>
                        {applyingId === competition.id ? <span className="text-[9px] font-bold text-amber-300">{isTr ? 'Uygulanıyor' : 'Applying'}</span> : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {query.trim().length >= 2 && resultCount === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-500">
                  {isTr ? 'Eşleşen kayıt bulunamadı.' : 'No matching catalogue record found.'}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
