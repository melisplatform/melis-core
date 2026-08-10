// Persist the sidebar accordion open/closed state across a full reload, keyed by nav node key.
// Only nodes the user has EXPLICITLY toggled are recorded; untouched nodes fall back to their
// defaultOpen. Mirrors the sessionStorage approach used by the tab store (tabs/tab-store.tsx),
// so after a reload the left menu reopens exactly as it was instead of resetting to the default.
const STORAGE_KEY = 'melis-nav-open'

type OpenMap = Record<string, boolean>

function read(): OpenMap {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as OpenMap
  } catch {
    /* storage unavailable / malformed */
  }
  return {}
}

function write(map: OpenMap): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* best-effort */
  }
}

/** Resolved open state for a node: the persisted value if the user has toggled it, else defaultOpen. */
export function getNavOpen(key: string, defaultOpen: boolean): boolean {
  const map = read()
  return key in map ? map[key] : defaultOpen
}

/** Record an explicit open/closed choice for a node so it survives the next reload. */
export function setNavOpen(key: string, open: boolean): void {
  const map = read()
  map[key] = open
  write(map)
}
