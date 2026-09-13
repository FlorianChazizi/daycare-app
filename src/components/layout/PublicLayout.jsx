import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Logo from "./Logo";

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="public-shell">
      <header className="public-header">
        <Link to="/" className="public-brand" onClick={closeMenu}>
          <Logo size={30} />
          <span>Day Care</span>
        </Link>

        <button
          type="button"
          className="public-menu-toggle"
          aria-label={menuOpen ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={`hamburger${menuOpen ? " hamburger--open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav className={`public-nav${menuOpen ? " public-nav--open" : ""}`}>
          <Link to="/about" onClick={closeMenu}>
            Σχετικά
          </Link>
          <Link to="/support" onClick={closeMenu}>
            Υποστήριξη
          </Link>
          <Link to="/login" className="public-signin-btn" onClick={closeMenu}>
            Σύνδεση
          </Link>
        </nav>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="public-footer-brand">
          <Logo size={22} />
          <span>Day Care</span>
        </div>

        <nav className="public-footer-links">
          <Link to="/about">Σχετικά</Link>
          <Link to="/support">Υποστήριξη</Link>
          <Link to="/terms">Όροι Χρήσης</Link>
          <Link to="/privacy">Πολιτική Απορρήτου</Link>
        </nav>

        <p className="public-footer-copy">
          © {new Date().getFullYear()} Day Care. Με επιφύλαξη κάθε νόμιμου δικαιώματος.
        </p>
      </footer>
    </div>
  );
}
