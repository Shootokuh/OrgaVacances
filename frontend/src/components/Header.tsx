import '../styles/Header.css';
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="header">
      <div className="header-title">PlanMyTrip</div>

      <nav className="header-nav">
        <Link to="/">Voyages</Link> {/* ✅ renvoie vers l'accueil */}
        <a href="#">Mes plannings</a>
        <a href="#">Budget</a>
        <a href="#">Aide</a>
      </nav>

      <button className="create-button">+ Créer un voyage</button>
    </header>
  );
}
``
