import '../styles/Header.css';

import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";



export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  // Récupère l'id du voyage depuis l'URL pour toutes les pages commençant par /trip/:id
  const match = location.pathname.match(/^\/trip\/(\d+)/);
  const tripId = match ? match[1] : null;

  // Afficher le header seulement si l'URL commence par /trip/:id
  const showHeader = !!tripId;
  if (!showHeader) return null;

  // Déconnexion : supprime le token et redirige vers l'accueil
  const handleLogout = async () => {
    localStorage.removeItem('token');
    await auth.signOut();
    navigate('/', { replace: true });
    // L'état utilisateur sera réinitialisé dans App via onAuthStateChanged
  };

  const avatarLetter = (auth.currentUser?.email || "V").charAt(0).toUpperCase();
  const tabParam = new URLSearchParams(location.search).get("tab");
  const isPlanningActive = location.pathname === `/trip/${tripId}` && tabParam !== "hotels";
  const isHotelsActive = location.pathname === `/trip/${tripId}` && tabParam === "hotels";

  return (
    <div className="header-shell">
      <header className="header">
        <Link to="/" className="header-back-link" aria-label="Retour vers les voyages">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M14.5 5L7.5 12L14.5 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Voyages</span>
        </Link>

        <nav className="header-nav" aria-label="Navigation du voyage">
          <Link to={`/trip/${tripId}`} className={isPlanningActive ? "active" : ""}>
            Le planning
          </Link>
          <Link to={`/trip/${tripId}?tab=hotels`} className={isHotelsActive ? "active" : ""}>
            Hôtels
          </Link>
          <NavLink to={`/trip/${tripId}/calendar`}>Calendrier</NavLink>
          <NavLink to={`/trip/${tripId}/budget`}>Budget</NavLink>
          <NavLink to={`/trip/${tripId}/checklist`}>Checklist</NavLink>
        </nav>

        <div className="header-actions">
          <div className="header-avatar" aria-hidden="true">{avatarLetter}</div>
          <button className="logout-button" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>
    </div>
  );
}
