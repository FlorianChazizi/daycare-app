import { useCallback, useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import ClassSection from "../../components/admin/ClassSection";
import ChildSection from "../../components/admin/ChildSection";

export default function ClassesChildren() {
  const { claims } = useAuth();
  const schoolId = claims?.schoolId;
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const loadClasses = useCallback(async () => {
    if (!schoolId) return;
    setLoadingClasses(true);
    const q = query(collection(db, "schools", schoolId, "classes"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoadingClasses(false);
  }, [schoolId]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  return (
    <div className="stack">
      <ClassSection schoolId={schoolId} classes={classes} loading={loadingClasses} onChanged={loadClasses} />
      <ChildSection schoolId={schoolId} classes={classes} />
    </div>
  );
}