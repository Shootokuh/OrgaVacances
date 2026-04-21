import { useRef, useState, useEffect } from "react";
import type { Activity } from "../types/activity";
import "../styles/ModalAddActivity.css";
import { apiFetch } from "../utils/api";

type ModalAddActivityProps = {
  onClose: () => void;
  tripId: number;
  onActivityAdded: (activity: Activity) => void;
  defaultDate: string;
};

export default function ModalAddActivity({ onClose, tripId, onActivityAdded, defaultDate }: ModalAddActivityProps) {
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const startTimeInputRef = useRef<HTMLInputElement | null>(null);
  const endTimeInputRef = useRef<HTMLInputElement | null>(null);
  
  // Formater la date au format yyyy-MM-dd si elle vient en ISO format
  const formatDateForInput = (dateValue: string): string => {
    if (!dateValue) return "";
    // Si c'est du format ISO (2026-08-29T00:00:00.000Z), extraire juste la date
    if (dateValue.includes("T")) {
      return dateValue.substring(0, 10);
    }
    // Sinon c'est déjà au format yyyy-MM-dd
    return dateValue;
  };
  
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const openPicker = (inputRef: React.RefObject<HTMLInputElement | null>, defaultDateValue?: string) => {
    const input = inputRef.current;
    if (!input) return;
    
    // Si on a une date par défaut et que le champ est vide, le remplir temporairement pour le picker
    if (defaultDateValue && !input.value) {
      input.value = defaultDateValue;
    }
    
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
      const res = await apiFetch('/api/activities', {
        method: "POST",
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
    <div className="activity-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="activity-modal-card" role="dialog" aria-modal="true" aria-labelledby="activity-modal-title">
        <div className="activity-modal-header">
          <h2 id="activity-modal-title">Ajouter une activité</h2>
          <button
            type="button"
            className="activity-modal-close"
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
          <div className="activity-modal-body">
            <div className="activity-field-group">
            <label>Nom de l’activité</label>
            <input
              type="text"
              placeholder="Ex : Visiter le musée"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            </div>

            <div className="activity-field-group">
            <label>Date</label>
              <div className="activity-input-with-icon">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  placeholder="jj/mm/aaaa"
                />
                <button
                  type="button"
                  className="activity-field-icon"
                  aria-label="Ouvrir le calendrier"
                  onClick={() => openPicker(dateInputRef, formatDateForInput(defaultDate))}
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

            <div className="activity-time-row">
              <div className="activity-field-group">
                <label>Heure de début (optionnelle)</label>
                <div className="activity-input-with-icon">
                  <input
                    ref={startTimeInputRef}
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="--:--"
                  />
                  <button
                    type="button"
                    className="activity-field-icon"
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
              <div className="activity-field-group">
                <label>Heure de fin (optionnelle)</label>
                <div className="activity-input-with-icon">
                  <input
                    ref={endTimeInputRef}
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="--:--"
                  />
                  <button
                    type="button"
                    className="activity-field-icon"
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

            <div className="activity-field-group">
            <label>Lieu (optionnel)</label>
            <input
              type="text"
              placeholder="Ex : Colisée, Rome"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            </div>

            <div className="activity-field-group">
            <label>Description (optionnelle)</label>
            <textarea
              placeholder="Ex : Réserver à l'avance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            </div>

            <div className="activity-form-actions">
              <button className="activity-btn activity-btn-secondary" type="button" onClick={onClose}>Annuler</button>
              <button className="activity-btn activity-btn-primary" type="submit">Ajouter</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
