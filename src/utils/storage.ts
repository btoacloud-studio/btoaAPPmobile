import { NusaLifeAppState } from '../types';
import { initialData } from '../data/initialData';

const STORAGE_KEY = 'nusalife_app_state_v1';

export function loadAppState(): NusaLifeAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppState(initialData);
      return initialData;
    }
    const parsed = JSON.parse(raw);
    return {
      ...initialData,
      ...parsed,
      profile: { ...initialData.profile, ...(parsed.profile || {}) },
    };
  } catch (err) {
    console.error('Error loading app state from localStorage:', err);
    return initialData;
  }
}

export function saveAppState(state: NusaLifeAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving app state to localStorage:', err);
  }
}

export function resetAppState(): NusaLifeAppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
    saveAppState(initialData);
  } catch (e) {
    console.error(e);
  }
  return initialData;
}

export function exportAppStateAsJson(state: NusaLifeAppState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NusaLife_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getStorageUsageBytes(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    return new Blob([raw]).size;
  } catch {
    return 0;
  }
}
