import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { Link } from "react-router-dom";
import type { Trip } from "../types/trip";
import ModalAddTrip from "./ModalAddTrip";
import ModalConfirmDelete from "./ModalConfirmDelete";
import { apiFetch } from "../utils/api";
import "../styles/TripList.css";


export default function TripList() {
  const [trips, setTrips] = useState<Trip[] | null>([]);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(auth.currentUser);
  const [displayName, setDisplayName] = useState<string>("");
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
          if (data && data.name) setDisplayName(data.name);
        })
        .catch(() => setDisplayName(""));
    } else {
      setDisplayName("");
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

  const handleDeleteTrip = async (id: number) => {
    console.log("Suppression du trip id :", selectedTrip?.id);
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

  // L'utilisateur connecté est maintenant accessible via Firebase Auth côté frontend

  return (
    <div className="trip-container">
      <h1 className="trip-title">
        Bienvenue {displayName || (firebaseUser ? firebaseUser.email : "")} !
      </h1>
      <button
        style={{ position: 'absolute', top: 24, right: 32, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px #0002' }}
        onClick={() => {
          localStorage.removeItem('token');
          window.location.reload();
        }}
      >Déconnexion</button>
      <p className="trip-subtitle">Prépare tes futures aventures !</p>

      <div className="trip-grid">
  {(Array.isArray(trips) ? trips : []).map((trip) => (
        <Link to={`/trip/${trip.id}`} key={trip.id} className="trip-card-link">
          <div className="trip-card">
            <button
              className="delete-btn"
              onClick={(e) => {
                e.preventDefault(); // ⛔ empêche la redirection si on clique sur la poubelle
                setSelectedTrip(trip);
              }}
              title="Supprimer le voyage"
            >
              🗑️
            </button>

            <span className="trip-emoji">🌍</span>
            <h3 className="trip-name">{trip.title}</h3>
            <p className="trip-destination">{trip.destination}</p>
            <p className="trip-dates">
              Du {new Date(trip.start_date).toLocaleDateString()} au{" "}
              {new Date(trip.end_date).toLocaleDateString()}
            </p>
          </div>
        </Link>

        ))}

        {/* Carte "Nouveau voyage" */}
        <div className="new-trip" onClick={toggleForm}>
          <p className="text-3xl mb-2">＋</p>
          <p className="font-medium">Nouveau voyage</p>
        </div>
      </div>

    {showForm && (
      <ModalAddTrip
        onClose={toggleForm}
        onTripAdded={handleTripAdded}
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

    </div>
  );
}