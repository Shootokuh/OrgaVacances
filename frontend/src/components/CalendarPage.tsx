
import CalendarView from "./CalendarView";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Activity } from "../types/activity";
import type { Hotel } from "../types/hotel";
import type { Trip } from "../types/trip";
import { apiFetch } from "../utils/api";
import "../styles/TripDetails.css";
import "../styles/CalendarPage.css";

function formatDateMedium(dateValue: string) {
  if (!dateValue) return "Dates à définir";
  const parsedDate = dateValue.includes("T") || dateValue.includes(" ")
    ? new Date(dateValue)
    : new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "Dates à définir";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export default function CalendarPage() {
  const { id } = useParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/activities/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setActivities(data));
    apiFetch(`/api/hotels/trip/${id}`)
      .then((res) => res.json())
      .then((data) => setHotels(data));
    apiFetch(`/api/trips/${id}`)
      .then((res) => res.json())
      .then((data) => setTrip(data));
  }, [id]);

  useEffect(() => {
    if (!trip) return;
    const today = new Date();
    const start = trip.start_date
      ? (trip.start_date.includes("T") || trip.start_date.includes(" ")
        ? new Date(trip.start_date)
        : new Date(`${trip.start_date.slice(0, 10)}T00:00:00`))
      : null;
    if (!start || Number.isNaN(start.getTime())) {
      setDefaultDate(today.toISOString().slice(0, 10));
      return;
    }
    // Si le début du voyage est dans le futur, on affiche cette date
    if (today < start) {
      setDefaultDate(trip.start_date.slice(0, 10));
    } else {
      // Sinon, on affiche aujourd'hui
      setDefaultDate(today.toISOString().slice(0, 10));
    }
  }, [trip]);

  if (!trip) {
    return (
      <div className="calendar-page-shell">
        <div className="trip-details-container">
          <div className="calendar-page-loading-card">Chargement du calendrier...</div>
        </div>
      </div>
    );
  }

  const tripDates = `${formatDateMedium(trip.start_date)} - ${formatDateMedium(trip.end_date)}`;

  return (
    <div className="calendar-page-shell">
      <div className="trip-details-container calendar-page-container">
        <section className="trip-hero-card calendar-hero-card">
          <div className="trip-hero-cover-wrap">
            {trip.cover_image_url ? (
              <img
                src={trip.cover_image_url}
                alt={`Couverture du voyage ${trip.title}`}
                className="trip-hero-cover"
              />
            ) : (
              <div className="trip-hero-cover trip-hero-fallback" aria-hidden="true" />
            )}
            <div className="trip-hero-overlay">
              <h1 className="trip-hero-title">{trip.title}</h1>
              <p className="trip-hero-subtitle" title={trip.destination}>
                {trip.destination}
              </p>
            </div>
          </div>

          <div className="trip-meta-bar">
            <div className="trip-meta-item">
              <span className="trip-meta-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3.25" y="4.25" width="17.5" height="16.5" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M16 2.75V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M3.25 9.25H20.75" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <span>{tripDates}</span>
            </div>
            <div className="trip-meta-item">
              <span className="trip-meta-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 7.5H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M5 16.5H19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <circle cx="3.5" cy="7.5" r="1.1" fill="currentColor" />
                  <circle cx="3.5" cy="12" r="1.1" fill="currentColor" />
                  <circle cx="3.5" cy="16.5" r="1.1" fill="currentColor" />
                </svg>
              </span>
              <span>{trip.activities_count ?? activities.length} activité{(trip.activities_count ?? activities.length) > 1 ? "s" : ""}</span>
            </div>
            <div className="trip-meta-item">
              <span className="trip-meta-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M3.5 10H20.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="8" cy="14.5" r="1" fill="currentColor" />
                </svg>
              </span>
              <span>{trip.budget.toLocaleString("fr-FR")} €</span>
            </div>
          </div>
        </section>

        <section className="calendar-page-section">
          <div className="calendar-page-title-row">
            <h2 className="calendar-section-title">Calendrier</h2>
          </div>

          <CalendarView activities={activities} hotels={hotels} defaultDate={defaultDate} />
        </section>
      </div>
    </div>
  );
}
