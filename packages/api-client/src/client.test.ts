import { describe, expect, it, vi } from 'vitest'

import { AguyApiError, createAguyApiClient, createLoginUrl, isUnauthorized } from './index.js'

describe('A-Guy API client', () => {
  it('forwards a server cookie without inspecting it', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ user: { id: 'u1' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const client = createAguyApiClient({
      baseUrl: 'https://www.aguy.co.il/',
      cookie: 'payload-token=opaque',
      fetch: fetcher,
    })

    await client.getCurrentUser()

    const [url, init] = fetcher.mock.calls[0] ?? []
    expect(url).toBe('https://www.aguy.co.il/api/users/me')
    expect(new Headers(init?.headers).get('cookie')).toBe('payload-token=opaque')
    expect(init?.credentials).toBe('include')
    expect(init?.cache).toBe('no-store')
  })

  it('can preserve the raw upstream response for secure cookie proxying', async () => {
    const upstream = new Response(null, {
      status: 204,
      headers: { 'set-cookie': 'payload-token=; Max-Age=0' },
    })
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(upstream)
    const client = createAguyApiClient({ cookie: 'payload-token=opaque', fetch: fetcher })

    const response = await client.requestRaw('/api/auth/logout', { method: 'POST' })

    expect(response).toBe(upstream)
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
  })

  it('returns one typed unauthorized error without retrying', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    )
    const client = createAguyApiClient({ fetch: fetcher })

    const error = await client.getCurrentUser().catch((value: unknown) => value)

    expect(error).toBeInstanceOf(AguyApiError)
    expect(isUnauthorized(error)).toBe(true)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('rejects non-platform API paths', async () => {
    const client = createAguyApiClient({ fetch: vi.fn<typeof fetch>() })
    await expect(client.request('/login')).rejects.toThrow('must start with /api/')
  })

  it('builds login URLs only for trusted sibling destinations', () => {
    expect(createLoginUrl('https://dash.aguy.co.il/?period=month')).toContain(
      'returnTo=https%3A%2F%2Fdash.aguy.co.il%2F%3Fperiod%3Dmonth',
    )
    expect(() => createLoginUrl('https://not-aguy.example/')).toThrow('A-Guy subdomain')
  })
})
