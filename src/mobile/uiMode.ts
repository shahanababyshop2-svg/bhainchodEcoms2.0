import { useCallback, useSyncExternalStore } from 'react';
import { PHONE_MAX_WIDTH, UiMode, parseUiMode, shouldShowMobileUi } from '../utils/mobileUi';

// Which UI a visitor sees:
//   - screens 768px and wider: always the original UI
//   - phones: the new phone UI, unless they switched to "Classic view" in the menu
// The Classic choice is remembered in the browser (localStorage key below).

const STORAGE_KEY = 'sbs_ui_mode';
const CHANGE_EVENT = 'sbs-ui-mode-change';
const PHONE_QUERY = `(max-width: ${PHONE_MAX_WIDTH}px)`;

// used when the browser blocks localStorage, so the switch still works until the tab is closed
let memoryMode: UiMode | null = null;

function readMode(): UiMode {
  try {
    return parseUiMode(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return memoryMode ?? 'new';
  }
}

export function setUiMode(mode: UiMode): void {
  memoryMode = mode;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // storage blocked: memoryMode above keeps it for this visit
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribePhone(onChange: () => void): () => void {
  const mq = window.matchMedia(PHONE_QUERY);
  if (mq.addEventListener) {
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }
  // very old Safari
  mq.addListener(onChange);
  return () => mq.removeListener(onChange);
}

function subscribeMode(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

const getPhone = () => window.matchMedia(PHONE_QUERY).matches;
const getPhoneOnServer = () => false;
const getModeOnServer = (): UiMode => 'new';

export function useUiMode() {
  const isPhone = useSyncExternalStore(subscribePhone, getPhone, getPhoneOnServer);
  const mode = useSyncExternalStore(subscribeMode, readMode, getModeOnServer);
  const setMode = useCallback((m: UiMode) => setUiMode(m), []);
  return {
    isPhone,
    mode,
    showMobileUi: shouldShowMobileUi(isPhone, mode),
    setMode,
  };
}
