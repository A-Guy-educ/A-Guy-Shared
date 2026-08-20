'use client'

export type Locale = 'en' | 'he'

export interface LocaleCookieOptions {
  rootDomain?: string
  secure?: boolean
  maxAgeSeconds?: number
}

export interface LocaleSwitcherProps {
  locale: Locale
  labels?: Partial<Record<Locale, string>>
  onLocaleChange: (locale: Locale) => void
  ariaLabel?: string
}

const supportedLocales: readonly Locale[] = ['en', 'he']

export function directionForLocale(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'he' ? 'rtl' : 'ltr'
}

export function buildLocaleCookie(locale: Locale, options: LocaleCookieOptions = {}): string {
  const maxAge = options.maxAgeSeconds ?? 60 * 60 * 24 * 365
  const segments = [`NEXT_LOCALE=${locale}`, 'Path=/', `Max-Age=${maxAge}`, 'SameSite=Lax']

  if (options.rootDomain) segments.push(`Domain=.${options.rootDomain.replace(/^\./, '')}`)
  if (options.secure ?? true) segments.push('Secure')

  return segments.join('; ')
}

export function applyLocale(locale: Locale, options: LocaleCookieOptions = {}): void {
  document.documentElement.lang = locale
  document.documentElement.dir = directionForLocale(locale)
  document.cookie = buildLocaleCookie(locale, options)
}

export function LocaleSwitcher({
  locale,
  labels = { en: 'English', he: 'עברית' },
  onLocaleChange,
  ariaLabel = 'Language',
}: LocaleSwitcherProps) {
  return (
    <label className="aguy-control aguy-locale-control">
      <span className="aguy-sr-only">{ariaLabel}</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="aguy-control__icon">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path
          d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <select
        aria-label={ariaLabel}
        className="aguy-control__select"
        value={locale}
        onChange={(event) => {
          const next = event.currentTarget.value
          if (supportedLocales.includes(next as Locale)) onLocaleChange(next as Locale)
        }}
      >
        {supportedLocales.map((value) => (
          <option key={value} value={value}>
            {labels[value] ?? value}
          </option>
        ))}
      </select>
    </label>
  )
}
