import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Trip } from "../types/trip";
import type { Activity } from "../types/activity";
import type { Hotel } from "../types/hotel";
import HotelList from "./HotelList";
import ModalAddActivity from "./ModalAddActivity";
import ModalEditActivity from "./ModalEditActivity";
import ModalHotelForm from "./ModalHotelForm";
// import CalendarView from "./CalendarView";
import { apiFetch } from "../utils/api";
import "../styles/TripDetails.css";


function renderWithLinks(text: string) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="trip-link">{part}</a>
      : part
  );
}


export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [sideTab, setSideTab] = useState<'planning' | 'hotels'>('planning');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [editHotel, setEditHotel] = useState<Hotel | null>(null);

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


  // CRUD hôtels
  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/hotels/trip/${id}`)
      .then(res => res.json())
      .then(data => setHotels(data));
  }, [id]);

  const handleAddHotel = async (hotel: Omit<Hotel, "id">) => {
    const res = await apiFetch(`/api/hotels`, {
      method: "POST",
      body: JSON.stringify({ ...hotel, trip_id: id })
    });
    if (res.ok) {
      const newHotel = await res.json();
      setHotels(prev => [...prev, newHotel]);
    }
  };

  const handleEditHotel = async (hotel: Hotel) => {
    const res = await apiFetch(`/api/hotels/${hotel.id}`, {
      method: "PUT",
      body: JSON.stringify(hotel)
    });
    if (res.ok) {
      const updated = await res.json();
      setHotels(prev => prev.map(h => h.id === updated.id ? updated : h));
    }
  };

  const handleDeleteHotel = async (id: number) => {
    const res = await apiFetch(`/api/hotels/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      setHotels(prev => prev.filter(h => h.id !== id));
    }
  };

  // Trie les activités de chaque journée par horaire de début
  const groupedActivities: Record<string, Activity[]> = activities.reduce(
    (acc, act) => {
      const date = act.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(act);
      return acc;
    },
    {} as Record<string, Activity[]>
  );
  Object.keys(groupedActivities).forEach(date => {
    groupedActivities[date].sort((a, b) => {
      const tA = a.time ? a.time.slice(0,5) : '00:00';
      const tB = b.time ? b.time.slice(0,5) : '00:00';
      return tA.localeCompare(tB);
    });
  });
  const sortedDates = Object.keys(groupedActivities).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (!trip) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  return (
    <div className="trip-details-container">
      <nav className="trip-details-nav">
        <button
          className={sideTab === 'planning' ? 'active' : ''}
          onClick={() => setSideTab('planning')}
        >Planning</button>
        <button
          className={sideTab === 'hotels' ? 'active' : ''}
          onClick={() => setSideTab('hotels')}
        >Hôtels</button>
      </nav>
      <div className="trip-details-main">
        {sideTab === 'planning' && (
          <>
            <div className="trip-details-header">
              <h1 className="trip-details-title">{trip.destination}</h1>
              <div className="trip-details-dates">
                {new Date(trip.start_date).toLocaleDateString()} – {new Date(trip.end_date).toLocaleDateString()}
              </div>
            </div>
            <div className="trip-details-activities">
              {sortedDates.length === 0 && (
                <div className="trip-details-empty">Aucune activité planifiée pour ce voyage.</div>
              )}
              {sortedDates.map((date) => (
                <section className="trip-day-section" key={date}>
                  <div className="trip-day-header">
                    <span className="trip-day-date">
                      {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                    <div className="trip-day-divider" />
                  </div>
                  <div className="trip-day-activities">
                    {groupedActivities[date].map((act) => (
                      <div className="trip-activity-card" key={act.id}>
                        <div className="trip-activity-info">
                          <div className="trip-activity-title">{act.title}</div>
                          <div className="trip-activity-meta">
                            {act.location && <span>📍 {act.location} </span>}
                            {act.time && (
                              <span>
                                · 🕒 {act.time.slice(0, 5)}
                                {act.end_time && ` - ${act.end_time.slice(0, 5)}`}
                              </span>
                            )}
                          </div>
                          {act.description && (
                            <div className="trip-activity-desc">
                              {renderWithLinks(act.description)}
                            </div>
                          )}
                        </div>
                        <div className="trip-activity-actions">
                          <button
                            title="Modifier"
                            className="trip-activity-edit"
                            onClick={() => {
                              setSelectedActivity(act);
                              setShowEditModal(true);
                            }}
                          >✏️</button>
                          <button
                            title="Supprimer"
                            className="trip-activity-delete"
                            onClick={() => handleDeleteActivity(act.id)}
                          >🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="trip-add-btn-wrapper">
              <button className="trip-add-btn" onClick={() => setShowAddModal(true)}>
                + Ajouter une activité
              </button>
            </div>
          </>
        )}
        {sideTab === 'hotels' && (
          <>
            <HotelList
              hotels={hotels}
              onAdd={() => {
                setEditHotel(null);
                setShowHotelModal(true);
              }}
              onEdit={hotel => {
                setEditHotel(hotel);
                setShowHotelModal(true);
              }}
              onDelete={handleDeleteHotel}
            />
            <ModalHotelForm
              open={showHotelModal}
              onClose={() => { setShowHotelModal(false); setEditHotel(null); }}
              onSubmit={async (hotelData) => {
                if (editHotel) {
                  await handleEditHotel({ ...editHotel, ...hotelData });
                } else {
                  await handleAddHotel(hotelData);
                }
                setShowHotelModal(false);
                setEditHotel(null);
              }}
              initial={editHotel || undefined}
              isEdit={!!editHotel}
            />
          </>
        )}

        {/* Modals */}
        {showAddModal && trip && (
          <ModalAddActivity
            tripId={trip.id}
            defaultDate={""}
            onClose={() => setShowAddModal(false)}
            onActivityAdded={handleActivityAdded}
          />
        )}
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
    </div>
  );
}
