let csrfToken;
export class AdminError extends Error {
  constructor(message, status, errors = {}, retryAfter = 0) { super(message); this.status = status; this.errors = errors; this.retryAfter = retryAfter; }
}
export async function adminApi(path, { method = 'GET', body, signal, download = false } = {}) {
  if (method !== 'GET' && !csrfToken) {
    const result = await adminApi('/csrf'); csrfToken = result.token;
  }
  let response;
  try {
    response = await fetch(`/api/admin${path}`, { method, credentials: 'same-origin', signal,
      headers: { Accept: 'application/json', ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(method !== 'GET' ? { 'X-CSRF-TOKEN': csrfToken } : {}) },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  } catch (error) { if (error.name === 'AbortError') throw error; throw new AdminError('Unable to connect to the admin service.', 0); }
  if (download && response.ok) return response.blob();
  let payload; try { payload = await response.json(); } catch { payload = {}; }
  if (!response.ok) {
    if (response.status === 419) csrfToken = null;
    const retryAfter = Number(response.headers.get('Retry-After')) || 60;
    throw new AdminError(response.status >= 500 ? 'The service is temporarily unavailable.' : response.status === 429 ? `Too many attempts. Try again in ${retryAfter} seconds.` : payload.message || 'Request failed.', response.status, payload.errors, retryAfter);
  }
  if (path === '/login' || path === '/logout') csrfToken = null;
  return payload.data;
}
export async function exportCsv(path, filename) {
  const blob = await adminApi(path, { download: true });
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}
