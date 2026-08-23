import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, "notifications", notifId), { isRead: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Notifications</h2>
      {notifications.length === 0 && <p>No notifications yet.</p>}
      {notifications.map((n) => (
        <div
          key={n.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "12px",
            background: n.isRead ? "#fff" : "#f0f8ff",
          }}
        >
          <p style={{ margin: 0 }}>{n.message}</p>
          <small>{new Date(n.createdAt).toLocaleString()}</small>
          <br />
          {n.eventId && (
            <Link to={`/events/${n.eventId}`}>View Event</Link>
          )}
          {"  "}
          {!n.isRead && (
            <button onClick={() => markAsRead(n.id)}>Mark as read</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Notifications;