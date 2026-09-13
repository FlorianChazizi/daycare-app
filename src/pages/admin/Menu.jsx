import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

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

const EMPTY_MEAL = { breakfast: "", lunch: "", snack: "" };

export default function Menu() {
  const { claims } = useAuth();
  const schoolId = claims?.schoolId;
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

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

  function startEditMonth() {
    const initialDraft = {};
    days.forEach((date) => {
      const key = toDateKey(date);
      initialDraft[key] = { ...EMPTY_MEAL, ...(entries[key] || {}) };
    });
    setDraft(initialDraft);
    setEditMode(true);
  }

  function cancelEditMonth() {
    setEditMode(false);
    setDraft({});
  }

  function updateDraftField(key, field, value) {
    setDraft((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  function copyToSameWeekday(sourceDate) {
    const sourceKey = toDateKey(sourceDate);
    const sourceMeal = draft[sourceKey];
    const weekday = sourceDate.getDay();
    setDraft((prev) => {
      const next = { ...prev };
      days.forEach((date) => {
        if (date.getDay() === weekday) {
          next[toDateKey(date)] = { ...sourceMeal };
        }
      });
      return next;
    });
  }

  async function saveMonth() {
    setSaving(true);
    const writes = days
      .map((date) => {
        const key = toDateKey(date);
        const current = { ...EMPTY_MEAL, ...(entries[key] || {}) };
        const next = draft[key] || EMPTY_MEAL;
        const trimmed = {
          breakfast: next.breakfast.trim(),
          lunch: next.lunch.trim(),
          snack: next.snack.trim(),
        };
        const changed =
          current.breakfast !== trimmed.breakfast ||
          current.lunch !== trimmed.lunch ||
          current.snack !== trimmed.snack;
        if (!changed) return null;
        return setDoc(doc(db, "schools", schoolId, "menu", key), trimmed);
      })
      .filter(Boolean);

    await Promise.all(writes);
    setSaving(false);
    setEditMode(false);
    setDraft({});
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
          <button className="btn" onClick={() => shiftMonth(-1)} disabled={editMode}>Prev</button>
          <button className="btn" onClick={() => shiftMonth(1)} disabled={editMode}>Next</button>
          {editMode ? (
            <>
              <button className="btn" onClick={cancelEditMonth} disabled={saving}>Cancel</button>
              <button className="btn btn-success-active" onClick={saveMonth} disabled={saving}>
                {saving ? "Saving..." : "Save month"}
              </button>
            </>
          ) : (
            <button className="btn" onClick={startEditMonth}>Edit month</button>
          )}
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Snack</th>
                {editMode && <th></th>}
              </tr>
            </thead>
            <tbody>
              {days.map((date) => {
                const key = toDateKey(date);
                const entry = entries[key] || {};
                const draftEntry = draft[key] || EMPTY_MEAL;
                const weekdayLabel = date.toLocaleDateString([], { weekday: "long" });
                return (
                  <tr key={key}>
                    <td>{date.toLocaleDateString([], { weekday: "short", day: "numeric" })}</td>
                    {editMode ? (
                      <>
                        <td>
                          <input
                            className="inline-edit-input"
                            value={draftEntry.breakfast}
                            onChange={(e) => updateDraftField(key, "breakfast", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            className="inline-edit-input"
                            value={draftEntry.lunch}
                            onChange={(e) => updateDraftField(key, "lunch", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            className="inline-edit-input"
                            value={draftEntry.snack}
                            onChange={(e) => updateDraftField(key, "snack", e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn"
                            onClick={() => copyToSameWeekday(date)}
                            title={`Copy this day's meals to every ${weekdayLabel} this month`}
                          >
                            Copy to all {weekdayLabel}s
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{entry.breakfast || "—"}</td>
                        <td>{entry.lunch || "—"}</td>
                        <td>{entry.snack || "—"}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
