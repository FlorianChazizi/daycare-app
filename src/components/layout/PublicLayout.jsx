import { Link, Outlet } from "react-router-dom";
import Logo from "./Logo";

export default function PublicLayout() {
  return (
    <div className="public-shell">
      <header className="public-header">
        <Link to="/" className="public-brand">
          <Logo size={30} />
          <span>Day Care</span>
        </Link>

        <nav className="public-nav">
          <Link to="/about">Σχετικά</Link>
          <Link to="/support">Υποστήριξη</Link>
          <Link to="/login" className="public-signin-btn">
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
