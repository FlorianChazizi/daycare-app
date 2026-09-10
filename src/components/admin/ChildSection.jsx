import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase";
import Modal from "../UI/Modal";

export default function ChildSection({ schoolId, classes }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", classId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [codes, setCodes] = useState({});
  const [generating, setGenerating] = useState(null);

  const loadChildren = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    const q = query(collection(db, "schools", schoolId, "children"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setChildren(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }, [schoolId]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  function classNameFor(classId) {
    return classes.find((c) => c.id === classId)?.name || "Unassigned";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.classId) return;
    setSubmitting(true);
    await addDoc(collection(db, "schools", schoolId, "children"), {
      name: form.name.trim(),
      classId: form.classId,
      createdAt: serverTimestamp(),
    });
    setSubmitting(false);
    setForm({ name: "", classId: "" });
    setModalOpen(false);
    loadChildren();
  }

  async function generateCode(childId) {
    setGenerating(childId);
    try {
      const functions = getFunctions();
      const generateChildInviteCode = httpsCallable(functions, "generateChildInviteCode");
      const result = await generateChildInviteCode({ childId });
      setCodes((prev) => ({ ...prev, [childId]: result.data.code }));
    } catch (err) {
      setCodes((prev) => ({ ...prev, [childId]: `Error: ${err.message}` }));
    } finally {
      setGenerating(null);
    }
  }

  return (
    <section>
      <div className="row-header row-header--tight">
        <h2 className="section-heading">Children</h2>
        <button className="btn" onClick={() => setModalOpen(true)} disabled={classes.length === 0}>+ New child</button>
      </div>

      {classes.length === 0 && <p className="muted-hint">Create a class first.</p>}

      {loading ? (
        <p>Loading...</p>
      ) : children.length === 0 ? (
        <p>No children yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Invite code</th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => (
              <tr key={child.id}>
                <td>{child.name}</td>
                <td>{classNameFor(child.classId)}</td>
                <td>
                  {codes[child.id] ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <code style={{ fontSize: 13, fontWeight: 500 }}>{codes[child.id]}</code>
                      <button className="btn" onClick={() => generateCode(child.id)} disabled={generating === child.id}>
                        Regenerate
                      </button>
                    </span>
                  ) : (
                    <button className="btn" onClick={() => generateCode(child.id)} disabled={generating === child.id}>
                      {generating === child.id ? "Generating..." : "Generate code"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">New child</h2>
          <p className="form-subtitle">Add a child and assign them to a class.</p>

          <div className="form-field">
            <label htmlFor="childName">Child's name</label>
            <input
              id="childName"
              placeholder="e.g. Maria Papadopoulou"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="childClass">Class</label>
            <select id="childClass" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create child"}
          </button>
        </form>
      </Modal>
    </section>
  );
}