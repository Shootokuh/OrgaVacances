import CalendarView from "./CalendarView";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Activity } from "../types/activity";
import type { Hotel } from "../types/hotel";
import { apiFetch } from "../utils/api";

export default function CalendarPage() {
  const { id } = useParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/activities/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setActivities(data));
    apiFetch(`/api/hotels/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setHotels(data));
  }, [id]);

  return (
    <div style={{ background: '#fafbfc', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: '2.5rem 2rem', maxWidth: 1400, margin: '2rem auto' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 700, marginBottom: 32 }}>Calendrier du voyage</h1>
      <CalendarView activities={activities} hotels={hotels} />
    </div>
  );
}
