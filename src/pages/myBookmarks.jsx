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
      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }
      try {
        // get this user's bookmark documents
        const q = query(
          collection(db, "bookmarks"),
          where("studentId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const eventIds = snap.docs.map((d) => d.data().eventId);

        // fetch actual event details for each bookmarked eventId
        const eventPromises = eventIds.map((id) => getDoc(doc(db, "events", id)));
        const eventDocs = await Promise.all(eventPromises);
        const eventList = eventDocs
          .filter((d) => d.exists())
          .map((d) => ({ id: d.id, ...d.data() }));

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
      <h2>My Bookmarks</h2>
      {events.length === 0 && <p>You haven't bookmarked any events yet.</p>}
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
          <Link to={`/events/${event.id}`}>View Details</Link>
        </div>
      ))}
    </div>
  );
}

export default MyBookmarks;