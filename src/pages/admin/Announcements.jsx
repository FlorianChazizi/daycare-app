import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

export default function Announcements() {
  const { claims } = useAuth();
  const schoolId = claims?.schoolId;
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    const q = query(collection(db, "schools", schoolId, "announcements"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }, [schoolId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    await addDoc(collection(db, "schools", schoolId, "announcements"), {
      title: form.title.trim(),
      body: form.body.trim(),
      createdAt: serverTimestamp(),
    });
    setSubmitting(false);
    setForm({ title: "", body: "" });
    load();
  }

  return (
    <div className="stack">
      <section>
        <h2 className="section-heading" style={{ marginBottom: 16 }}>New announcement</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="annTitle">Title</label>
            <input id="annTitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Early pickup Friday" />
          </div>
          <div className="form-field">
            <label htmlFor="annBody">Message</label>
            <textarea
              id="annBody"
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Write the announcement..."
            />
          </div>
          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send announcement"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="section-heading" style={{ marginBottom: 16 }}>History</h2>
        {loading ? (
          <p>Loading...</p>
        ) : announcements.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {announcements.map((a) => (
              <li key={a.id} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "12px 16px" }}>
                <p style={{ fontWeight: 500, margin: "0 0 4px" }}>{a.title}</p>
                <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}