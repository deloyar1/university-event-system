import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const CATEGORY_OPTIONS = ["Seminar", "Workshop", "Cultural", "Sports", "Career"];

function Profile() {
  const [user, setUser] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { setLoading(false); return; }
      setUser(currentUser);
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().interest) {
          setSelectedInterests(userDoc.data().interest);
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleInterest = (category) => {
    setSelectedInterests((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");
    try {
      await setDoc(doc(db, "users", user.uid), { interest: selectedInterests }, { merge: true });
      setMessage("Interests saved.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (!user) return <div className="page"><p className="error-text">You must be logged in.</p></div>;

  return (
    <div className="page-narrow">
      <h1 className="page-title">My interests</h1>
      <p className="page-subtitle">Pick categories to personalize your event feed.</p>
      <div className="auth-card">
        {CATEGORY_OPTIONS.map((category) => (
          <label key={category} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 15 }}>
            <input
              type="checkbox"
              checked={selectedInterests.includes(category)}
              onChange={() => toggleInterest(category)}
            />
            {category}
          </label>
        ))}
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ marginTop: 18 }}>
          {saving ? "Saving…" : "Save interests"}
        </button>
        {message && <p className="success-text" style={{ marginTop: 12 }}>{message}</p>}
      </div>
    </div>
  );
}

export default Profile;