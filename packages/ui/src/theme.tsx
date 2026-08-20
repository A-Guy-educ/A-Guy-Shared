'use client'

import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light' | 'dark'
export type ThemeChoice = Theme | 'auto'

export interface ThemeSelectorLabels {
  label: string
  auto: string
  light: string
  dark: string
}

interface ThemeContextValue {
  choice: ThemeChoice
  resolvedTheme: Theme
  setTheme: (choice: ThemeChoice) => void
}

const storageKey = 'payload-theme'
const ThemeContext = createContext<ThemeContextValue | null>(null)

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(choice: ThemeChoice, preferred: Theme = 'light'): Theme {
  return choice === 'auto' ? preferred : choice
}

function storedChoice(): ThemeChoice {
  const stored = window.localStorage.getItem(storageKey)
  return stored === 'light' || stored === 'dark' ? stored : 'auto'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ThemeChoice>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<Theme>('light')

  const setTheme = useCallback((nextChoice: ThemeChoice) => {
    const nextResolved = resolveTheme(nextChoice, systemTheme())
    setChoice(nextChoice)
    setResolvedTheme(nextResolved)
    document.documentElement.dataset.theme = nextResolved

    if (nextChoice === 'auto') window.localStorage.removeItem(storageKey)
    else window.localStorage.setItem(storageKey, nextChoice)
  }, [])

  useEffect(() => {
    setTheme(storedChoice())

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (storedChoice() === 'auto') setTheme('auto')
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [setTheme])

  return <ThemeContext value={{ choice, resolvedTheme, setTheme }}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const value = use(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside ThemeProvider')
  return value
}

export function ThemeSelector({
  labels = { label: 'Theme', auto: 'Auto', light: 'Light', dark: 'Dark' },
}: {
  labels?: ThemeSelectorLabels
}) {
  const { choice, setTheme } = useTheme()

  return (
    <label className="aguy-control aguy-theme-control">
      <span className="aguy-sr-only">{labels.label}</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="aguy-control__icon">
        <path
          d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
      <select
        aria-label={labels.label}
        className="aguy-control__select"
        value={choice}
        onChange={(event) => setTheme(event.currentTarget.value as ThemeChoice)}
      >
        <option value="auto">{labels.auto}</option>
        <option value="light">{labels.light}</option>
        <option value="dark">{labels.dark}</option>
      </select>
    </label>
  )
}

const themeScript = `(function(){try{var v=localStorage.getItem('${storageKey}');var t=v==='light'||v==='dark'?v:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})();`

export function ThemeInitScript() {
  return <script id="aguy-theme-init" dangerouslySetInnerHTML={{ __html: themeScript }} />
}
