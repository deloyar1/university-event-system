import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db, auth } from "../firebase/config";
import {
  doc, getDoc, collection, addDoc, query, where, getDocs,
  runTransaction, increment,
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
        if (auth.currentUser) {
          const q = query(
            collection(db, "registrations"),
            where("eventId", "==", id),
            where("studentId", "==", auth.currentUser.uid)
          );
          const querySnap = await getDocs(q);
          if (!querySnap.empty) setIsRegistered(true);
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
      const eventRef = doc(db, "events", id);

      // Atomically check seat availability and reserve a seat
      await runTransaction(db, async (transaction) => {
        const eventSnap = await transaction.get(eventRef);
        if (!eventSnap.exists()) {
          throw new Error("Event not found.");
        }
        const data = eventSnap.data();
        const capacity = data.capacity || 0;
        const registeredCount = data.registeredCount || 0;

        // capacity of 0 means unlimited seats
        if (capacity > 0 && registeredCount >= capacity) {
          throw new Error("Sorry, this event is full.");
        }

        transaction.update(eventRef, { registeredCount: increment(1) });

        const regRef = doc(collection(db, "registrations"));
        transaction.set(regRef, {
          eventId: id,
          studentId: auth.currentUser.uid,
          studentName: auth.currentUser.displayName || "",
          studentEmail: auth.currentUser.email,
          registeredAt: new Date().toISOString(),
        });
      });

      // notification (best-effort, outside the transaction)
      await addDoc(collection(db, "notifications"), {
        userId: auth.currentUser.uid,
        message: `You have successfully registered for "${event.title}".`,
        eventId: id,
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // refresh local event state to reflect new seat count
      setEvent((prev) => ({ ...prev, registeredCount: (prev.registeredCount || 0) + 1 }));
      setIsRegistered(true);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error) return <div className="page"><p className="error-text">{error}</p></div>;

  const capacity = event.capacity || 0;
  const registeredCount = event.registeredCount || 0;
  const seatsLeft = capacity > 0 ? capacity - registeredCount : null;
  const isFull = capacity > 0 && seatsLeft <= 0;

  return (
    <div className="page">
      <Link to="/events" className="link">← Back to all events</Link>
      <div className="auth-card" style={{ marginTop: 20 }}>
        <span className="badge" style={{ transform: "none", marginBottom: 10 }}>{event.category}</span>
        <h1 className="page-title" style={{ marginTop: 8 }}>{event.title}</h1>
        <p className="page-subtitle">{event.description}</p>
        <p className="ticket-meta">📅 {event.date} · ⏰ {event.time}</p>
        <p className="ticket-meta">📍 {event.venue}</p>
        <p className="ticket-meta">Organized by {event.organizerName}</p>
        {capacity > 0 && (
          <p className="ticket-meta">
            🎟️ {isFull ? "Event full" : `${seatsLeft} of ${capacity} seats left`}
          </p>
        )}

        <div style={{ marginTop: 20 }}>
          {isRegistered ? (
            <p className="success-text" style={{ display: "inline-block" }}>You are registered ✓</p>
          ) : isFull ? (
            <p className="error-text" style={{ display: "inline-block" }}>This event is full.</p>
          ) : (
            <button onClick={handleRegister} disabled={registering} className="btn btn-primary">
              {registering ? "Registering…" : "Register for this event"}
            </button>
          )}
        </div>
        {message && <p className="error-text" style={{ marginTop: 12 }}>{message}</p>}
      </div>
    </div>
  );
}

export default EventDetails;