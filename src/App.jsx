import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Setup from "./pages/Setup";
import TeacherRoster from "./pages/teacher/Roster";

import Schools from "./pages/superadmin/Schools";

import AdminDashboard from "./pages/admin/Dashboard";
import ClassesChildren from "./pages/admin/ClassesChildren";
import Staff from "./pages/admin/Staff";
import Menu from "./pages/admin/Menu";
import Calendar from "./pages/admin/Calendar";
import Announcements from "./pages/admin/Announcements";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />

          <Route
            path="/superadmin"
            element={
              <ProtectedRoute role="superadmin">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Schools />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="classes" element={<ClassesChildren />} />
            <Route path="staff" element={<Staff />} />
            <Route path="menu" element={<Menu />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="announcements" element={<Announcements />} />
          </Route>

          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherRoster />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}