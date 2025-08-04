import '../styles/Header.css';
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  // Afficher le header seulement si l'URL correspond à /trip/:id
  const showHeader = /^\/trip\/\d+$/.test(location.pathname);

  if (!showHeader) return null;

  return (
    <header className="header">
      <div className="header-title">PlanMyTrip</div>

      <nav className="header-nav">
        <Link to="/">Voyages</Link>
        <a href="#">Le planning</a>
        <a href="#">Budget</a>
        <a href="#">Checklist</a>
      </nav>

      <button className="create-button">+ Créer un voyage</button>
    </header>
  );
}
