import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { Link } from "react-router-dom";
import type { Trip } from "../types/trip";
import ModalAddTrip from "./ModalAddTrip";
import ModalConfirmDelete from "./ModalConfirmDelete";
import ModalShareTrip from "./ModalShareTrip";
import { apiFetch } from "../utils/api";
import shareIcon from "../assets/share.svg";
import "../styles/TripList.css";

type UserSummary = {
  name?: string;
  avatar_url?: string;
};

const FALLBACK_THEMES = {
  beach: "fallback-beach",
  mountain: "fallback-mountain",
  city: "fallback-city",
  default: "fallback-default",
} as const;

function getFallbackTheme(destination: string) {
  const value = destination.toLowerCase();
  if (/beach|plage|island|thailand|phuket|bali|sea|ocean/.test(value)) return FALLBACK_THEMES.beach;
  if (/ski|mountain|montagne|alps|neige|meribel|chamonix/.test(value)) return FALLBACK_THEMES.mountain;
  if (/city|ville|paris|london|tokyo|new york|rome|barcelona/.test(value)) return FALLBACK_THEMES.city;
  return FALLBACK_THEMES.default;
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) return "Dates à définir";
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return "Dates à définir";
  return parsedDate.toLocaleDateString("fr-FR");
}

export default function TripList() {
  const [trips, setTrips] = useState<Trip[] | null>([]);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(auth.currentUser);
  const [userSummary, setUserSummary] = useState<UserSummary>({});
  const [shareTripId, setShareTripId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (firebaseUser) {
      apiFetch('/api/users/me')
        .then((res) => res.json())
        .then((data) => {
          setUserSummary({
            name: data?.name || "",
            avatar_url: data?.avatar_url || "",
          });
        })
        .catch(() => setUserSummary({}));
    } else {
      setUserSummary({});
    }
  }, [firebaseUser]);

  const [showForm, setShowForm] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleTripAdded = (newTrip: Trip) => {
    setTrips((prev) => (Array.isArray(prev) ? [...prev, newTrip] : [newTrip]));
  };

  const handleTripUpdated = (updatedTrip: Trip) => {
    setTrips((prev) =>
      Array.isArray(prev)
        ? prev.map((trip) => (trip.id === updatedTrip.id ? { ...trip, ...updatedTrip } : trip))
        : [updatedTrip]
    );
  };

  const handleDeleteTrip = async (id: number) => {
    try {
      const res = await apiFetch(`/api/trips/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Échec suppression");

      setTrips((prev) => (Array.isArray(prev) ? prev.filter((trip) => trip.id !== id) : []));
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  };


  useEffect(() => {
    if (firebaseUser) {
      apiFetch("/api/trips")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setTrips(data);
          else setTrips([]);
        })
        .catch((err) => console.error("Erreur chargement voyages", err));
    } else {
      setTrips([]);
    }
  }, [firebaseUser]);

  const tripList = Array.isArray(trips) ? trips : [];
  const filteredTrips = tripList.filter((trip) => {
    const haystack = `${trip.title || ""} ${trip.destination || ""}`.toLowerCase();
    return haystack.includes(searchValue.trim().toLowerCase());
  });

  const initials = (userSummary.name || firebaseUser?.email || "U")
    .split(" ")
    .map((part: string) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="trip-page">
      <div className="trip-container">
        <header className="trip-header-row">
          <div className="trip-title-block">
            <h1 className="trip-title">Mes Voyages</h1>
            <p className="trip-subtitle">Planifie tes prochaines aventures !</p>
          </div>

          <div className="trip-actions">
            <div className="trip-search-wrap">
              <span className="trip-search-icon" aria-hidden="true">🔍</span>
              <input
                className="trip-search-input"
                type="text"
                placeholder="Rechercher un voyage..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <div className="trip-avatar" title={userSummary.name || firebaseUser?.email || "Utilisateur"}>
              {userSummary.avatar_url ? (
                <img src={userSummary.avatar_url} alt="Avatar" className="trip-avatar-image" />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <button
              className="trip-logout-btn"
              onClick={() => {
                localStorage.removeItem('token');
                window.location.reload();
              }}
            >
              Déconnexion
            </button>
          </div>
        </header>

        <div className="trip-grid">
          {filteredTrips.map((trip) => (
            <Link to={`/trip/${trip.id}`} key={trip.id} className="trip-card-link">
              <article className="trip-card">
                <div className="trip-visual-wrap">
                  {trip.cover_image_url ? (
                    <img src={trip.cover_image_url} alt={trip.title} className="trip-cover-image" />
                  ) : (
                    <div className={`trip-cover-fallback ${getFallbackTheme(trip.destination || "")}`}>
                      <span className="trip-fallback-glow" />
                    </div>
                  )}

                  <div className="trip-card-actions-overlay">
                    <button
                      className="trip-icon-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        if (trip.role === 'owner') {
                          setShareTripId(trip.id);
                        }
                      }}
                      title={trip.role === 'owner' ? "Partager le voyage" : "Partage réservé au propriétaire"}
                      aria-label="Partager le voyage"
                    >
                      <img src={shareIcon} alt="Partager" className="trip-share-icon" />
                    </button>

                    <button
                      className="trip-icon-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        if (trip.role === 'owner') {
                          setTripToEdit(trip);
                        }
                      }}
                      title={trip.role === 'owner' ? "Modifier le voyage" : "Action réservée au propriétaire"}
                      aria-label="Options du voyage"
                    >
                      ⋯
                    </button>
                  </div>
                </div>

                <div className="trip-card-content">
                  <h3 className="trip-name">{trip.title}</h3>
                  <p className="trip-destination">{trip.destination || "Destination à définir"}</p>
                  <p className="trip-dates">
                    Du {formatDate(trip.start_date)} au {formatDate(trip.end_date)}
                  </p>

                  <div className="trip-card-footer">
                    <p className="trip-activities">📍 {trip.activities_count ?? 0} Activités</p>
                    {trip.role === 'owner' ? (
                      <button
                        className="trip-footer-delete"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedTrip(trip);
                        }}
                        title="Supprimer le voyage"
                        aria-label="Supprimer le voyage"
                      >
                        🗑
                      </button>
                    ) : (
                      <span className="trip-viewer-badge">Partagé</span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}

          <div className="new-trip" onClick={toggleForm} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleForm()}>
            <p className="new-trip-plus">+</p>
            <p className="new-trip-label">Nouveau voyage</p>
          </div>
        </div>

        {(showForm || tripToEdit) && (
          <ModalAddTrip
            onClose={() => {
              setShowForm(false);
              setTripToEdit(null);
            }}
            onTripAdded={handleTripAdded}
            onTripUpdated={handleTripUpdated}
            initialTrip={tripToEdit}
          />
        )}

        {selectedTrip && (
          <ModalConfirmDelete
            tripTitle={selectedTrip.title}
            onClose={() => setSelectedTrip(null)}
            onConfirm={() => {
              handleDeleteTrip(selectedTrip.id);
              setSelectedTrip(null);
            }}
          />
        )}

        {shareTripId && (
          <ModalShareTrip
            tripId={shareTripId}
            onClose={() => setShareTripId(null)}
          />
        )}
      </div>
    </div>
  );
}