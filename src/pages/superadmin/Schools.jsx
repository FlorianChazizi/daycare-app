import { useState } from "react";
import Modal from "../../components/UI/Modal";
import SchoolList from "../../components/superadmin/SchoolList";
import CreateSchoolForm from "../../components/superadmin/CreateSchoolForm";

export default function Schools() {
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <div className="row-header">
        <h2 className="section-heading">Schools</h2>
        <button className="btn" onClick={() => setModalOpen(true)}>+ New school</button>
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
    </>
  );
}