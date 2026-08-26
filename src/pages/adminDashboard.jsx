import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import {
  collection, getDocs, deleteDoc, doc, addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function AdminDashboard() {
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      const usersSnap = await getDocs(collection(db, "users"));
      const usersList = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(usersList);

      const currentUserDoc = usersList.find((u) => u.id === user.uid);
      setRole(currentUserDoc?.role || null);

      const eventsSnap = await getDocs(collection(db, "events"));
      setEvents(eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Delete this event permanently?")) return;
    try {
      await deleteDoc(doc(db, "events", eventId));
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setSending(true);
    setFeedback("");
    try {
      const notifyPromises = users.map((u) =>
        addDoc(collection(db, "notifications"), {
          userId: u.id,
          message: broadcastMsg,
          eventId: null,
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      );
      await Promise.all(notifyPromises);
      setFeedback("Broadcast sent to all users.");
      setBroadcastMsg("");
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (role !== "admin") return <p style={{ color: "red" }}>Access denied. Admins only.</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>Admin Dashboard</h2>

      <h3>Users ({users.length})</h3>
      <table border="1" cellPadding="8" style={{ width: "100%", marginBottom: "30px" }}>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Send Broadcast Notification</h3>
      <textarea
        value={broadcastMsg}
        onChange={(e) => setBroadcastMsg(e.target.value)}
        placeholder="Message to send to every user..."
        style={{ width: "100%", minHeight: "60px" }}
      />
      <br /><br />
      <button onClick={handleBroadcast} disabled={sending}>
        {sending ? "Sending..." : "Send to All Users"}
      </button>
      {feedback && <p>{feedback}</p>}

      <h3 style={{ marginTop: "30px" }}>All Events ({events.length})</h3>
      {events.map((ev) => (
        <div
          key={ev.id}
          style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "12px", marginBottom: "10px" }}
        >
          <strong>{ev.title}</strong> — {ev.category} — by {ev.organizerName}
          <br />
          <button onClick={() => handleDeleteEvent(ev.id)} style={{ marginTop: "8px" }}>
            Delete Event
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;