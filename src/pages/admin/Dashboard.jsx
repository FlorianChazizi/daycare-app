import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const { claims } = useAuth();
  const schoolId = claims?.schoolId;
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [children, setChildren] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [logsToday, setLogsToday] = useState([]);
  const [staffCount, setStaffCount] = useState(0);

  useEffect(() => {
    async function load() {
      if (!schoolId) return;
      setLoading(true);
      const date = todayKey();

      const [classesSnap, childrenSnap, attendanceSnap, logsSnap, staffSnap] = await Promise.all([
        getDocs(collection(db, "schools", schoolId, "classes")),
        getDocs(collection(db, "schools", schoolId, "children")),
        getDocs(query(collection(db, "schools", schoolId, "attendance"), where("date", "==", date))),
        getDocs(query(collection(db, "schools", schoolId, "logs"), where("date", "==", date))),
        getDocs(collection(db, "schools", schoolId, "staff")),
      ]);

      setClasses(classesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setChildren(childrenSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setAttendanceToday(attendanceSnap.docs.map((d) => d.data()));
      setLogsToday(logsSnap.docs.map((d) => d.data()));
      setStaffCount(staffSnap.size);
      setLoading(false);
    }
    load();
  }, [schoolId]);

  if (loading) return <p>Loading dashboard...</p>;

  const presentToday = attendanceToday.filter((a) => a.status === "present").length;
  const totalChildren = children.length;

  return (
    <div>
      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-label">Present today</p>
          <p className="metric-value">{presentToday} / {totalChildren}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Logs recorded today</p>
          <p className="metric-value">{logsToday.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Staff</p>
          <p className="metric-value">{staffCount}</p>
        </div>
      </div>

      <h2 className="section-heading" style={{ marginBottom: 16 }}>By class</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Class</th>
            <th>Children</th>
            <th>Present today</th>
            <th>Logged today</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((cls) => {
            const classChildren = children.filter((c) => c.classId === cls.id);
            const classPresent = attendanceToday.filter((a) => a.classId === cls.id && a.status === "present").length;
            const classLogs = logsToday.filter((l) => l.classId === cls.id).length;
            return (
              <tr key={cls.id}>
                <td>{cls.name}</td>
                <td>{classChildren.length}</td>
                <td>{classPresent}</td>
                <td>{classLogs}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}