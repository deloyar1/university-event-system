import { useEffect, useState } from "react";
import { db, auth } from "../firebase/config";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
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
      if (!user) { setLoading(false); return; }
      const usersSnap = await getDocs(collection(db, "users"));
      const usersList = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(usersList);
      setRole(usersList.find((u) => u.id === user.uid)?.role || null);

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
      await Promise.all(users.map((u) =>
        addDoc(collection(db, "notifications"), {
          userId: u.id, message: broadcastMsg, eventId: null,
          isRead: false, createdAt: new Date().toISOString(),
        })
      ));
      setFeedback("Broadcast sent to all users.");
      setBroadcastMsg("");
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (role !== "admin") return <div className="page"><p className="error-text">Access denied. Admins only.</p></div>;

  return (
    <div className="page" style={{ maxWidth: 820 }}>
      <h1 className="page-title">Admin dashboard</h1>
      <p className="page-subtitle">Manage users, moderate events, and send announcements.</p>

      <h2 style={{ fontSize: 20 }}>Users ({users.length})</h2>
      <table className="data-table" style={{ marginBottom: 32 }}>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 20 }}>Send broadcast notification</h2>
      <div className="auth-card" style={{ marginBottom: 32 }}>
        <textarea
          className="field"
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
          placeholder="Message to send to every user…"
        />
        <button onClick={handleBroadcast} disabled={sending} className="btn btn-primary">
          {sending ? "Sending…" : "Send to all users"}
        </button>
        {feedback && <p className="success-text" style={{ marginTop: 12 }}>{feedback}</p>}
      </div>

      <h2 style={{ fontSize: 20 }}>All events ({events.length})</h2>
      {events.map((ev) => (
        <div key={ev.id} className="ticket">
          <div className="ticket-body" style={{ width: "100%" }}>
            <h3 className="ticket-title">{ev.title}</h3>
            <p className="ticket-meta">🏷️ {ev.category} · by {ev.organizerName}</p>
            <div className="ticket-actions">
              <button className="btn btn-danger" onClick={() => handleDeleteEvent(ev.id)}>Delete event</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;