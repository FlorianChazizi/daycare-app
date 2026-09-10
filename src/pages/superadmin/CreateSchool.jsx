import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function CreateSchool() {
  const [form, setForm] = useState({
    schoolId: "", schoolName: "", adminName: "", adminEmail: "", adminPassword: "",
  });
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Creating...");
    try {
      const functions = getFunctions();
      const createSchool = httpsCallable(functions, "createSchool");
      const result = await createSchool(form);
      setStatus(`Created "${result.data.schoolId}" — hand the admin their email/password to log in.`);
    } catch (err) {
      setStatus(err.message);
    }
  }

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  return (
    <div style={{ maxWidth: 360, margin: "2rem auto" }}>
      <h1>Create a new school</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="School ID (e.g. ntintit)" value={form.schoolId} onChange={update("schoolId")} />
        <input placeholder="School name" value={form.schoolName} onChange={update("schoolName")} />
        <input placeholder="Admin name" value={form.adminName} onChange={update("adminName")} />
        <input placeholder="Admin email" value={form.adminEmail} onChange={update("adminEmail")} />
        <input placeholder="Admin temp password" type="password" value={form.adminPassword} onChange={update("adminPassword")} />
        <button type="submit">Create school</button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
}