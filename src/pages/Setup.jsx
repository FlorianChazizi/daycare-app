import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function Setup() {
  const [form, setForm] = useState({ email: "", password: "", secret: "" });
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Creating...");
    try {
      const functions = getFunctions();
      const bootstrap = httpsCallable(functions, "bootstrapSuperAdmin");
      await bootstrap(form);
      setStatus("Super admin created. Go to /login and sign in.");
    } catch (err) {
      setStatus(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: "4rem auto" }}>
      <h1>One-time setup</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="Your email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input placeholder="Setup key" type="password" value={form.secret}
          onChange={(e) => setForm({ ...form, secret: e.target.value })} />
        <button type="submit">Create super admin</button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
}