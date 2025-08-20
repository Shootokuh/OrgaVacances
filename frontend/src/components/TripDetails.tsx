import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
// Pour rendre les liens cliquables
function renderWithLinks(text: string) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', textDecoration: 'underline' }}>{part}</a>;
    }
    return part;
  });
}
import "../styles/TripDetails.css";
import type { Trip } from "../types/trip";
import type { Activity } from "../types/activity";
import ModalAddActivity from "./ModalAddActivity";
import ModalEditActivity from "./ModalEditActivity";
// import CalendarView from "./CalendarView";
import { apiFetch } from "../utils/api";

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  // const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
  apiFetch(`/api/trips`)
      .then((res) => res.json())
      .then((data) => {
        const foundTrip = data.find((t: Trip) => t.id === Number(id));
        setTrip(foundTrip);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
  apiFetch(`/api/activities/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setActivities(data));
  }, [id]);

  const handleActivityAdded = (newActivity: Activity) => {
    setActivities((prev) => [...prev, newActivity]);
  };

  const handleDeleteActivity = async (activityId: number) => {
    try {
  const res = await apiFetch(`/api/activities/${activityId}`, {
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
    <div className="trip-details-container" style={{ background: '#fafbfc', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: '2.5rem 2rem', maxWidth: 700, margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="trip-details-title" style={{ fontSize: '2.2rem', fontWeight: 700, margin: 0 }}>{trip.destination}</h1>
        <div className="trip-details-dates" style={{ color: '#888', fontSize: '1.1rem', margin: '0.5rem 0 0.5rem 0' }}>
          {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        {sortedDates.length === 0 && (
          <div style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', margin: '2rem 0' }}>
            Aucune activité planifiée pour ce voyage.
          </div>
        )}
        {sortedDates.map((date) => (
          <section className="trip-day-section" key={date} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#645a5a', letterSpacing: 0.5 }}>
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
              <div style={{ flex: 1, height: 1, background: '#eee', marginLeft: 8 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {groupedActivities[date].map((act) => (
                <div key={act.id} style={{
                  background: '#fff',
                  borderRadius: 10,
                  boxShadow: '0 1px 4px #0001',
                  padding: '1rem 1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: 2 }}>{act.title}</div>
                    <div style={{ color: '#555', fontSize: '0.98rem', marginBottom: 2 }}>
                      {act.location && <span>📍 {act.location} </span>}
                      {act.time && (
                        <span>
                          · 🕒 {act.time.slice(0, 5)}
                          {act.end_time && ` - ${act.end_time.slice(0, 5)}`}
                        </span>
                      )}
                    </div>
                    {act.description && (
                      <div style={{ color: '#888', fontSize: '0.97rem', marginTop: 2, wordBreak: 'break-word', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
                        {renderWithLinks(act.description)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      title="Modifier"
                      onClick={() => {
                        setSelectedActivity(act);
                        setShowEditModal(true);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#645a5a',
                        fontSize: 20,
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 6,
                        transition: 'background 0.2s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#f2f2f2')}
                      onMouseOut={e => (e.currentTarget.style.background = 'none')}
                    >
                      ✏️
                    </button>
                    <button
                      title="Supprimer"
                      onClick={() => handleDeleteActivity(act.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#b33',
                        fontSize: 20,
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 6,
                        transition: 'background 0.2s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#fbeaea')}
                      onMouseOut={e => (e.currentTarget.style.background = 'none')}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button className="trip-add-btn" onClick={() => setShowAddModal(true)}>
          + Ajouter une activité
        </button>
      </div>

      {/* 🔘 Modal d’ajout d’activité */}
      {showAddModal && trip && (
        <ModalAddActivity
          tripId={trip.id}
          defaultDate={""}
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
