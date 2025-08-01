import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/TripDetails.css";
import type { Trip } from "../types/trip";
import type { Activity } from "../types/activity";
import ModalAddActivity from "./ModalAddActivity";

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3001/api/trips`)
      .then((res) => res.json())
      .then((data) => {
        const foundTrip = data.find((t: Trip) => t.id === Number(id));
        setTrip(foundTrip);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3001/api/activities/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setActivities(data));
  }, [id]);

  const handleActivityAdded = (newActivity: Activity) => {
    setActivities((prev) => [...prev, newActivity]);
  };

  const groupedActivities = activities.reduce<Record<string, Activity[]>>(
    (acc, act) => {
      const date = act.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(act);
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(groupedActivities).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (!trip) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  return (
    <div className="trip-details-container">
      <h1 className="trip-details-title">Planification de voyage</h1>
      <h2 className="trip-details-destination">{trip.destination}</h2>
      <p className="trip-details-dates">
        {new Date(trip.start_date).toLocaleDateString()} –{" "}
        {new Date(trip.end_date).toLocaleDateString()}
      </p>

      {sortedDates.map((date) => (
        <div className="trip-day-section" key={date}>
          <h3 className="trip-day-title">
            {new Date(date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>

          <ul className="trip-activity-list">
            {groupedActivities[date].map((act) => (
              <li key={act.id}>
                <strong>{act.title}</strong>
                {act.description && ` – ${act.description}`}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* ✅ Un seul bouton global */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button className="trip-add-btn" onClick={() => setShowAddModal(true)}>
          + Ajouter une activité
        </button>
      </div>

      {showAddModal && trip && (
        <ModalAddActivity
          tripId={trip.id}
          onClose={() => setShowAddModal(false)}
          onActivityAdded={handleActivityAdded} defaultDate={""}        />
      )}
    </div>
  );
}
