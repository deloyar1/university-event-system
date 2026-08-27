import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { setError("You must be logged in."); setLoading(false); return; }
      try {
        const q = query(collection(db, "events"), where("organizerId", "==", user.uid));
        const querySnap = await getDocs(q);
        setEvents(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
      <h1 className="page-title">My events</h1>
      <p className="page-subtitle">Events you've created as an organizer.</p>

      {events.length === 0 && <div className="empty-state">You haven't created any events yet.</div>}

      {events.map((event) => (
        <div key={event.id} className="ticket">
          <div className="ticket-body" style={{ width: "100%" }}>
            <h3 className="ticket-title">{event.title}</h3>
            <p className="ticket-meta">📅 {event.date} · ⏰ {event.time}</p>
            <p className="ticket-meta">📍 {event.venue}</p>
            <div className="ticket-actions">
              <Link to={`/events/${event.id}/registrations`} className="link">View registrations</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyEvents;