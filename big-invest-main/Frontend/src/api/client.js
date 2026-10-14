export class ApiError extends Error {
  constructor(message, { status = 0, errors = {}, retryAfter = 0 } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.retryAfter = retryAfter;
  }
}

export function retryAfterSeconds(value, now = Date.now()) {
  if (!value) return 60;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(1, Math.ceil(seconds));
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(1, Math.ceil((date - now) / 1000)) : 60;
}

export async function postJson(path, payload, { signal, baseUrl = import.meta.env?.VITE_API_BASE_URL, fetchImpl = globalThis.fetch } = {}) {
  if (!baseUrl) throw new ApiError('The submission service is not configured. Please try again later.');
  let response;
  try {
    response = await fetchImpl(`${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`, {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Unable to connect. Please check your connection and try again.');
  }
  let body;
  try { body = await response.json(); } catch { body = null; }
  if (!response.ok) {
    const status = response.status;
    const retryAfter = status === 429 ? retryAfterSeconds(response.headers.get('Retry-After')) : 0;
    const message = status === 429 ? `Too many attempts. Please try again in ${retryAfter} seconds.`
      : status >= 500 ? 'The service is temporarily unavailable. Please try again later.'
        : body?.message || 'Your submission could not be processed. Please try again.';
    throw new ApiError(message, { status, errors: body?.errors || {}, retryAfter });
  }
  if (body?.success !== true) throw new ApiError('The service returned an unexpected response. Please try again later.', { status: response.status });
  return body;
}

export function fieldErrors(error, fields) {
  return Object.fromEntries(fields.filter(field => error.errors?.[field]).map(field => {
    const value = error.errors[field];
    return [field, Array.isArray(value) ? value.join(' ') : String(value)];
  }));
}
