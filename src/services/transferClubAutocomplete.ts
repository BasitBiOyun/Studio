import { CLUB_CATALOGUE } from './clubCatalogue';
import { getOutputLanguage, subscribeOutputLanguage } from './outputLanguage';

const DATALIST_ID = 'bbo-transfer-club-options';
const FROM_LABELS = new Set(['From Club', 'Ayrıldığı Kulüp']);
const TO_LABELS = new Set(['To Club', 'Yeni Kulüp']);

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
  const language = getOutputLanguage();
  const labels = Array.from(document.querySelectorAll('label'));

  for (const label of labels) {
    const text = label.textContent?.trim() || '';
    const isFrom = FROM_LABELS.has(text);
    const isTo = TO_LABELS.has(text);
    if (!isFrom && !isTo) continue;

    const container = label.parentElement;
    const input = container?.querySelector('input[type="text"]') as HTMLInputElement | null;
    if (!input) continue;

    const desiredLabel = language === 'tr'
      ? (isFrom ? 'Ayrıldığı Kulüp' : 'Yeni Kulüp')
      : (isFrom ? 'From Club' : 'To Club');

    // Changing textContent creates a childList mutation. Only write when the
    // value actually changes so the observer cannot trigger itself forever.
    if (label.textContent !== desiredLabel) {
      label.textContent = desiredLabel;
    }

    if (input.getAttribute('list') !== DATALIST_ID) input.setAttribute('list', DATALIST_ID);
    if (input.getAttribute('autocomplete') !== 'off') input.setAttribute('autocomplete', 'off');

    const desiredPlaceholder = language === 'tr' ? 'Kulüp ara veya seç' : 'Search or select club';
    if (input.getAttribute('placeholder') !== desiredPlaceholder) {
      input.setAttribute('placeholder', desiredPlaceholder);
    }
  }
}

export function attachTransferClubAutocomplete() {
  if (typeof document === 'undefined') return () => undefined;

  let frameId: number | null = null;
  const scheduleConnect = () => {
    if (frameId !== null) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      connectTransferInputs();
    });
  };

  connectTransferInputs();
  const observer = new MutationObserver(scheduleConnect);
  observer.observe(document.body, { childList: true, subtree: true });
  const unsubscribeLanguage = subscribeOutputLanguage(scheduleConnect);

  return () => {
    observer.disconnect();
    unsubscribeLanguage();
    if (frameId !== null) window.cancelAnimationFrame(frameId);
  };
}
