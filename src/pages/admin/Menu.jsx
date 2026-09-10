import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/UI/Modal";

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getWeekdaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export default function Menu() {
  const { claims } = useAuth();
  const schoolId = claims?.schoolId;
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState(null);
  const [form, setForm] = useState({ breakfast: "", lunch: "", snack: "" });
  const [submitting, setSubmitting] = useState(false);

  const days = getWeekdaysInMonth(cursor.year, cursor.month);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    const snap = await getDocs(collection(db, "schools", schoolId, "menu"));
    const map = {};
    snap.docs.forEach((d) => {
      map[d.id] = d.data();
    });
    setEntries(map);
    setLoading(false);
  }, [schoolId]);

  useEffect(() => {
    load();
  }, [load]);

  function openEditor(date) {
    const key = toDateKey(date);
    const existing = entries[key];
    setForm({
      breakfast: existing?.breakfast || "",
      lunch: existing?.lunch || "",
      snack: existing?.snack || "",
    });
    setEditingDate(key);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await setDoc(doc(db, "schools", schoolId, "menu", editingDate), {
      breakfast: form.breakfast.trim(),
      lunch: form.lunch.trim(),
      snack: form.snack.trim(),
    });
    setSubmitting(false);
    setEditingDate(null);
    load();
  }

  function shiftMonth(delta) {
    setCursor((prev) => {
      const d = new Date(prev.year, prev.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString([], { month: "long", year: "numeric" });

  return (
    <div>
      <div className="row-header">
        <h2 className="section-heading">Menu — {monthLabel}</h2>
        <div>
          <button className="btn" onClick={() => shiftMonth(-1)}>Prev</button>
          <button className="btn" onClick={() => shiftMonth(1)}>Next</button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Snack</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {days.map((date) => {
              const key = toDateKey(date);
              const entry = entries[key] || {};
              return (
                <tr key={key}>
                  <td>{date.toLocaleDateString([], { weekday: "short", day: "numeric" })}</td>
                  <td>{entry.breakfast || "—"}</td>
                  <td>{entry.lunch || "—"}</td>
                  <td>{entry.snack || "—"}</td>
                  <td>
                    <button className="btn" onClick={() => openEditor(date)}>Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Modal open={!!editingDate} onClose={() => setEditingDate(null)}>
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">Edit menu</h2>
          <p className="form-subtitle">{editingDate}</p>

          <div className="form-field">
            <label htmlFor="breakfast">Breakfast</label>
            <input id="breakfast" value={form.breakfast} onChange={(e) => setForm({ ...form, breakfast: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="lunch">Lunch</label>
            <input id="lunch" value={form.lunch} onChange={(e) => setForm({ ...form, lunch: e.target.value })} />
          </div>
          <div className="form-field">
            <label htmlFor="snack">Snack</label>
            <input id="snack" value={form.snack} onChange={(e) => setForm({ ...form, snack: e.target.value })} />
          </div>

          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}