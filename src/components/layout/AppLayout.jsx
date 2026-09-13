import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "./DashboardLayout";

function IconGraduationCap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M6 11v6c0 1.5 2.5 3 6 3s6-1.5 6-3v-6" />
      <path d="M21 8v6" />
    </svg>
  );
}

function IconBarChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10" />
      <path d="M12 20V4" />
      <path d="M20 20v-7" />
    </svg>
  );
}

function IconGroup() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M4 20c0-3 2.5-5 5-5s5 2 5 5" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M15 20c.2-2.2 1.7-4 3.5-4" />
    </svg>
  );
}

function IconIdBadge() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="2.8" />
      <path d="M8 17c.5-2 2-3 4-3s3.5 1 4 3" />
    </svg>
  );
}

function IconUtensils() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v6a1.5 1.5 0 0 0 3 0V3" />
      <path d="M8.5 9v12" />
      <path d="M16 3c-1.7 0-3 1.8-3 4s1.3 4 3 4v10" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  );
}

function IconMegaphone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11v2a2 2 0 0 0 2 2h1l3 5" />
      <path d="M6 11h3l8-5v14l-8-5H6z" />
      <path d="M18 10a3 3 0 0 1 0 4" />
    </svg>
  );
}

function IconClipboardList() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M8 11h8" />
      <path d="M8 15h8" />
      <path d="M8 19h5" />
    </svg>
  );
}

const NAV_ITEMS = {
  superadmin: [
    { to: "/superadmin", label: "Schools", Icon: IconGraduationCap },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", Icon: IconBarChart },
    { to: "/admin/classes", label: "Classes & children", Icon: IconGroup },
    { to: "/admin/staff", label: "Staff", Icon: IconIdBadge },
    { to: "/admin/menu", label: "Menu", Icon: IconUtensils },
    { to: "/admin/calendar", label: "Calendar", Icon: IconCalendar },
    { to: "/admin/announcements", label: "Announcements", Icon: IconMegaphone },
  ],
  teacher: [{ to: "/teacher", label: "Roster", Icon: IconClipboardList }],
};

const TITLES = {
  superadmin: "Super admin",
  admin: "Admin",
  teacher: "Teacher",
};

export default function AppLayout() {
  const { claims } = useAuth();
  const role = claims?.role;

  return (
    <DashboardLayout title={TITLES[role]} navItems={NAV_ITEMS[role] || []}>
      <Outlet />
    </DashboardLayout>
  );
}
