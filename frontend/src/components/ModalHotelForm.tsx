import React, { useState, useEffect, useRef } from "react";
import type { Hotel } from "../types/hotel";
import "../styles/ModalAddHotel.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (hotel: Omit<Hotel, "id">) => void;
  initial?: Partial<Hotel>;
  isEdit?: boolean;
  tripStartDate?: string;
};

const defaultHotel: Omit<Hotel, "id"> = {
  name: "",
  address: "",
  start_date: "",
  end_date: "",
  price: null,
  reserved: false,
  notes: "",
  link: ""
};

const ModalHotelForm: React.FC<Props> = ({ open, onClose, onSubmit, initial, isEdit, tripStartDate }) => {
  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);
  const [hotel, setHotel] = useState<Omit<Hotel, "id">>({ ...defaultHotel, ...initial });

  // Fonction pour formater les dates au format yyyy-MM-dd
  const formatDateForInput = (d?: string): string => {
    if (!d) return "";
    // Si c'est du format ISO (2026-08-29T00:00:00.000Z), extraire juste la date
    if (d.includes("T")) {
      return d.substring(0, 10);
    }
    // Sinon essayer de parser et formatter
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const openDatePicker = (inputRef: React.RefObject<HTMLInputElement | null>, defaultDate?: string) => {
    const input = inputRef.current;
    if (!input) return;
    
    // Si on a une date par défaut et que le champ est vide, le remplir temporairement pour le picker
    if (defaultDate && !input.value) {
      input.value = defaultDate;
    }
    
    input.focus();
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.click();
    }
  };

  useEffect(() => {
    if (isEdit && initial) {
      // Mode édition: pré-remplir avec les données existantes
      setHotel(() => ({
        ...defaultHotel,
        ...initial,
        start_date: formatDateForInput(initial?.start_date),
        end_date: formatDateForInput(initial?.end_date),
        price: initial?.price === undefined || initial?.price === null || initial?.price === ""
          ? null
          : Number(initial?.price)
      }));
    } else {
      // Mode création: réinitialiser avec les valeurs par défaut (champs vides)
      setHotel(() => ({
        ...defaultHotel,
        price: null
      }));
    }
  }, [initial, open, isEdit]);

  if (!open) return null;

  return (
    <div
      className="modal-hotel-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-hotel">
        <h2>{isEdit ? "Modifier l'hôtel" : "Ajouter un hôtel"}</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit(hotel);
          }}
        >
          <div className="hotel-form-fields">
          <div className="form-group">
            <label>Nom*
              <input required value={hotel.name} onChange={e => setHotel(h => ({ ...h, name: e.target.value }))} />
            </label>
          </div>
          <div className="form-group">
            <label>Adresse
              <input value={hotel.address} onChange={e => setHotel(h => ({ ...h, address: e.target.value }))} />
            </label>
          </div>
          <div className="form-row form-row-two-cols">
            <div className="form-group">
              <label>Date d'arrivée</label>
              <div className="date-input-wrap">
                <input
                  ref={startDateInputRef}
                  type="date"
                  value={hotel.start_date}
                  onChange={e => setHotel(h => ({ ...h, start_date: e.target.value }))}
                />
                <button
                  type="button"
                  className="date-icon"
                  onClick={() => openDatePicker(startDateInputRef, formatDateForInput(tripStartDate))}
                  aria-label="Ouvrir le calendrier de date d'arrivée"
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
              <label>Date de départ</label>
              <div className="date-input-wrap">
                <input
                  ref={endDateInputRef}
                  type="date"
                  value={hotel.end_date}
                  onChange={e => setHotel(h => ({ ...h, end_date: e.target.value }))}
                />
                <button
                  type="button"
                  className="date-icon"
                  onClick={() => openDatePicker(endDateInputRef, formatDateForInput(tripStartDate))}
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
          </div>
          <div className="form-row form-row-price-reserved">
            <div className="form-group">
              <label>Prix / nuit</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ex : 172"
                value={hotel.price ?? ""}
                onChange={e => {
                  const value = e.target.value;
                  if (value === "") {
                    setHotel(h => ({ ...h, price: null }));
                    return;
                  }
                  const numericValue = Number(value);
                  if (!Number.isFinite(numericValue) || !Number.isInteger(numericValue) || numericValue < 0) {
                    return;
                  }
                  setHotel(h => ({
                    ...h,
                    price: numericValue
                  }));
                }}
              />
            </div>
            <div className="form-group reserved-group-inline">
              <label className="reserved-switch" htmlFor="hotel-reserved">
                <span className="reserved-switch-text">Réservé ?</span>
                <span className="reserved-switch-control">
                  <input
                    id="hotel-reserved"
                    type="checkbox"
                    checked={hotel.reserved}
                    onChange={e => setHotel(h => ({ ...h, reserved: e.target.checked }))}
                  />
                  <span className="reserved-switch-track" aria-hidden="true">
                    <span className="reserved-switch-thumb" />
                  </span>
                </span>
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Notes
              <input value={hotel.notes} onChange={e => setHotel(h => ({ ...h, notes: e.target.value }))} />
            </label>
          </div>
          <div className="form-group">
            <label>Lien réservation
              <input value={hotel.link} onChange={e => setHotel(h => ({ ...h, link: e.target.value }))} />
            </label>
          </div>
          </div>
          <div className="form-actions">
            <button type="button" className="hotel-btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="hotel-btn-primary">{isEdit ? "Enregistrer" : "Ajouter"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalHotelForm;
