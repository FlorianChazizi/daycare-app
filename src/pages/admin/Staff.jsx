import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import StaffSection from "../../components/admin/StaffSection";

export default function Staff() {
  const { claims } = useAuth();
  const schoolId = claims?.schoolId;
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    async function loadClasses() {
      if (!schoolId) return;
      const q = query(collection(db, "schools", schoolId, "classes"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    loadClasses();
  }, [schoolId]);

  return <StaffSection schoolId={schoolId} classes={classes} />;
}