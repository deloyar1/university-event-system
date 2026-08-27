import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { setError("You must be logged in."); setLoading(false); return; }
      try {
        const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
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
      setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error) return <div className="page"><p className="error-text">{error}</p></div>;

  return (
    <div className="page">
      <h1 className="page-title">Notifications</h1>
      <p className="page-subtitle">Registration confirmations and events matching your interests.</p>

      {notifications.length === 0 && <div className="empty-state">No notifications yet.</div>}

      {notifications.map((n) => (
        <div key={n.id} className={`notif ${!n.isRead ? "unread" : ""}`}>
          <p style={{ margin: "0 0 6px" }}>{n.message}</p>
          <p className="notif-time" style={{ margin: 0 }}>{new Date(n.createdAt).toLocaleString()}</p>
          <div className="ticket-actions" style={{ marginTop: 8 }}>
            {n.eventId && <Link to={`/events/${n.eventId}`} className="link">View event</Link>}
            {!n.isRead && <button className="chip-btn" onClick={() => markAsRead(n.id)}>Mark as read</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Notifications;