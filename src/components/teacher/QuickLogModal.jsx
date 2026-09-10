import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Modal from "../UI/Modal";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const MEAL_OPTIONS = ["Ate all", "Ate some", "Ate none"];
const DIAPER_OPTIONS = ["Wet", "Dirty", "Dry check"];
const MOOD_OPTIONS = ["Happy", "Fussy", "Sleepy", "Sad"];

export default function QuickLogModal({ open, onClose, schoolId, child }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);

  const loadLogs = useCallback(async () => {
    if (!schoolId || !child) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, "schools", schoolId, "logs"),
        where("childId", "==", child.id),
        where("date", "==", todayKey()),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [schoolId, child]);

  useEffect(() => {
    if (open) loadLogs();
  }, [open, loadLogs]);

  async function logEntry(type, value) {
    setPending(`${type}:${value}`);
    await addDoc(collection(db, "schools", schoolId, "logs"), {
      childId: child.id,
      classId: child.classId,
      type,
      value,
      date: todayKey(),
      createdAt: serverTimestamp(),
    });
    setPending(null);
    loadLogs();
  }

  if (!open || !child) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <h2 style={{ margin: "0 0 4px", fontSize: 16 }}>{child.name}</h2>
      <p className="muted-hint" style={{ margin: "0 0 16px" }}>Quick log</p>

      <LogSection title="Meal" options={MEAL_OPTIONS} type="meal" pending={pending} onLog={logEntry} />
      <LogSection title="Nap" options={["Nap started", "Nap ended"]} type="nap" pending={pending} onLog={logEntry} />
      <LogSection title="Diaper" options={DIAPER_OPTIONS} type="diaper" pending={pending} onLog={logEntry} />
      <LogSection title="Mood" options={MOOD_OPTIONS} type="mood" pending={pending} onLog={logEntry} />

      <div style={{ marginTop: 20 }}>
        <p className="section-label">Today's log</p>
        <div className="log-scroll">
          {loading ? (
            <p style={{ fontSize: 13 }}>Loading...</p>
          ) : error ? (
            <p className="status-message error">{error}</p>
          ) : logs.length === 0 ? (
            <p className="muted-hint">Nothing logged yet today.</p>
          ) : (
            <ul className="log-list">
              {logs.map((log) => (
                <li key={log.id}>
                  <span>{log.value}</span>
                  <span className="muted-hint">
                    {log.createdAt?.toDate
                      ? log.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

function LogSection({ title, options, type, pending, onLog }) {
  return (
    <div>
      <p className="section-label">{title}</p>
      <div className="option-buttons">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onLog(type, opt)}
            disabled={pending === `${type}:${opt}`}
            className="option-btn"
          >
            {pending === `${type}:${opt}` ? "..." : opt}
          </button>
        ))}
      </div>
    </div>
  );
}