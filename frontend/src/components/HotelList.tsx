import type { FC } from "react";
import "../styles/HotelList.css";
import type { HotelListProps } from "../types/hotel";

const HotelList: FC<HotelListProps> = ({ hotels, onAdd, onEdit, onDelete }) => {
  // Trie les hôtels réservés par date de début croissante
  const reservedHotels = hotels.filter(h => h.reserved).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  // Trie les hôtels à réserver par date de début croissante
  const toBookHotels = hotels.filter(h => !h.reserved).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  return (
    <div className="hotel-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="hotel-list-title">Hôtels</h2>
        <button className="hotel-list-add-btn" onClick={onAdd}>+ Ajouter un hôtel</button>
      </div>
      {hotels.length === 0 && <div style={{ color: '#888', fontStyle: 'italic' }}>Aucun hôtel renseigné.</div>}

      {reservedHotels.length > 0 && (
        <>
          <h3 style={{ color: '#1976d2', margin: '1.2rem 0 0.5rem 0', fontSize: '1.1rem' }}>Déjà réservés</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {reservedHotels.map(hotel => (
              <li key={hotel.id} className="hotel-card reserved">
                <div className="hotel-card-header">
                  <span className="hotel-card-name">{hotel.name}</span>
                  <span style={{ color: '#388e3c', fontWeight: 500 }}>Réservé</span>
                </div>
                <div className="hotel-card-address">{hotel.address}</div>
                <div className="hotel-card-dates">
                  Du {hotel.start_date ? new Date(hotel.start_date).toLocaleDateString('fr-FR') : ''}
                  {hotel.end_date && ` au ${new Date(hotel.end_date).toLocaleDateString('fr-FR')}`}
                </div>
                {hotel.notes && <div className="hotel-card-notes">{hotel.notes}</div>}
                {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" className="hotel-card-link">Lien réservation</a>}
                <div className="hotel-card-actions">
                  <button className="hotel-card-edit" onClick={() => onEdit(hotel)}>✏️ Modifier</button>
                  <button className="hotel-card-delete" onClick={() => onDelete(hotel.id)}>🗑️ Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {toBookHotels.length > 0 && (
        <>
          <h3 style={{ color: '#b33', margin: '1.2rem 0 0.5rem 0', fontSize: '1.1rem' }}>À réserver</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {toBookHotels.map(hotel => (
              <li key={hotel.id} className="hotel-card">
                <div className="hotel-card-header">
                  <span className="hotel-card-name">{hotel.name}</span>
                  <span style={{ color: '#b33', fontWeight: 500 }}>À réserver</span>
                </div>
                <div className="hotel-card-address">{hotel.address}</div>
                <div className="hotel-card-dates">
                  Du {hotel.start_date ? new Date(hotel.start_date).toLocaleDateString('fr-FR') : ''}
                  {hotel.end_date && ` au ${new Date(hotel.end_date).toLocaleDateString('fr-FR')}`}
                </div>
                {hotel.notes && <div className="hotel-card-notes">{hotel.notes}</div>}
                {hotel.link && <a href={hotel.link} target="_blank" rel="noopener noreferrer" className="hotel-card-link">Lien réservation</a>}
                <div className="hotel-card-actions">
                  <button className="hotel-card-edit" onClick={() => onEdit(hotel)}>✏️ Modifier</button>
                  <button className="hotel-card-delete" onClick={() => onDelete(hotel.id)}>🗑️ Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default HotelList;
