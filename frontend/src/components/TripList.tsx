import { useEffect, useState } from "react";
import type { Trip } from "../types/trip";
import type { User } from "../types/user";
import ModalAddTrip from "./ModalAddTrip";
import "../styles/TripList.css";


export default function TripList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const handleTripAdded = (newTrip: Trip) => {
    setTrips((prev) => [...prev, newTrip]);
  };

  useEffect(() => {
    fetch("http://localhost:3001/api/trips")
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch((err) => console.error("Erreur chargement voyages", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:3001/api/users")
      .then((res) => res.json())
      .then((data) => setUser(data[0])) // On prend le premier user de la liste
      .catch((err) => console.error("Erreur chargement utilisateur", err));
  }, []);

  return (
    <div className="trip-container">
      <h1 className="trip-title">
        Bienvenue {user ? user.name : "Pierre"} !
      </h1>
      <p className="trip-subtitle">Prépare tes futures vacances !</p>

      <div className="trip-grid">
        {trips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <span className="trip-emoji">🌍</span>
            <h3 className="trip-name">{trip.title}</h3>
            <p className="trip-destination">{trip.destination}</p>
            <p className="trip-dates">
              Du {new Date(trip.start_date).toLocaleDateString()} au{" "}
              {new Date(trip.end_date).toLocaleDateString()}
            </p>
          </div>
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
        user={user}
        onTripAdded={handleTripAdded}
      />
    )}


    </div>
  );
}