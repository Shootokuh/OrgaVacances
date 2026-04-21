import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import type { Trip } from "../types/trip";
import type { Activity } from "../types/activity";
import type { Hotel } from "../types/hotel";
import ModalAddActivity from "./ModalAddActivity";
import ModalEditActivity from "./ModalEditActivity";
import ModalAddTrip from "./ModalAddTrip";
import ModalHotelForm from "./ModalHotelForm";
import HotelList from "./HotelList";
import { apiFetch } from "../utils/api";
import "../styles/TripDetails.css";


function renderWithLinks(text: string) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    /^https?:\/\//i.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="trip-link">{part}</a>
      : part
  );
}

function formatDateLong(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateMedium(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTimeRange(activity: Activity) {
  const start = activity.time ? activity.time.slice(0, 5) : "A définir";
  if (!activity.end_time) return start;
  return `${start} - ${activity.end_time.slice(0, 5)}`;
}


export default function TripDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [showTripEditModal, setShowTripEditModal] = useState(false);
  const [editHotel, setEditHotel] = useState<Hotel | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const activeTab = new URLSearchParams(location.search).get("tab") || "planning";
  const isHotelsView = activeTab === "hotels";

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/trips`)
      .then((res) => res.json())
      .then((data) => {
        const foundTrip = data.find((t: Trip) => t.id === Number(id));
        setTrip(foundTrip || null);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/activities/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setActivities(data));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/hotels/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setHotels(data));
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

  const handleAddHotel = async (hotel: Omit<Hotel, "id">) => {
    const res = await apiFetch(`/api/hotels`, {
      method: "POST",
      body: JSON.stringify({ ...hotel, trip_id: id }),
    });
    if (res.ok) {
      const newHotel = await res.json();
      setHotels((prev) => [...prev, newHotel]);
    }
  };

  const handleEditHotel = async (hotel: Hotel) => {
    const res = await apiFetch(`/api/hotels/${hotel.id}`, {
      method: "PUT",
      body: JSON.stringify(hotel),
    });
    if (res.ok) {
      const updated = await res.json();
      setHotels((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    }
  };

  const handleDeleteHotel = async (hotelId: number) => {
    const res = await apiFetch(`/api/hotels/${hotelId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setHotels((prev) => prev.filter((h) => h.id !== hotelId));
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

  // Fonction pour calculer le numéro du jour en fonction de la date de début du voyage
  const calculateDayNumber = (dateString: string): number => {
    const startDate = new Date(trip.start_date);
    const currentDate = new Date(dateString);
    
    // Réinitialiser les heures pour une comparaison correcte des dates
    startDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const dayDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
    
    return dayDiff + 1; // +1 parce que le jour 1 commence à la date de départ
  };

  const totalActivities = trip?.activities_count ?? activities.length;

  if (!trip) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  return (
    <div className="trip-details-container">
      <section className="trip-hero-card">
        <div className="trip-hero-cover-wrap">
          {trip.cover_image_url ? (
            <img
              src={trip.cover_image_url}
              alt={`Couverture du voyage ${trip.title}`}
              className="trip-hero-cover"
            />
          ) : (
            <div className="trip-hero-cover trip-hero-fallback" aria-hidden="true" />
          )}
          <div className="trip-hero-overlay">
            <h1 className="trip-hero-title">{trip.title}</h1>
            <p className="trip-hero-subtitle" title={trip.destination}>{trip.destination}</p>
          </div>
        </div>

        <div className="trip-meta-bar">
          <div className="trip-meta-item">
            <span className="trip-meta-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3.25" y="4.25" width="17.5" height="16.5" rx="3.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3.25 9.25H20.75" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </span>
            <span>{formatDateMedium(trip.start_date)} {"->"} {formatDateMedium(trip.end_date)}</span>
          </div>
          <div className="trip-meta-item">
            <span className="trip-meta-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                <path d="M5 12H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                <path d="M5 16.5H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                <circle cx="3.5" cy="7.5" r="1.1" fill="currentColor"/>
                <circle cx="3.5" cy="12" r="1.1" fill="currentColor"/>
                <circle cx="3.5" cy="16.5" r="1.1" fill="currentColor"/>
              </svg>
            </span>
            <span>{totalActivities} activité{totalActivities > 1 ? "s" : ""}</span>
          </div>
          <div className="trip-meta-item">
            <span className="trip-meta-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3.5 10H20.5" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="8" cy="14.5" r="1" fill="currentColor"/>
              </svg>
            </span>
            <span>{trip.budget.toLocaleString("fr-FR")} €</span>
          </div>
        </div>
      </section>

      {isHotelsView ? (
        <section className="trip-hotels-section">
          <HotelList
            hotels={hotels}
            onAdd={() => {
              setEditHotel(null);
              setShowHotelModal(true);
            }}
            onEdit={(hotel) => {
              setEditHotel(hotel);
              setShowHotelModal(true);
            }}
            onDelete={handleDeleteHotel}
          />
        </section>
      ) : (
        <div className="trip-content-grid">
          <section className="trip-planning-section">
            <h2 className="trip-section-title">Planning du voyage</h2>
            <div className="planning-card">
              {sortedDates.length === 0 && (
                <div className="trip-details-empty">Aucune activité planifiée pour ce voyage.</div>
              )}
              {sortedDates.map((date, dateIndex) => (
                <div key={date} className="planning-day-block">
                  <div className="planning-day-header">
                    <strong>Jour {calculateDayNumber(date)}</strong>
                    <span>{formatDateLong(date)}</span>
                  </div>

                  {groupedActivities[date].map((act) => (
                    <article className="planning-activity-row" key={act.id}>
                      <div className="planning-activity-time">{formatTimeRange(act)}</div>
                      <div className="planning-activity-content">
                        <div className="planning-activity-title">{act.title}</div>
                        {act.location && <div className="planning-activity-location">{act.location}</div>}
                        {act.description && (
                          <div className="planning-activity-description">{renderWithLinks(act.description)}</div>
                        )}

                        <div className="planning-activity-actions">
                          <button
                            title="Modifier"
                            className="planning-action-button"
                            onClick={() => {
                              setSelectedActivity(act);
                              setShowEditModal(true);
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            title="Supprimer"
                            className="planning-action-button planning-action-button-danger"
                            onClick={() => handleDeleteActivity(act.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ))}

              <div className="planning-card-footer">
                <button className="trip-add-btn" onClick={() => setShowAddModal(true)}>
                  + Ajouter une activité
                </button>
              </div>
            </div>
          </section>

          <aside className="trip-overview-section">
            <h2 className="trip-section-title">Aperçu du voyage</h2>
            <div className="overview-card">
              <h3>Aperçu du voyage</h3>
              <ul className="overview-list">
                <li>
                  <span className="overview-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 6.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M8 11.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M8 16.5H12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <rect x="4" y="3.5" width="16" height="17" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </span>
                  <span><strong>Destination :</strong> {trip.title}</span>
                </li>
                <li>
                  <span className="overview-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21C16.5 16.8 18.75 13.55 18.75 10.5C18.75 6.91 15.84 4 12.25 4C8.66 4 5.75 6.91 5.75 10.5C5.75 13.55 8 16.8 12.5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12.25" cy="10.25" r="2.25" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </span>
                  <span><strong>Étapes :</strong> {trip.destination}</span>
                </li>
                <li>
                  <span className="overview-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3.5" y="4" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M16 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M3.5 9H20.5" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </span>
                  <span><strong>Dates :</strong> {formatDateLong(trip.start_date)} {"->"} {formatDateLong(trip.end_date)}</span>
                </li>
                <li>
                  <span className="overview-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M3.5 10H20.5" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="8" cy="14.5" r="1" fill="currentColor"/>
                    </svg>
                  </span>
                  <span><strong>Budget :</strong> {trip.budget.toLocaleString("fr-FR")} €</span>
                </li>
              </ul>
              <button
                className="trip-edit-btn"
                onClick={() => setShowTripEditModal(true)}
              >
                Modifier le voyage
              </button>
            </div>
          </aside>
        </div>
      )}

      {showAddModal && trip && (
        <ModalAddActivity
          tripId={trip.id}
          defaultDate={trip.start_date && typeof trip.start_date === "string" ? trip.start_date.substring(0, 10) : ""}
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
      {showTripEditModal && trip && (
        <ModalAddTrip
          initialTrip={trip}
          onClose={() => setShowTripEditModal(false)}
          onTripAdded={() => {
            setShowTripEditModal(false);
          }}
          onTripUpdated={(updatedTrip) => {
            setTrip(updatedTrip);
            setShowTripEditModal(false);
          }}
        />
      )}
      <ModalHotelForm
        open={showHotelModal}
        onClose={() => {
          setShowHotelModal(false);
          setEditHotel(null);
        }}
        onSubmit={async (hotelData) => {
          if (editHotel) {
            await handleEditHotel({ ...editHotel, ...hotelData });
          } else {
            await handleAddHotel(hotelData);
          }
          setShowHotelModal(false);
          setEditHotel(null);
        }}
        initial={editHotel}
        isEdit={!!editHotel}
        tripStartDate={trip?.start_date}
        tripEndDate={trip?.end_date}
      />
    </div>
  );
}
