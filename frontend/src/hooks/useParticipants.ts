import { useEffect, useState } from "react";

export function useParticipants(tripId: number | string) {
  const [participants, setParticipants] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    if (!tripId) return;
    fetch(`/api/participants/${tripId}`)
      .then(res => res.json())
      .then(setParticipants);
  }, [tripId]);
  return participants;
}
