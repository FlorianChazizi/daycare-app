import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function SchoolList({ refreshKey }) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const q = query(collection(db, "schools"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setSchools(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, [refreshKey]);

  if (loading) return <p>Loading schools...</p>;
  if (schools.length === 0) return <p>No schools yet — create your first one.</p>;

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Name</th>
          <th style={styles.th}>School ID</th>
        </tr>
      </thead>
      <tbody>
        {schools.map((school) => (
          <tr key={school.id}>
            <td style={styles.td}>{school.name}</td>
            <td style={styles.td}>{school.id}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 13,
    color: "var(--color-text-muted)",
    borderBottom: "1px solid var(--color-border)",
    padding: "8px 12px",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid var(--color-border)",
    fontSize: 14,
  },
};