import { useState } from "react";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Modal from "../UI/Modal";
import { IconPencil, IconTrash, IconCheck, IconX } from "../UI/ActionIcons";

export default function ClassSection({ schoolId, classes, loading, onChanged }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await addDoc(collection(db, "schools", schoolId, "classes"), {
      name: name.trim(),
      createdAt: serverTimestamp(),
    });
    setSubmitting(false);
    setName("");
    setModalOpen(false);
    onChanged();
  }

  function startEdit(classItem) {
    setEditingId(classItem.id);
    setEditName(classItem.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function saveEdit(classId) {
    if (!editName.trim()) return;
    setSavingId(classId);
    await updateDoc(doc(db, "schools", schoolId, "classes", classId), {
      name: editName.trim(),
    });
    setSavingId(null);
    setEditingId(null);
    setEditName("");
    onChanged();
  }

  async function handleDelete(classId, className) {
    if (!window.confirm(`Delete "${className}"? Children assigned to it will show as unassigned.`)) return;
    setDeletingId(classId);
    await deleteDoc(doc(db, "schools", schoolId, "classes", classId));
    setDeletingId(null);
    onChanged();
  }

  return (
    <section>
      <div className="row-header row-header--tight">
        <h2 className="section-heading">Classes</h2>
        <button className="btn" onClick={() => setModalOpen(true)}>+ New class</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : classes.length === 0 ? (
        <p>No classes yet — create your first one.</p>
      ) : (
        <ul className="chip-list">
          {classes.map((c) =>
            editingId === c.id ? (
              <li key={c.id} className="chip">
                <input
                  className="inline-edit-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <span className="chip-actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn--confirm"
                    onClick={() => saveEdit(c.id)}
                    disabled={savingId === c.id}
                    aria-label="Save"
                    title="Save"
                  >
                    <IconCheck />
                  </button>
                  <button type="button" className="icon-btn" onClick={cancelEdit} aria-label="Cancel" title="Cancel">
                    <IconX />
                  </button>
                </span>
              </li>
            ) : (
              <li key={c.id} className="chip">
                {c.name}
                <span className="chip-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => startEdit(c)}
                    aria-label="Edit"
                    title="Edit"
                  >
                    <IconPencil />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={deletingId === c.id}
                    aria-label="Delete"
                    title="Delete"
                  >
                    <IconTrash />
                  </button>
                </span>
              </li>
            )
          )}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">New class</h2>
          <p className="form-subtitle">Add a class to organize children and assign teachers.</p>

          <div className="form-field">
            <label htmlFor="className">Class name</label>
            <input
              id="className"
              placeholder="e.g. Toddlers A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create class"}
          </button>
        </form>
      </Modal>
    </section>
  );
}
