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

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isJson && payload?.error) {
      throw new Error(payload.error);
    }
    if (typeof payload === 'string' && payload.includes('Cannot POST /api/trips/upload-cover')) {
      throw new Error("Le backend déployé ne supporte pas encore l'upload d'image (route /api/trips/upload-cover absente).");
    }
    throw new Error("Erreur lors de l'upload de l'image");
  }

  if (!isJson || !payload?.cover_image_url) {
    throw new Error("Réponse serveur invalide pendant l'upload de l'image");
  }

  return payload.cover_image_url;
}
