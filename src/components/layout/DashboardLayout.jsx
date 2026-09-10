import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import "./DashboardLayout.css";

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
              className={({ isActive }) =>
                isActive ? "dashboard-nav-link active" : "dashboard-nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button onClick={() => signOut(auth)} className="dashboard-logout">
          Log out
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