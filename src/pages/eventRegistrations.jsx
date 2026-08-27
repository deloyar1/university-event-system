import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

function EventRegistrations() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", id));
        if (eventDoc.exists()) setEvent({ id: eventDoc.id, ...eventDoc.data() });

        const q = query(collection(db, "registrations"), where("eventId", "==", id));
        const querySnap = await getDocs(q);
        setRegistrations(querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error) return <div className="page"><p className="error-text">{error}</p></div>;

  return (
    <div className="page">
      <Link to="/my-events" className="link">← Back to my events</Link>
      <h1 className="page-title" style={{ marginTop: 16 }}>{event?.title}</h1>
      <p className="page-subtitle">{registrations.length} student{registrations.length !== 1 ? "s" : ""} registered</p>

      {registrations.length === 0 ? (
        <div className="empty-state">No one has registered yet.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Registered at</th></tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg.id}>
                <td>{reg.studentName || "—"}</td>
                <td>{reg.studentEmail}</td>
                <td>{new Date(reg.registeredAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EventRegistrations;