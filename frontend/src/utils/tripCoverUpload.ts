import { apiFetch } from './api';

export const ALLOWED_TRIP_COVER_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const MAX_TRIP_COVER_SIZE_BYTES = 5 * 1024 * 1024;

export function validateTripCoverFile(file: File): string | null {
  if (!ALLOWED_TRIP_COVER_TYPES.includes(file.type)) {
    return 'Format invalide. Utilisez PNG, JPG ou WEBP.';
  }
  if (file.size > MAX_TRIP_COVER_SIZE_BYTES) {
    return 'Image trop volumineuse. Taille maximale: 5 Mo.';
  }
  return null;
}

export async function uploadTripCoverImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiFetch('/api/trips/upload-cover', {
    method: 'POST',
    body: formData
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || "Erreur lors de l'upload de l'image");
  }

  return payload.cover_image_url;
}
