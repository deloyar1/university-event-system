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
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        }

        const q = query(
          collection(db, "registrations"),
          where("eventId", "==", id)
        );
        const querySnap = await getDocs(q);
        const regList = querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRegistrations(regList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <Link to="/my-events">← Back to my events</Link>
      <h2>Registrations for: {event?.title}</h2>
      <p>Total registered: {registrations.length}</p>

      {registrations.length === 0 && <p>No one has registered yet.</p>}

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "16px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Registered At</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id}>
              <td>{reg.studentName || "N/A"}</td>
              <td>{reg.studentEmail}</td>
              <td>{new Date(reg.registeredAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EventRegistrations;