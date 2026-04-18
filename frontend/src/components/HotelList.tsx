import type { FC } from "react";
import "../styles/HotelList.css";
import type { HotelListProps } from "../types/hotel";

const HotelList: FC<HotelListProps> = ({ hotels, onAdd, onEdit, onDelete }) => {
  const reservedHotels = hotels.filter(h => h.reserved).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  const toBookHotels = hotels.filter(h => !h.reserved).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  const formatDateShort = (date: string) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
    return `${day} ${month}`;
  };

  const formatPricePerNight = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") return "";
    const numericValue = typeof value === "string" ? Number(value) : value;
    if (!Number.isFinite(numericValue)) return "";

    const wholePrice = Math.round(numericValue);
    const formatted = wholePrice.toLocaleString("fr-FR");
    return `${formatted}€ / nuit`;
  };

  const renderHotelCard = (hotel: HotelListProps["hotels"][number]) => {
    const startDate = hotel.start_date ? formatDateShort(hotel.start_date) : '';
    const endDate = hotel.end_date ? formatDateShort(hotel.end_date) : '';
    const dateRange = endDate ? `${startDate} → ${endDate}` : startDate;
    const pricePerNight = formatPricePerNight(hotel.price);

    return (
      <div className="hotel-card">
        <div className="hotel-card-left">
          <div className="hotel-card-icon" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 46H47" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"/>
              <path d="M14 46V17.5C14 15.567 15.567 14 17.5 14H38.5C40.433 14 42 15.567 42 17.5V46" stroke="currentColor" strokeWidth="2.1"/>
              <path d="M24.5 46V35.5C24.5 33.843 25.843 32.5 27.5 32.5H28.5C30.157 32.5 31.5 33.843 31.5 35.5V46" stroke="currentColor" strokeWidth="2.1"/>
              <rect x="20" y="20" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="27" y="20" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="34" y="20" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="20" y="27" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="27" y="27" width="4" height="4" rx="1" fill="currentColor"/>
              <rect x="34" y="27" width="4" height="4" rx="1" fill="currentColor"/>
              <path d="M17.5 10.5L18.2 12L19.8 12.2L18.6 13.3L18.9 14.9L17.5 14.1L16.1 14.9L16.4 13.3L15.2 12.2L16.8 12L17.5 10.5Z" fill="currentColor"/>
              <path d="M38.5 10.5L39.2 12L40.8 12.2L39.6 13.3L39.9 14.9L38.5 14.1L37.1 14.9L37.4 13.3L36.2 12.2L37.8 12L38.5 10.5Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <div className="hotel-card-center">
          <div className="hotel-card-name">{hotel.name}</div>
          <div className="hotel-card-address">{hotel.address}</div>
          {hotel.notes && <div className="hotel-card-note">{hotel.notes}</div>}
          <div className="hotel-card-pills">
            <span className="pill">
              <span className="pill-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3.5" y="4" width="17" height="16" rx="3" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M8 2.75V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M16 2.75V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M3.5 9H20.5" stroke="currentColor" strokeWidth="1.6"/>
                </svg>
              </span>
              <span>{dateRange}</span>
            </span>
            {pricePerNight && (
              <span className="pill">
                <span className="pill-icon" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M3.5 10H20.5" stroke="currentColor" strokeWidth="1.6"/>
                    <circle cx="8" cy="14.5" r="1" fill="currentColor"/>
                  </svg>
                </span>
                <span>{pricePerNight}</span>
              </span>
            )}
          </div>
          {hotel.link && (
            <a href={hotel.link} target="_blank" rel="noopener noreferrer" className="hotel-card-link">
              <span className="hotel-link-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.5 14.5L14.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M10.75 7H15.5V11.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.2 17H8.5C7.12 17 6 15.88 6 14.5V8.5C6 7.12 7.12 6 8.5 6H14.5C15.88 6 17 7.12 17 8.5V10.2" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
              </span>
              <span>Lien de réservation</span>
              <span className="link-icon" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 14L14.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M11.5 8H16V12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
          )}
        </div>

        <div className="hotel-card-right">
          <div className="hotel-card-status">
            {hotel.reserved ? (
              <span className="status-badge reserved">
                <span className="status-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 8.5C4.5 7.4 5.4 6.5 6.5 6.5H17.5C18.6 6.5 19.5 7.4 19.5 8.5V16.5C19.5 17.6 18.6 18.5 17.5 18.5H6.5C5.4 18.5 4.5 17.6 4.5 16.5V8.5Z" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M9 6.5V5.5C9 4.67 9.67 4 10.5 4H13.5C14.33 4 15 4.67 15 5.5V6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </span>
                <span>Réservé</span>
              </span>
            ) : (
              <span className="status-badge pending">À réserver</span>
            )}
          </div>
          <div className="hotel-card-buttons">
            <button className="hotel-btn edit" onClick={() => onEdit(hotel)} title="Modifier">
              <span className="action-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 19L8.2 18.3L17.2 9.3C17.98 8.52 17.98 7.25 17.2 6.47V6.47C16.42 5.69 15.15 5.69 14.37 6.47L5.37 15.47L5 19Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span>Modifier</span>
            </button>
            <button className="hotel-btn delete" onClick={() => onDelete(hotel.id)} title="Supprimer">
              <span className="action-icon" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 6.5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M10 4.5H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <path d="M7 6.5L7.8 18.1C7.88 19.16 8.76 20 9.82 20H14.18C15.24 20 16.12 19.16 16.2 18.1L17 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </span>
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="hotel-list-wrapper">
      <div className="hotel-list-header">
        <div className="hotel-list-header-content">
          <h2 className="hotel-list-title">Hôtels du voyage</h2>
          <p className="hotel-list-subtitle">Gérez et suivez vos réservations d'hôtels.</p>
        </div>
        <button className="hotel-list-add-btn" onClick={onAdd}>+ Ajouter un hôtel</button>
      </div>

      {hotels.length === 0 && (
        <div className="hotel-list-empty">
          <div className="hotel-list-empty-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.5 20.5H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5.5 20.5V7.5C5.5 6.4 6.4 5.5 7.5 5.5H16.5C17.6 5.5 18.5 6.4 18.5 7.5V20.5" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="8" y="8" width="2" height="2" rx="0.4" fill="currentColor"/>
              <rect x="12" y="8" width="2" height="2" rx="0.4" fill="currentColor"/>
              <rect x="8" y="12" width="2" height="2" rx="0.4" fill="currentColor"/>
              <rect x="12" y="12" width="2" height="2" rx="0.4" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="hotel-list-empty-title">Vous n’avez pas encore ajouté d’hôtel</h3>
          <p className="hotel-list-empty-text">Ajoutez vos hébergements pour tout centraliser et voyager l’esprit tranquille.</p>
          <button className="hotel-list-add-btn" onClick={onAdd}>+ Ajouter un hôtel</button>
        </div>
      )}

      {hotels.length > 0 && (
        <div className="hotel-list">
          {reservedHotels.map(hotel => (
            <div key={hotel.id}>
              {renderHotelCard(hotel)}
            </div>
          ))}
          {toBookHotels.map(hotel => (
            <div key={hotel.id}>
              {renderHotelCard(hotel)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelList;
