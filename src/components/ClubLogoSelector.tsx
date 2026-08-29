import React, { useState, useEffect, useRef } from 'react';
import { IconSearch, IconX, IconUpload, IconBuildingStadium } from '@tabler/icons-react';
import { searchWikidataClubs, fetchLogoAsDataUrl, ClubSearchResult } from '../services/clubSearch';

interface Props {
  currentLogoUrl?: string;
  label: string;
  onSelect: (dataUrl: string) => void;
  onRemove: () => void;
  onManualUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ClubLogoSelector: React.FC<Props> = ({ currentLogoUrl, label, onSelect, onRemove, onManualUpload }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.trim().length < 3) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await searchWikidataClubs(val);
      setResults(data.filter(c => c.logoUrl)); // Only show clubs with logos
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (club: ClubSearchResult) => {
    if (!club.logoUrl) return;
    setIsOpen(false);
    setQuery('');
    setResults([]);
    try {
      const dataUrl = await fetchLogoAsDataUrl(club.logoUrl);
      onSelect(dataUrl);
    } catch (err) {
      alert("Could not load the club logo.");
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex gap-2 items-center">
        {currentLogoUrl ? (
          <div className="flex items-center gap-2 p-2 bg-black/60 rounded border border-neutral-700 flex-1">
            <img src={currentLogoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            <span className="text-xs text-white truncate flex-1">{label} (Selected)</span>
            <button onClick={onRemove} className="p-1 hover:text-red-400 text-neutral-400">
              <IconX size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex-1 px-3 py-2 bg-black/60 border border-neutral-700 rounded text-xs text-neutral-400 flex items-center gap-2 hover:bg-neutral-800"
            >
              <IconBuildingStadium size={14} /> Search Club Database
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-500 flex-1 h-[1px] bg-neutral-800"></span>
              <span className="text-[10px] text-neutral-500">OR</span>
              <span className="text-[10px] text-neutral-500 flex-1 h-[1px] bg-neutral-800"></span>
            </div>
            <label className="flex-1 px-3 py-2 bg-black/60 border border-neutral-700 rounded text-xs text-neutral-400 flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800">
              <IconUpload size={14} /> Manual Upload
              <input type="file" accept="image/*" className="hidden" onChange={onManualUpload} />
            </label>
          </div>
        )}
      </div>

      {isOpen && !currentLogoUrl && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-neutral-800 flex items-center gap-2">
            <IconSearch size={14} className="text-neutral-400" />
            <input 
              type="text" 
              placeholder="e.g. Liverpool, Fenerbahçe..." 
              value={query}
              onChange={handleSearch}
              className="w-full bg-transparent text-xs text-white outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {loading && <div className="p-4 text-center text-xs text-neutral-400">Searching Wikidata...</div>}
            {error && <div className="p-4 text-center text-xs text-red-400">{error}</div>}
            {!loading && !error && query.length >= 3 && results.length === 0 && (
              <div className="p-4 text-center text-xs text-neutral-400">No clubs found with a logo.</div>
            )}
            {!loading && results.map((club) => (
              <button
                key={club.id}
                onClick={() => handleSelect(club)}
                className="w-full text-left p-2 hover:bg-neutral-800 flex items-center gap-3 border-b border-neutral-800/50"
              >
                {club.logoUrl && (
                  <img src={club.logoUrl} alt={club.name} className="w-6 h-6 object-contain bg-white/10 rounded-sm p-0.5" />
                )}
                <div>
                  <div className="text-xs font-bold text-white">{club.name}</div>
                  <div className="text-[10px] text-neutral-500">
                    {club.country} {club.league ? `• ${club.league}` : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
