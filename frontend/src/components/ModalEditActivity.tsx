import { useRef, useState } from "react";
import type { Activity } from "../types/activity";
import "../styles/ModalEditActivity.css";
import { apiFetch } from '../utils/api';

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
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const startTimeInputRef = useRef<HTMLInputElement | null>(null);
  const endTimeInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description || "");
  const [date, setDate] = useState(activity.date.slice(0, 10));
  const [time, setTime] = useState(activity.time || "");
  const [endTime, setEndTime] = useState(activity.end_time || "");
  const [location, setLocation] = useState(activity.location || "");

  const openPicker = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
  };

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
      const res = await apiFetch(`/api/activities/${activity.id}`, {
        method: "PUT",
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
      className="edit-activity-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="edit-activity-modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-activity-modal-title">
        <div className="edit-activity-modal-header">
          <h2 id="edit-activity-modal-title">Modifier l’activité</h2>
          <button
            type="button"
            className="edit-activity-modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="edit-activity-modal-body">
            <div className="edit-activity-field-group">
              <label>Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="edit-activity-field-group">
              <label>Date</label>
              <div className="edit-activity-input-with-icon">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="edit-activity-field-icon"
                  aria-label="Ouvrir le calendrier"
                  onClick={() => openPicker(dateInputRef)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="3.5" y="4" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M3.5 9H20.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="edit-activity-time-row">
              <div className="edit-activity-field-group">
                <label>Heure de début</label>
                <div className="edit-activity-input-with-icon">
                  <input
                    ref={startTimeInputRef}
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                  <button
                    type="button"
                    className="edit-activity-field-icon"
                    aria-label="Ouvrir la sélection d'heure de début"
                    onClick={() => openPicker(startTimeInputRef)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 8V12L14.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="edit-activity-field-group">
                <label>Heure de fin</label>
                <div className="edit-activity-input-with-icon">
                  <input
                    ref={endTimeInputRef}
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <button
                    type="button"
                    className="edit-activity-field-icon"
                    aria-label="Ouvrir la sélection d'heure de fin"
                    onClick={() => openPicker(endTimeInputRef)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M12 8V12L14.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="edit-activity-field-group">
              <label>Lieu</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="edit-activity-field-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="edit-activity-form-actions">
              <button className="edit-activity-btn edit-activity-btn-secondary" type="button" onClick={onClose}>
                Annuler
              </button>
              <button className="edit-activity-btn edit-activity-btn-primary" type="submit">Enregistrer</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
