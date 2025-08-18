// src/utils/api.ts

export const getToken = () => localStorage.getItem('token');

export async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  const opts = { ...options, headers };
  // Préfixe l'URL par VITE_API_URL si ce n'est pas déjà un URL absolu
  const baseUrl = import.meta.env.VITE_API_URL;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  return fetch(fullUrl, opts);
}
