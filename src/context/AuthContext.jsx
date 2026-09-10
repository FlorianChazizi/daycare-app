import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const role = tokenResult.claims.role;
        const schoolId = tokenResult.claims.schoolId;
        setUser(firebaseUser);
        setClaims({ role, schoolId });

        if (role === "teacher" && schoolId) {
          const staffSnap = await getDoc(doc(db, "schools", schoolId, "staff", firebaseUser.uid));
          setProfile(staffSnap.exists() ? staffSnap.data() : null);
        } else {
          setProfile(null);
        }
      } else {
        setUser(null);
        setClaims(null);
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, claims, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);