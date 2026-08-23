import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db, auth } from "../firebase/config";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Event not found.");
        }

        // check if current user already registered
        if (auth.currentUser) {
          const q = query(
            collection(db, "registrations"),
            where("eventId", "==", id),
            where("studentId", "==", auth.currentUser.uid)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            setIsRegistered(true);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

const handleRegister = async () => {
  setMessage("");
  if (!auth.currentUser) {
    setMessage("You must be logged in to register.");
    return;
  }
  setRegistering(true);
  try {
    await addDoc(collection(db, "registrations"), {
      eventId: id,
      studentId: auth.currentUser.uid,
      studentName: auth.currentUser.displayName || "",
      studentEmail: auth.currentUser.email,
      registeredAt: new Date().toISOString(),
    });

    // notification যোগ
    await addDoc(collection(db, "notifications"), {
      userId: auth.currentUser.uid,
      message: `You have successfully registered for "${event.title}".`,
      eventId: id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    setIsRegistered(true);
  } catch (err) {
    setMessage(err.message);
  } finally {
    setRegistering(false);
  }
};
  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <Link to="/events">← Back to all events</Link>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>📅 {event.date} ⏰ {event.time}</p>
      <p>📍 {event.venue}</p>
      <p>🏷️ {event.category}</p>
      <p>Organized by: {event.organizerName}</p>

      <br />

      {isRegistered ? (
        <p style={{ color: "green", fontWeight: "bold" }}>
          You are registered ✅
        </p>
      ) : (
        <button onClick={handleRegister} disabled={registering}>
          {registering ? "Registering..." : "Register"}
        </button>
      )}

      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
}

export default EventDetails;