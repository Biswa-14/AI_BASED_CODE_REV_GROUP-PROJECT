export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export function buildApiUrl(path) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function readJsonResponse(response) {
  const text = await response.text();
  const payload = text ? safelyParseJson(text) : {};

  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed with status ${response.status}.`);
  }

  return payload;
}

export async function fetchJson(path, options = {}, fallbackMessage = 'Unable to reach the server.') {
  try {
    const response = await fetch(buildApiUrl(path), options);
    return await readJsonResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(fallbackMessage);
    }

    throw error;
  }
}

function safelyParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return { message: value };
  }
}
