// src/utils/api.ts

export const getToken = () => localStorage.getItem('token');

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const baseHeaders = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const headers = {
    ...baseHeaders,
    ...(!isFormDataBody ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {})
  };
  const opts = { ...options, headers };
  // Ajoute le préfixe VITE_API_URL si l'URL ne commence pas par http
  const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
  const res = await fetch(fullUrl, opts);
  if (res.status === 401) {
    localStorage.removeItem('token');
    throw new Error('Unauthorized');
  }
  return res;
}
