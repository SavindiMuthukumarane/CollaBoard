const prefix = 'collabboard_cache:';

export function readCache(key, fallback = null) {
  try {
    const raw = localStorage.getItem(`${prefix}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw).value ?? fallback;
  } catch (_error) {
    return fallback;
  }
}

export function writeCache(key, value) {
  try {
    localStorage.setItem(`${prefix}${key}`, JSON.stringify({ savedAt: new Date().toISOString(), value }));
  } catch (_error) {
    // The application remains usable when storage is unavailable or full.
  }
}

export function removeCache(key) {
  localStorage.removeItem(`${prefix}${key}`);
}