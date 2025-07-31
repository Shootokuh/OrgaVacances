import '../styles/Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-title">PlanMyTrip</div>

      <nav className="header-nav">
        <a href="#">Voyages</a>
        <a href="#">Mes plannings</a>
        <a href="#">Budget</a>
        <a href="#">Aide</a>
      </nav>

      <button className="create-button">+ Créer un voyage</button>
    </header>
  );
}
``
