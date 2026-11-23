export const THEME_STORAGE_KEY = 'cheshuevo-theme'

export const THEME_MODES = ['day', 'night'] as const

export type TThemeMode = (typeof THEME_MODES)[number]

export const DEFAULT_THEME: TThemeMode = 'day'

export function isThemeMode(value: unknown): value is TThemeMode {
  return value === 'day' || value === 'night'
}

/** Applies theme to <html data-theme> for CSS tokens. */
export function applyThemeToDocument(theme: TThemeMode): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.dataset.theme = theme
}

export function readStoredTheme(): TThemeMode {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_THEME
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function persistTheme(theme: TThemeMode): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    /* private mode / blocked storage */
  }
}
