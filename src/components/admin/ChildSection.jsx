import { useCallback, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase";
import Modal from "../UI/Modal";
import { IconPencil, IconTrash, IconCheck, IconX } from "../UI/ActionIcons";

export default function ChildSection({ schoolId, classes }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", classId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [codes, setCodes] = useState({});
  const [generating, setGenerating] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", classId: "" });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  function startEdit(child) {
    setEditingId(child.id);
    setEditForm({ name: child.name, classId: child.classId || "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ name: "", classId: "" });
  }

  async function saveEdit(childId) {
    if (!editForm.name.trim() || !editForm.classId) return;
    setSavingId(childId);
    await updateDoc(doc(db, "schools", schoolId, "children", childId), {
      name: editForm.name.trim(),
      classId: editForm.classId,
    });
    setSavingId(null);
    setEditingId(null);
    setEditForm({ name: "", classId: "" });
    loadChildren();
  }

  async function handleDelete(childId, childName) {
    if (!window.confirm(`Delete "${childName}"? This cannot be undone.`)) return;
    setDeletingId(childId);
    await deleteDoc(doc(db, "schools", schoolId, "children", childId));
    setDeletingId(null);
    loadChildren();
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
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Invite code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child) => {
                const isEditing = editingId === child.id;
                return (
                  <tr key={child.id}>
                    <td>
                      {isEditing ? (
                        <input
                          className="inline-edit-input"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          autoFocus
                        />
                      ) : (
                        child.name
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          className="inline-edit-select"
                          value={editForm.classId}
                          onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                        >
                          <option value="">Select a class</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        classNameFor(child.classId)
                      )}
                    </td>
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
                    <td>
                      {isEditing ? (
                        <span className="chip-actions">
                          <button
                            type="button"
                            className="icon-btn icon-btn--confirm"
                            onClick={() => saveEdit(child.id)}
                            disabled={savingId === child.id}
                            aria-label="Save"
                            title="Save"
                          >
                            <IconCheck />
                          </button>
                          <button type="button" className="icon-btn" onClick={cancelEdit} aria-label="Cancel" title="Cancel">
                            <IconX />
                          </button>
                        </span>
                      ) : (
                        <span className="chip-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => startEdit(child)}
                            aria-label="Edit"
                            title="Edit"
                          >
                            <IconPencil />
                          </button>
                          <button
                            type="button"
                            className="icon-btn icon-btn--danger"
                            onClick={() => handleDelete(child.id, child.name)}
                            disabled={deletingId === child.id}
                            aria-label="Delete"
                            title="Delete"
                          >
                            <IconTrash />
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
