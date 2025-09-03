import { apiFetch } from "../utils/api";

export async function getTripRole(tripId: number): Promise<'owner' | 'viewer' | null> {
  try {
    const res = await apiFetch(`/api/trips/${tripId}`);
    if (!res.ok) return null;
    const trip = await res.json();
    // Si le backend retourne le trip, on peut demander le rôle via une route dédiée ou l'inclure dans le trip
    // Pour l'instant, on suppose que le backend expose le rôle dans le trip (à ajouter côté backend si besoin)
    return trip.role || null;
  } catch {
    return null;
  }
}
