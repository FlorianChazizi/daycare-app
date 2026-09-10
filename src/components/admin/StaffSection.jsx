import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase";
import Modal from "../UI/Modal";

export default function StaffSection({ schoolId, classes }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "teacher", classId: "" });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadStaff = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    const q = query(collection(db, "schools", schoolId, "staff"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }, [schoolId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  function classNameFor(classId) {
    return classes.find((c) => c.id === classId)?.name || "Unassigned";
  }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setStatus({ type: "error", message: "Fill in name, email, and password." });
      return;
    }
    if (form.role === "teacher" && !form.classId) {
      setStatus({ type: "error", message: "Select a class for this teacher." });
      return;
    }

    setSubmitting(true);
    try {
      const functions = getFunctions();
      const createStaffAccount = httpsCallable(functions, "createStaffAccount");
      await createStaffAccount({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        classId: form.role === "teacher" ? form.classId : null,
      });
      setStatus({ type: "success", message: `${form.role === "admin" ? "Admin" : "Teacher"} account created.` });
      setForm({ name: "", email: "", password: "", role: "teacher", classId: "" });
      setModalOpen(false);
      loadStaff();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="row-header row-header--tight">
        <h2 className="section-heading">Staff</h2>
        <button className="btn" onClick={() => setModalOpen(true)}>+ New staff</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : staff.length === 0 ? (
        <p>No staff yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Class</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.role}</td>
                <td>{s.role === "teacher" ? classNameFor(s.classId) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <h2 className="form-title">New staff member</h2>
          <p className="form-subtitle">Creates a login for this school's admin or teacher.</p>

          <p className="form-section-label">Account</p>
          <div className="form-field">
            <label htmlFor="staffName">Name</label>
            <input id="staffName" value={form.name} onChange={update("name")} placeholder="Jane Doe" />
          </div>
          <div className="form-field">
            <label htmlFor="staffEmail">Email</label>
            <input id="staffEmail" type="email" value={form.email} onChange={update("email")} placeholder="jane@school.com" />
          </div>
          <div className="form-field">
            <label htmlFor="staffPassword">Temporary password</label>
            <input id="staffPassword" type="password" value={form.password} onChange={update("password")} placeholder="••••••••" />
          </div>

          <p className="form-section-label">Role</p>
          <div className="form-field">
            <label htmlFor="staffRole">Role</label>
            <select id="staffRole" value={form.role} onChange={update("role")}>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {form.role === "teacher" && (
            <div className="form-field">
              <label htmlFor="staffClass">Class</label>
              <select id="staffClass" value={form.classId} onChange={update("classId")}>
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="form-submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </button>

          {status && <p className={`form-status ${status.type}`}>{status.message}</p>}
        </form>
      </Modal>
    </section>
  );
}