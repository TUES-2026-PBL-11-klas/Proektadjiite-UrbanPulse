const BASE_URL = process.env.NEXT_PUBLIC_API_URL

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers as Record<string, string> | undefined),
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.error ?? res.statusText)
  }
  return body as T
}

export function apiPost<T>(path: string, data: unknown, token?: string): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(data), token })
}

export function apiGet<T>(path: string, token?: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET', token })
}

export function apiPatch<T>(path: string, data: unknown, token?: string): Promise<T> {
  return apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(data), token })
}
