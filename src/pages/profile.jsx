import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const CATEGORY_OPTIONS = [
  "Seminar",
  "Workshop",
  "Cultural",
  "Sports",
  "Career",
];

function Profile() {
  const [user, setUser] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().interest) {
          setSelectedInterests(userDoc.data().interest);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleInterest = (category) => {
    setSelectedInterests((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage("");
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { interest: selectedInterests },
        { merge: true }
      );
      setMessage("Interests saved successfully!");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p style={{ color: "red" }}>You must be logged in.</p>;

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>My Interests</h2>
      <p>Select the categories you're interested in:</p>

      {CATEGORY_OPTIONS.map((category) => (
        <div key={category}>
          <label>
            <input
              type="checkbox"
              checked={selectedInterests.includes(category)}
              onChange={() => toggleInterest(category)}
            />
            {" "}
            {category}
          </label>
        </div>
      ))}

      <br />
      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Interests"}
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}

export default Profile;