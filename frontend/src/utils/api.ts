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
  return fetch(url, opts);
}
