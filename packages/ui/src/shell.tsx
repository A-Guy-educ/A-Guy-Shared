'use client'

import { useState, type ReactNode } from 'react'

import { AguyBrand } from './brand.js'
import { LocaleSwitcher, type Locale } from './locale.js'
import { ThemeSelector, type ThemeSelectorLabels } from './theme.js'

export interface AppNavItem {
  href: string
  label: string
  current?: boolean
}

export interface AppShellHeaderProps {
  appName: string
  brandHref?: string
  brandLabel?: string
  locale: Locale
  navItems?: readonly AppNavItem[]
  onLocaleChange: (locale: Locale) => void
  localeLabels?: Partial<Record<Locale, string>>
  themeLabels?: ThemeSelectorLabels
  menuLabel?: string
  actions?: ReactNode
}

export function AppShellHeader({
  appName,
  brandHref = 'https://www.aguy.co.il/',
  brandLabel = 'A-Guy',
  locale,
  navItems = [],
  onLocaleChange,
  localeLabels,
  themeLabels,
  menuLabel = 'Menu',
  actions,
}: AppShellHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="aguy-shell-header">
      <div className="aguy-shell-header__inner">
        <a className="aguy-shell-header__brand" href={brandHref}>
          <AguyBrand label={brandLabel} />
          <span className="aguy-shell-header__divider" aria-hidden="true" />
          <span className="aguy-shell-header__app-name">{appName}</span>
        </a>

        {navItems.length > 0 ? (
          <nav className="aguy-shell-nav aguy-shell-nav--desktop" aria-label={appName}>
            {navItems.map((item) => (
              <a
                aria-current={item.current ? 'page' : undefined}
                className="aguy-shell-nav__link"
                href={item.href}
                key={`${item.href}-${item.label}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}

        <div className="aguy-shell-header__controls">
          <LocaleSwitcher locale={locale} labels={localeLabels} onLocaleChange={onLocaleChange} />
          <ThemeSelector labels={themeLabels} />
          {actions}
          <button
            aria-expanded={menuOpen}
            aria-label={menuLabel}
            className="aguy-menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="aguy-mobile-panel">
          <nav className="aguy-shell-nav aguy-shell-nav--mobile" aria-label={appName}>
            {navItems.map((item) => (
              <a
                aria-current={item.current ? 'page' : undefined}
                className="aguy-shell-nav__link"
                href={item.href}
                key={`${item.href}-${item.label}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}

export interface AppShellProps extends AppShellHeaderProps {
  children: ReactNode
  footer?: ReactNode
  skipLabel?: string
}

export function AppShell({
  children,
  footer,
  skipLabel = 'Skip to content',
  ...header
}: AppShellProps) {
  return (
    <div className="aguy-app-shell">
      <a className="aguy-skip-link" href="#main-content">
        {skipLabel}
      </a>
      <AppShellHeader {...header} />
      <main className="aguy-app-shell__main" id="main-content">
        {children}
      </main>
      {footer ? <footer className="aguy-app-shell__footer">{footer}</footer> : null}
    </div>
  )
}
