import { CLUB_CATALOGUE } from './clubCatalogue';

const DATALIST_ID = 'bbo-transfer-club-options';

function ensureDatalist() {
  let datalist = document.getElementById(DATALIST_ID) as HTMLDataListElement | null;
  if (datalist) return datalist;

  datalist = document.createElement('datalist');
  datalist.id = DATALIST_ID;

  const seen = new Set<string>();
  for (const club of CLUB_CATALOGUE) {
    const name = club.name.trim();
    if (!name || seen.has(name.toLocaleLowerCase())) continue;
    seen.add(name.toLocaleLowerCase());
    const option = document.createElement('option');
    option.value = name;
    option.label = [club.country, club.league].filter(Boolean).join(' • ');
    datalist.appendChild(option);
  }

  document.body.appendChild(datalist);
  return datalist;
}

function connectTransferInputs() {
  ensureDatalist();
  const labels = Array.from(document.querySelectorAll('label'));
  for (const label of labels) {
    const text = label.textContent?.trim();
    if (text !== 'From Club' && text !== 'To Club') continue;
    const container = label.parentElement;
    const input = container?.querySelector('input[type="text"]') as HTMLInputElement | null;
    if (!input) continue;
    input.setAttribute('list', DATALIST_ID);
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('placeholder', text === 'From Club' ? 'Kulüp ara veya seç' : 'Kulüp ara veya seç');
  }
}

export function attachTransferClubAutocomplete() {
  if (typeof document === 'undefined') return () => undefined;

  connectTransferInputs();
  const observer = new MutationObserver(() => connectTransferInputs());
  observer.observe(document.body, { childList: true, subtree: true });

  return () => observer.disconnect();
}
