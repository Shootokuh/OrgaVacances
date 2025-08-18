import { useState } from "react";
import type { Activity } from "../types/activity";
import "../styles/ModalEditActivity.css";

type ModalEditActivityProps = {
  activity: Activity;
  onClose: () => void;
  onActivityUpdated: (updated: Activity) => void;
};

export default function ModalEditActivity({
  activity,
  onClose,
  onActivityUpdated,
}: ModalEditActivityProps) {
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description || "");
  const [date, setDate] = useState(activity.date.slice(0, 10));
  const [time, setTime] = useState(activity.time || "");
  const [endTime, setEndTime] = useState(activity.end_time || "");
  const [location, setLocation] = useState(activity.location || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation heure de fin >= heure de début
    if (time && endTime && endTime < time) {
      alert("L'heure de fin ne peut pas être avant l'heure de début.");
      return;
    }

    const updatedActivity = {
      title,
      description,
      date,
      time,
      end_time: endTime,
      location,
    };

    try {
      const res = await fetch(`http://localhost:3001/api/activities/${activity.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedActivity),
      });

      if (!res.ok) throw new Error("Erreur lors de la mise à jour");

      const updated = await res.json();
      onActivityUpdated(updated);
      onClose();
    } catch (err) {
      console.error("Erreur mise à jour activité:", err);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-content">
        <h2>Modifier l’activité</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            <label>Heure de début</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Heure de fin</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Lieu</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit">Enregistrer</button>
            <button type="button" onClick={onClose}>
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
