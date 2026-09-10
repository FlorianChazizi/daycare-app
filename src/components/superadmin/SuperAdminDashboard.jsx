import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import Modal from "../UI/Modal";
import SchoolList from "./SchoolList";
import CreateSchoolForm from "./CreateSchoolForm";

const navItems = [{ to: "/superadmin", label: "Schools" }];

export default function SuperAdminDashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <DashboardLayout title="Super admin" navItems={navItems}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>Schools</h2>
        <button onClick={() => setModalOpen(true)}>+ New school</button>
      </div>

      <SchoolList refreshKey={refreshKey} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <CreateSchoolForm
          onCreated={() => {
            setRefreshKey((k) => k + 1);
            setModalOpen(false);
          }}
        />
      </Modal>
    </DashboardLayout>
  );
}