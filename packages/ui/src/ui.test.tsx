import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { AguyBrand } from './brand.js'
import { buildLocaleCookie, directionForLocale } from './locale.js'
import { resolveTheme } from './theme.js'

describe('shared UI contracts', () => {
  it('renders the shared A-Guy brand accessibly', () => {
    const html = renderToStaticMarkup(<AguyBrand label="A-Guy" />)
    expect(html).toContain('A-Guy')
    expect(html).toContain('aria-hidden="true"')
  })

  it('maps supported locales to the correct direction', () => {
    expect(directionForLocale('en')).toBe('ltr')
    expect(directionForLocale('he')).toBe('rtl')
  })

  it('creates a parent-domain locale cookie without exposing auth state', () => {
    expect(buildLocaleCookie('he', { rootDomain: 'aguy.co.il' })).toBe(
      'NEXT_LOCALE=he; Path=/; Max-Age=31536000; SameSite=Lax; Domain=.aguy.co.il; Secure',
    )
  })

  it('resolves automatic themes from the system preference', () => {
    expect(resolveTheme('auto', 'dark')).toBe('dark')
    expect(resolveTheme('light', 'dark')).toBe('light')
  })
})
