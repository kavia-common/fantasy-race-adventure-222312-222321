import { getEnv } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Internal: normalize base URL from env.
 * Prefers REACT_APP_API_BASE, then REACT_APP_BACKEND_URL.
 */
function getBaseUrl() {
  const { apiBase, backendUrl } = getEnv();
  const base = apiBase || backendUrl || '';
  return base.replace(/\/+$/, '');
}

/**
 * Build final request URL by joining base and path, and appending query.
 */
function buildUrl(path, query) {
  const base = getBaseUrl();
  const cleanPath = String(path || '').replace(/^\/+/, '');
  const url = base ? `${base}/${cleanPath}` : `/${cleanPath}`;
  if (!query || typeof query !== 'object' || Array.isArray(query)) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) {
      v.forEach((item) => params.append(k, String(item)));
    } else if (typeof v === 'object') {
      params.append(k, JSON.stringify(v));
    } else {
      params.append(k, String(v));
    }
  });
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Create an AbortController tied to a timeout in ms.
 */
function withTimeout(timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, cleanup: () => clearTimeout(timeout) };
}

/**
 * Convert object to JSON-safe body and set headers.
 */
function normalizeBodyAndHeaders(body, headers = {}) {
  const h = new Headers(headers);
  if (body !== undefined && body !== null) {
    if (!h.has('Content-Type')) {
      h.set('Content-Type', 'application/json');
    }
    if (h.get('Content-Type')?.includes('application/json') && typeof body !== 'string') {
      return { body: JSON.stringify(body), headers: h };
    }
    return { body, headers: h };
  }
  return { body: undefined, headers: h };
}

/**
 * Attempt to parse JSON safely. Falls back to text if parsing fails.
 */
async function safeParse(resp) {
  const ct = resp.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  try {
    if (isJson) return await resp.json();
    const text = await resp.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    logger.debug('[http] parse error', err);
    return null;
  }
}

/**
 * Normalize an error into a consistent shape.
 */
function normalizeError(err, extra = {}) {
  const code = err?.name === 'AbortError' ? 'ABORTED' : (err?.code || 'HTTP_ERROR');
  return {
    code,
    message: err?.message || 'Request failed',
    cause: err,
    ...extra,
  };
}

/**
 * PUBLIC_INTERFACE
 * A robust HTTP fetch wrapper with JSON parsing, error handling, timeouts, and logging.
 * @param {Object} options - Request options
 * @param {string} options.path - API path (joined to API base)
 * @param {('GET'|'POST'|'PUT'|'PATCH'|'DELETE')} [options.method='GET'] - HTTP method
 * @param {Object} [options.query] - Query parameters object
 * @param {any} [options.body] - Request body (object will be JSON stringified)
 * @param {Object} [options.headers] - Additional headers
 * @param {number} [options.timeoutMs=10000] - Timeout in milliseconds
 * @param {boolean} [options.credentials=false] - Whether to send credentials
 * @returns {Promise<{ok:boolean,status:number,data:any,headers:Headers,url:string}>}
 */
export async function httpRequest({
  path,
  method = 'GET',
  query,
  body,
  headers,
  timeoutMs = 10000,
  credentials = false,
} = {}) {
  const url = buildUrl(path, query);
  const { body: finalBody, headers: finalHeaders } = normalizeBodyAndHeaders(body, headers);
  const { controller, cleanup } = withTimeout(timeoutMs);

  const fetchOptions = {
    method,
    headers: finalHeaders,
    signal: controller.signal,
  };
  if (finalBody !== undefined) fetchOptions.body = finalBody;
  if (credentials) fetchOptions.credentials = 'include';

  logger.trace('[http] request', method, url, fetchOptions);

  try {
    const resp = await fetch(url, fetchOptions);
    const data = await safeParse(resp);

    if (!resp.ok) {
      const errObj = normalizeError(new Error(`HTTP ${resp.status}`), { status: resp.status, data, url });
      logger.warn('[http] non-ok response', errObj);
      return { ok: false, status: resp.status, data, headers: resp.headers, url };
    }

    return { ok: true, status: resp.status, data, headers: resp.headers, url };
  } catch (err) {
    const e = normalizeError(err, { url });
    logger.error('[http] error', e);
    return { ok: false, status: 0, data: null, headers: new Headers(), url };
  } finally {
    cleanup();
  }
}

/**
 * PUBLIC_INTERFACE
 * Shorthand helpers for common HTTP verbs.
 */

/** Perform a GET request. */
export function httpGet(path, query, options = {}) {
  return httpRequest({ path, method: 'GET', query, ...options });
}

/** Perform a POST request. */
export function httpPost(path, body, options = {}) {
  return httpRequest({ path, method: 'POST', body, ...options });
}

/** Perform a PUT request. */
export function httpPut(path, body, options = {}) {
  return httpRequest({ path, method: 'PUT', body, ...options });
}

/** Perform a PATCH request. */
export function httpPatch(path, body, options = {}) {
  return httpRequest({ path, method: 'PATCH', body, ...options });
}

/** Perform a DELETE request. */
export function httpDelete(path, query, options = {}) {
  return httpRequest({ path, method: 'DELETE', query, ...options });
}
