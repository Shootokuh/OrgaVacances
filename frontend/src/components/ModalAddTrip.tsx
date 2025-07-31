import { useState } from "react";
import type { User } from "../types/user";
import "../styles/ModalAddTrip.css";

type ModalAddTripProps = {
  onClose: () => void;
  user: User | null;
  onTripAdded: (trip: any) => void;
};

export default function ModalAddTrip({ onClose, user, onTripAdded }: ModalAddTripProps) {
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setDestination("");
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTrip = {
        user_id: user?.id || 1,
        title,
        destination,
        start_date: startDate,
        end_date: endDate,
    };

    try {
        const res = await fetch("http://localhost:3001/api/trips", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newTrip),
        });

        if (!res.ok) throw new Error("Erreur lors de l'ajout");

        const createdTrip = await res.json();
        onTripAdded(createdTrip);

        console.log("Trip ajouté, fermeture de la modale"); // pour debug

        resetForm();
        onClose(); // ✅ cette ligne doit être atteinte
    } catch (err) {
        console.error("Erreur :", err);
    }
    };

  return (
    <div
        className="modal-overlay"
        onClick={(e) => {
        // Ferme la modale si on clique sur l'overlay (mais pas si on clique sur le contenu)
        if (e.target === e.currentTarget) {
            onClose();
        }
        }}
    >
      <div className="modal-content">
        <h2>Ajouter un nouveau voyage</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              placeholder="Ex : Grèce 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              placeholder="Ex : Athènes, Mykonos..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Date de départ</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Date de retour</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit">Ajouter</button>
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
