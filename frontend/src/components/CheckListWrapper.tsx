import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CheckList from "./CheckList";
import type { Trip } from "../types/trip";
import { apiFetch } from "../utils/api";

export default function CheckListWrapper() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
  apiFetch(`/api/trips`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((t: Trip) => t.id === Number(id));
        setTrip(found);
      });
  }, [id]);

  if (!trip) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
  return (
    <CheckList
      destination={trip.destination}
      startDate={new Date(trip.start_date).toLocaleDateString()}
      endDate={new Date(trip.end_date).toLocaleDateString()}
    />
  );
}
