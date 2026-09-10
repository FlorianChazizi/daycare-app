import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Modal from "../UI/Modal";

export default function ClassSection({ schoolId, classes, loading, onChanged }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
          {classes.map((c) => (
            <li key={c.id} className="chip">{c.name}</li>
          ))}
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