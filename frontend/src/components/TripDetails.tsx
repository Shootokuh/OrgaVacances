import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/TripDetails.css";
import type { Trip } from "../types/trip";
import type { Activity } from "../types/activity";
import ModalAddActivity from "./ModalAddActivity";
import ModalEditActivity from "./ModalEditActivity";

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);


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

  const handleDeleteActivity = async (activityId: number) => {
    try {
      const res = await fetch(`http://localhost:3001/api/activities/${activityId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setActivities((prev) => prev.filter((a) => a.id !== activityId));
    } catch (err) {
      console.error("Erreur suppression activité :", err);
    }
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

      {/* 🗓️ Activités regroupées et triées */}
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
                {act.location && <span> - 📍 {act.location}, </span>}
                {act.time && <span> 🕒 {act.time.slice(0, 5)}</span>}
                <br />
                {act.description && <span>{act.description}</span>}
                {/* (Optionnel pour la modification) */}
                <button
                  title="Modifier"
                  onClick={() => {
                    setSelectedActivity(act);
                    setShowEditModal(true);
                  }}
                  style={{
                    marginLeft: "10px",
                    color: "blue",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  ✏️
                </button>
                {/* (Optionnel pour la suppression) */}
                <button
                  title="Supprimer"
                  onClick={() => handleDeleteActivity(act.id)}
                  style={{
                    marginLeft: "10px",
                    color: "red",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* ✅ Un seul bouton global d'ajout */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button className="trip-add-btn" onClick={() => setShowAddModal(true)}>
          + Ajouter une activité
        </button>
      </div>

      {/* 🔘 Modal d’ajout d’activité */}
      {showAddModal && trip && (
        <ModalAddActivity
          tripId={trip.id}
          defaultDate={""} // <- Tu peux éventuellement passer une date par défaut
          onClose={() => setShowAddModal(false)}
          onActivityAdded={handleActivityAdded}
        />
      )}

      {/* 🔘 Modal d’édition d’activité */}
      {showEditModal && selectedActivity && (
      <ModalEditActivity
        activity={selectedActivity}
        onClose={() => {
          setSelectedActivity(null);
          setShowEditModal(false);
        }}
        onActivityUpdated={(updatedActivity) => {
          setActivities((prev) =>
            prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a))
          );
        }}
      />
    )}
    </div>
  );
}
