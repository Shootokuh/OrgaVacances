import '../styles/Header.css';
import { Link, useLocation } from "react-router-dom";



export default function Header() {
  const location = useLocation();
  // Récupère l'id du voyage depuis l'URL pour toutes les pages commençant par /trip/:id
  const match = location.pathname.match(/^\/trip\/(\d+)/);
  const tripId = match ? match[1] : null;

  // Afficher le header seulement si l'URL commence par /trip/:id
  const showHeader = !!tripId;
  if (!showHeader) return null;

  // Déconnexion : supprime le token et recharge la page
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-title">PlanMyTrip</div>
      <nav className="header-nav">
        <Link to="/">Voyages</Link>
        <Link to={`/trip/${tripId}`}>Le planning</Link>
        <Link to={`/trip/${tripId}/budget`}>Budget</Link>
        <Link to={`/trip/${tripId}/checklist`}>Checklist</Link>
      </nav>
      <div className="header-actions">
        <button className="logout-button" onClick={handleLogout}>Déconnexion</button>
      </div>
    </header>
  );
}
