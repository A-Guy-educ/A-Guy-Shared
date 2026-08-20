export const DEFAULT_API_BASE_URL = 'https://api.aguy.co.il'
export const LEGACY_API_BASE_URL = 'https://www.aguy.co.il'
export const WEB_APP_URL = 'https://www.aguy.co.il'

export type ApiValidator<T> = (value: unknown) => T

export interface AguyApiClientOptions {
  baseUrl?: string
  cookie?: string | null
  fetch?: typeof globalThis.fetch
}

export interface ApiRequestOptions<T> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: HeadersInit
  validate?: ApiValidator<T>
}

export interface CurrentUser {
  id: string
  email?: string
  name?: string
  roles?: string[]
}

export interface CurrentUserResponse {
  user: CurrentUser
}

export class AguyApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = 'AguyApiError'
    this.status = status
    this.body = body
  }
}

function normalizedBaseUrl(value: string): string {
  return value.replace(/\/+$/, '')
}

function safeReturnTo(returnTo: string): string {
  const url = new URL(returnTo)
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.aguy.co.il')) {
    throw new Error('returnTo must be an HTTPS A-Guy subdomain URL')
  }
  return url.toString()
}

export function createLoginUrl(returnTo: string, webAppUrl = WEB_APP_URL): string {
  const url = new URL('/login', webAppUrl)
  url.searchParams.set('returnTo', safeReturnTo(returnTo))
  return url.toString()
}

export function isUnauthorized(error: unknown): error is AguyApiError {
  return error instanceof AguyApiError && error.status === 401
}

export function createAguyApiClient(options: AguyApiClientOptions = {}) {
  const baseUrl = normalizedBaseUrl(options.baseUrl ?? DEFAULT_API_BASE_URL)
  const fetcher = options.fetch ?? globalThis.fetch

  async function request<T>(path: string, requestOptions: ApiRequestOptions<T> = {}): Promise<T> {
    if (!path.startsWith('/api/')) throw new Error('A-Guy API paths must start with /api/')

    const headers = new Headers(requestOptions.headers)
    headers.set('accept', 'application/json')
    if (options.cookie) headers.set('cookie', options.cookie)
    if (requestOptions.body !== undefined) headers.set('content-type', 'application/json')

    const response = await fetcher(`${baseUrl}${path}`, {
      method: requestOptions.method ?? 'GET',
      body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body),
      credentials: 'include',
      headers,
      cache: 'no-store',
      redirect: 'manual',
    })

    const contentType = response.headers.get('content-type') ?? ''
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      throw new AguyApiError(response.status, `A-Guy API request failed (${response.status})`, body)
    }

    return requestOptions.validate ? requestOptions.validate(body) : (body as T)
  }

  return {
    request,
    getCurrentUser: (validate?: ApiValidator<CurrentUserResponse>) =>
      request<CurrentUserResponse>('/api/users/me', { validate }),
    logout: () => request<unknown>('/api/auth/logout', { method: 'POST' }),
  }
}
