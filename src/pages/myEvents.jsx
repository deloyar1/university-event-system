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
      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, "events"),
          where("organizerId", "==", user.uid)
        );
        const querySnap = await getDocs(q);
        const eventList = querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>My Events</h2>
      {events.length === 0 && <p>You haven't created any events yet.</p>}
      {events.map((event) => (
        <div
          key={event.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "16px",
          }}
        >
          <h3>{event.title}</h3>
          <p>📅 {event.date} ⏰ {event.time}</p>
          <p>📍 {event.venue}</p>
          <Link to={`/events/${event.id}/registrations`}>
            View Registrations
          </Link>
        </div>
      ))}
    </div>
  );
}

export default MyEvents;