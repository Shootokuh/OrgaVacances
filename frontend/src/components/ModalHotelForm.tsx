import React, { useState, useEffect } from "react";
import type { Hotel } from "../types/hotel";
import "../styles/ModalAddHotel.css";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (hotel: Omit<Hotel, "id">) => void;
  initial?: Partial<Hotel>;
  isEdit?: boolean;
};

const defaultHotel: Omit<Hotel, "id"> = {
  name: "",
  address: "",
  start_date: "",
  end_date: "",
  reserved: false,
  notes: "",
  link: ""
};

const ModalHotelForm: React.FC<Props> = ({ open, onClose, onSubmit, initial, isEdit }) => {
  const [hotel, setHotel] = useState<Omit<Hotel, "id">>({ ...defaultHotel, ...initial });


  useEffect(() => {
    // Pour préremplir les dates au format yyyy-mm-dd si initial est fourni
    const formatDate = (d?: string) => {
      if (!d) return "";
      const date = new Date(d);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 10);
    };
    setHotel(h => ({
      ...defaultHotel,
      ...initial,
      start_date: formatDate(initial?.start_date),
      end_date: formatDate(initial?.end_date)
    }));
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="modal-hotel-overlay">
      <div className="modal-hotel">
        <h2>{isEdit ? "Modifier l'hôtel" : "Ajouter un hôtel"}</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit(hotel);
          }}
        >
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
          <div className="form-group">
            <label>Date d'arrivée
              <input type="date" value={hotel.start_date} onChange={e => setHotel(h => ({ ...h, start_date: e.target.value }))} />
            </label>
          </div>
          <div className="form-group">
            <label>Date de départ
              <input type="date" value={hotel.end_date} onChange={e => setHotel(h => ({ ...h, end_date: e.target.value }))} />
            </label>
          </div>
          <div className="form-group">
            <label>Réservé ?
              <input type="checkbox" checked={hotel.reserved} onChange={e => setHotel(h => ({ ...h, reserved: e.target.checked }))} />
            </label>
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
          <div className="form-actions">
            <button type="submit">{isEdit ? "Enregistrer" : "Ajouter"}</button>
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalHotelForm;
