import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "./DashboardLayout";

const NAV_ITEMS = {
  superadmin: [
    { to: "/superadmin", label: "Schools" },
    
  ],
  admin: [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/classes", label: "Classes & children" },
    { to: "/admin/staff", label: "Staff" },
    { to: "/admin/menu", label: "Menu" },
    { to: "/admin/calendar", label: "Calendar" },
    { to: "/admin/announcements", label: "Announcements" },
  ],
  teacher: [{ to: "/teacher", label: "Roster" }],
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