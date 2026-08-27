import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

function MyBookmarks() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { setError("You must be logged in."); setLoading(false); return; }
      try {
        const q = query(collection(db, "bookmarks"), where("studentId", "==", user.uid));
        const snap = await getDocs(q);
        const eventIds = snap.docs.map((d) => d.data().eventId);
        const eventDocs = await Promise.all(eventIds.map((id) => getDoc(doc(db, "events", id))));
        setEvents(eventDocs.filter((d) => d.exists()).map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error) return <div className="page"><p className="error-text">{error}</p></div>;

  return (
    <div className="page">
      <h1 className="page-title">My bookmarks</h1>
      <p className="page-subtitle">Events you've saved for later.</p>

      {events.length === 0 && <div className="empty-state">You haven't bookmarked any events yet.</div>}

      {events.map((event) => (
        <div key={event.id} className="ticket">
          <div className="ticket-body" style={{ width: "100%" }}>
            <h3 className="ticket-title">{event.title}</h3>
            <p className="ticket-meta">📅 {event.date} · ⏰ {event.time}</p>
            <p className="ticket-meta">📍 {event.venue}</p>
            <div className="ticket-actions">
              <Link to={`/events/${event.id}`} className="link">View details</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyBookmarks;