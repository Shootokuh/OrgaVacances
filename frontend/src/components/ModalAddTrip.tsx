import { useEffect, useMemo, useRef, useState } from "react";
import type { Trip } from "../types/trip";
import "../styles/ModalAddTrip.css";
import { apiFetch } from "../utils/api";
import { uploadTripCoverImage, validateTripCoverFile } from "../utils/tripCoverUpload";

type ModalAddTripProps = {
  onClose: () => void;
  onTripAdded: (trip: Trip) => void;
  onTripUpdated?: (trip: Trip) => void;
  initialTrip?: Trip | null;
};

export default function ModalAddTrip({ onClose, onTripAdded, onTripUpdated, initialTrip = null }: ModalAddTripProps) {
  const isEditMode = Boolean(initialTrip);
  const fileInputId = "trip-cover-file-input";
  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialTrip) {
      setTitle("");
      setDestination("");
      setStartDate("");
      setEndDate("");
      setCoverImageFile(null);
      setCoverImageUrl(null);
      setRemoveImage(false);
      setErrorMessage("");
      return;
    }

    setTitle(initialTrip.title || "");
    setDestination(initialTrip.destination || "");
    setStartDate(initialTrip.start_date ? initialTrip.start_date.slice(0, 10) : "");
    setEndDate(initialTrip.end_date ? initialTrip.end_date.slice(0, 10) : "");
    setCoverImageFile(null);
    setCoverImageUrl(initialTrip.cover_image_url || null);
    setRemoveImage(false);
    setErrorMessage("");
  }, [initialTrip]);

  const previewUrl = useMemo(() => {
    if (removeImage) return "";
    if (coverImageFile) return URL.createObjectURL(coverImageFile);
    return coverImageUrl || "";
  }, [coverImageFile, coverImageUrl, removeImage]);

  useEffect(() => {
    return () => {
      if (coverImageFile && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [coverImageFile, previewUrl]);

  const resetForm = () => {
    setTitle("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    setCoverImageFile(null);
    setCoverImageUrl(null);
    setRemoveImage(false);
    setErrorMessage("");
  };

  const handleCoverImageChange = (file: File | null) => {
    setErrorMessage("");
    if (!file) {
      setCoverImageFile(null);
      return;
    }
    const validationError = validateTripCoverFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setCoverImageFile(null);
      return;
    }
    setRemoveImage(false);
    setCoverImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      let nextCoverImageUrl: string | null = coverImageUrl;
      if (removeImage) {
        nextCoverImageUrl = null;
      }
      if (coverImageFile) {
        nextCoverImageUrl = await uploadTripCoverImage(coverImageFile);
      }

      const tripPayload = {
        title,
        destination,
        start_date: startDate,
        end_date: endDate,
        cover_image_url: nextCoverImageUrl,
      };

      const endpoint = isEditMode ? `/api/trips/${initialTrip?.id}` : "/api/trips";
      const method = isEditMode ? "PUT" : "POST";

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(tripPayload),
        });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || "Erreur lors de l'enregistrement");
      }

      if (isEditMode) {
        onTripUpdated?.(payload);
      } else {
        onTripAdded(payload);
      }

      resetForm();
      onClose();
    } catch (err) {
      console.error("Erreur :", err);
      setErrorMessage(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDatePicker = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
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
      <div className="modal-content modal-add-trip-card">
        <h2>{isEditMode ? "Modifier le voyage" : "Ajouter un nouveau voyage"}</h2>

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
            <div className="date-input-wrap">
              <input
                ref={startDateInputRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <button
                type="button"
                className="date-icon"
                onClick={() => openDatePicker(startDateInputRef)}
                aria-label="Ouvrir le calendrier de date de départ"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3.25" y="4.25" width="17.5" height="16.5" rx="3.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M16 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3.25 9.25H20.75" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Date de retour</label>
            <div className="date-input-wrap">
              <input
                ref={endDateInputRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
              <button
                type="button"
                className="date-icon"
                onClick={() => openDatePicker(endDateInputRef)}
                aria-label="Ouvrir le calendrier de date de retour"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3.25" y="4.25" width="17.5" height="16.5" rx="3.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M16 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3.25 9.25H20.75" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Image du voyage (optionnel)</label>
            <input
              id={fileInputId}
              className="file-input-hidden"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => handleCoverImageChange(e.target.files?.[0] || null)}
            />
            <label htmlFor={fileInputId} className="file-field" aria-label="Choisir une photo">
              <span className="file-trigger">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4.5 7.5C4.5 5.84315 5.84315 4.5 7.5 4.5H16.5C18.1569 4.5 19.5 5.84315 19.5 7.5V16.5C19.5 18.1569 18.1569 19.5 16.5 19.5H7.5C5.84315 19.5 4.5 18.1569 4.5 16.5V7.5Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 15L10.8 12.2C11.1904 11.8096 11.8235 11.8096 12.2139 12.2L14.5 14.4861" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="14.75" cy="9.25" r="1.25" fill="currentColor"/>
                </svg>
                Choisir une photo
              </span>
              <span className="file-name" title={coverImageFile?.name || "Aucune photo sélectionnée"}>
                {coverImageFile?.name || "Aucune photo sélectionnée"}
              </span>
            </label>
            {previewUrl && !removeImage && (
              <img src={previewUrl} alt="Aperçu" className="trip-cover-preview" />
            )}
            {isEditMode && coverImageUrl && !coverImageFile && (
              <label className="remove-image-toggle">
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(e) => setRemoveImage(e.target.checked)}
                />
                Supprimer l'image existante
              </label>
            )}
          </div>

          {errorMessage && <p className="trip-form-error">{errorMessage}</p>}

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting}>Annuler</button>
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Enregistrement..." : isEditMode ? "Enregistrer" : "Ajouter"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
