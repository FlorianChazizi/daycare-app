import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import "./DashboardLayout.css";

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function DashboardLayout({ title, navItems = [], children }) {
  return (
    <div className="dashboard-wrapper">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">Daycare app</div>

        <nav className="dashboard-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              title={item.label}
              className={({ isActive }) =>
                isActive ? "dashboard-nav-link active" : "dashboard-nav-link"
              }
            >
              <span className="dashboard-nav-icon">
                <item.Icon />
              </span>
              <span className="dashboard-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button onClick={() => signOut(auth)} className="dashboard-logout" title="Log out">
          <span className="dashboard-nav-icon">
            <IconLogout />
          </span>
          <span className="dashboard-nav-label">Log out</span>
        </button>
      </aside>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1 className="dashboard-title">{title}</h1>
        </header>
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
