import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/UI/Modal";

export default function Calendar() {
  const { claims } = useAuth();
  const schoolId = claims?.schoolId;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", type: "event" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    const q = query(collection(db, "schools", schoolId, "events"), orderBy("date", "asc"));
    const snap = await getDocs(q);
    setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }, [schoolId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date) return;
    setSubmitting(true);
    await addDoc(collection(db, "schools", schoolId, "events"), {
      title: form.title.trim(),
      date: form.date,
      type: form.type,
      createdAt: serverTimestamp(),
    });
    setSubmitting(false);
    setForm({ title: "", date: "", type: "event" });
    setModalOpen(false);
    load();
  }

  async function handleDelete(eventId) {
    await deleteDoc(doc(db, "schools", schoolId, "events", eventId));
    load();
  }

  return (
    <div>
      <div className="row-header">
        <h2 className="section-heading">Calendar</h2>
        <button className="btn" onClick={() => setModalOpen(true)}>+ New event</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Type</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{ev.date}</td>
                <td>{ev.title}</td>
                <td>{ev.type === "closure" ? "Closure" : "Event"}</td>
                <td>
                  <button className="btn" onClick={() => handleDelete(ev.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">New event</h2>
          <p className="form-subtitle">Add an event or closure to the school calendar.</p>

          <div className="form-field">
            <label htmlFor="eventTitle">Title</label>
            <input id="eventTitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Parent-teacher day" />
          </div>
          <div className="form-field">
            <label htmlFor="eventDate">Date</label>
            <input id="eventDate" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="eventType">Type</label>
            <select id="eventType" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="event">Event</option>
              <option value="closure">Closure</option>
            </select>
          </div>

          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create event"}
          </button>
        </form>
      </Modal>
    </div>
  );
}