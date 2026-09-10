import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import "./CreateSchoolForm.css";

export default function CreateSchoolForm({ onCreated }) {
  const [form, setForm] = useState({
    schoolId: "", schoolName: "", adminName: "", adminEmail: "", adminPassword: "",
  });
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const functions = getFunctions();
      const createSchool = httpsCallable(functions, "createSchool");
      const result = await createSchool(form);
      setStatus({ type: "success", message: `Created "${result.data.schoolId}" — hand the admin their email/password.` });
      setForm({ schoolId: "", schoolName: "", adminName: "", adminEmail: "", adminPassword: "" });
      onCreated?.();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="school-form-title">Create a new school</h2>
      <p className="school-form-subtitle">Sets up the school and its first admin account.</p>

      <p className="school-form-section-label">School</p>
      <div className="school-form-field">
        <label htmlFor="schoolName">School name</label>
        <input id="schoolName" value={form.schoolName} onChange={update("schoolName")} placeholder="Ntintit Daycare" />
      </div>
      <div className="school-form-field">
        <label htmlFor="schoolId">School ID</label>
        <input id="schoolId" value={form.schoolId} onChange={update("schoolId")} placeholder="ntintit" />
      </div>

      <p className="school-form-section-label">Admin account</p>
      <div className="school-form-field">
        <label htmlFor="adminName">Name</label>
        <input id="adminName" value={form.adminName} onChange={update("adminName")} placeholder="Jane Doe" />
      </div>
      <div className="school-form-field">
        <label htmlFor="adminEmail">Email</label>
        <input id="adminEmail" type="email" value={form.adminEmail} onChange={update("adminEmail")} placeholder="owner@school.com" />
      </div>
      <div className="school-form-field">
        <label htmlFor="adminPassword">Temporary password</label>
        <input id="adminPassword" type="password" value={form.adminPassword} onChange={update("adminPassword")} placeholder="••••••••" />
      </div>

      <button type="submit" className="school-form-submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create school"}
      </button>

      {status && <p className={`school-form-status ${status.type}`}>{status.message}</p>}
    </form>
  );
}