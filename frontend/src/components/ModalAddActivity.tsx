import { useState } from "react";
import type { Activity } from "../types/activity";
import "../styles/ModalAddTrip.css";

type ModalAddActivityProps = {
  onClose: () => void;
  tripId: number;
  onActivityAdded: (activity: Activity) => void;
    defaultDate: string;
};

export default function ModalAddActivity({ onClose, tripId, onActivityAdded, defaultDate }: ModalAddActivityProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate || "");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation heure de fin >= heure de début
    if (time && endTime && endTime < time) {
      alert("L'heure de fin ne peut pas être avant l'heure de début.");
      return;
    }

    const newActivity = {
      trip_id: tripId,
      title,
      date,
      time: time || null,
      end_time: endTime || null,
      location: location || null,
      description,
    };

    try {
      const res = await fetch("http://localhost:3001/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newActivity),
      });

      if (!res.ok) throw new Error("Erreur lors de l'ajout");

      const created = await res.json();
      onActivityAdded(created);
      onClose();
    } catch (err) {
      console.error("Erreur ajout activité :", err);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <h2>Ajouter une activité</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom de l’activité</label>
            <input
              type="text"
              placeholder="Ex : Visiter le musée"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Heure de début (optionnelle)</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Heure de fin (optionnelle)</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Lieu (optionnel)</label>
            <input
              type="text"
              placeholder="Ex : Colisée, Rome"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description (optionnelle)</label>
            <textarea
              placeholder="Ex : Réserver à l'avance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
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
