import { useCallback, useEffect, useState } from "react";
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import QuickLogModal from "../../components/teacher/QuickLogModal";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function Roster() {
  const [selectedChild, setSelectedChild] = useState(null);
  const { claims, profile, loading: authLoading } = useAuth();
  const schoolId = claims?.schoolId;
  const classId = profile?.classId;
  const date = todayKey();

  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!schoolId || !classId) return;
    setLoading(true);

    const childrenSnap = await getDocs(
      query(collection(db, "schools", schoolId, "children"), where("classId", "==", classId))
    );
    setChildren(childrenSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    const attendanceSnap = await getDocs(
      query(
        collection(db, "schools", schoolId, "attendance"),
        where("date", "==", date),
        where("classId", "==", classId)
      )
    );
    const map = {};
    attendanceSnap.docs.forEach((d) => {
      map[d.data().childId] = d.data().status;
    });
    setAttendance(map);

    setLoading(false);
  }, [schoolId, classId, date]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleAttendance(childId, status) {
    const docId = `${date}_${childId}`;
    await setDoc(doc(db, "schools", schoolId, "attendance", docId), {
      childId,
      classId,
      date,
      status,
      updatedAt: serverTimestamp(),
    });
    setAttendance((prev) => ({ ...prev, [childId]: status }));
  }

  if (authLoading || loading) return <p>Loading roster...</p>;
  if (!classId) return <p>You're not assigned to a class yet — ask your admin.</p>;

  return (
    <div>
      <h2 className="section-heading" style={{ marginBottom: 16 }}>Today's roster</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Child</th>
            <th>Status</th>
            <th>Log</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child) => {
            const status = attendance[child.id] || "unmarked";
            return (
              <tr key={child.id}>
                <td>{child.name}</td>
                <td>
                  <button
                    onClick={() => toggleAttendance(child.id, "present")}
                    className={`btn ${status === "present" ? "btn-success-active" : ""}`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => toggleAttendance(child.id, "absent")}
                    className={`btn ${status === "absent" ? "btn-danger-active" : ""}`}
                  >
                    Absent
                  </button>
                </td>
                <td>
                  <button onClick={() => setSelectedChild(child)} className="btn">Log</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <QuickLogModal
        open={!!selectedChild}
        onClose={() => setSelectedChild(null)}
        schoolId={schoolId}
        child={selectedChild}
      />
    </div>
  );
}