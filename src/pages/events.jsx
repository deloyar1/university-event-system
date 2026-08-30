import { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { collection, getDocs, addDoc, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { computeMatchScores } from "../utils/recommendation";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [user, setUser] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [matchScores, setMatchScores] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventList);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const q = query(collection(db, "bookmarks"), where("studentId", "==", user.uid));
      const snap = await getDocs(q);
      setBookmarkedIds(snap.docs.map((d) => d.data().eventId));

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().interest) {
        setUserInterests(userDoc.data().interest);
      }
    };
    fetchUserData();
  }, [user]);

  // recompute TF-IDF match scores whenever events or interests change
  useEffect(() => {
    if (events.length === 0) return;
    const scores = computeMatchScores(events, userInterests);
    setMatchScores(scores);
  }, [events, userInterests]);

  const handleBookmark = async (eventId) => {
    if (!user) {
      alert("You must be logged in to bookmark events.");
      return;
    }
    try {
      await addDoc(collection(db, "bookmarks"), {
        eventId,
        studentId: user.uid,
        savedAt: new Date().toISOString(),
      });
      setBookmarkedIds((prev) => [...prev, eventId]);
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ["All", ...new Set(events.map((e) => e.category))];

  let filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // sort by TF-IDF match score, highest first
  filteredEvents = [...filteredEvents].sort((a, b) => {
    const scoreA = matchScores[a.id] || 0;
    const scoreB = matchScores[b.id] || 0;
    return scoreB - scoreA;
  });

  if (loading) return <div className="page"><p className="muted">Loading events…</p></div>;

  return (
    <div className="page">
      <h1 className="page-title">All Events</h1>
      <p className="page-subtitle">Browse what's happening on campus.</p>

      <div className="toolbar">
        <input
          type="text"
          className="field"
          placeholder="Search events…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="field"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredEvents.length === 0 && (
        <div className="empty-state">No matching events found.</div>
      )}

      {filteredEvents.map((event) => {
        const score = matchScores[event.id] || 0;
        const isRecommended = score >= 20;
        const dateObj = event.date ? new Date(event.date) : null;
        const seatsLeft = event.capacity ? event.capacity - (event.registeredCount || 0) : null;

        return (
          <div key={event.id} className={`ticket ${isRecommended ? "recommended" : ""}`}>
            <div className="ticket-stub">
              <span className="day">{dateObj ? dateObj.getDate() : "--"}</span>
              <span className="month">{dateObj ? MONTHS[dateObj.getMonth()] : ""}</span>
              <span className="time">{event.time}</span>
            </div>
            <div className="ticket-perforation"></div>
            <div className="ticket-body">
              <div className="ticket-top-row">
                <div>
                  <h3 className="ticket-title">{event.title}</h3>
                </div>
                {userInterests.length > 0 && (
                  <span className="badge" style={{ transform: "none" }}>
                    {score}% Match
                  </span>
                )}
              </div>
              <p className="ticket-desc">{event.description}</p>
              <p className="ticket-meta">📍 {event.venue} · 🏷️ {event.category}</p>
              <p className="ticket-meta">Organized by {event.organizerName}</p>
              {event.capacity ? (
                <p className="ticket-meta">
                  🎟️ {seatsLeft > 0 ? `${seatsLeft} seat${seatsLeft !== 1 ? "s" : ""} left` : "Full"}
                </p>
              ) : null}
              <div className="ticket-actions">
                <Link to={`/events/${event.id}`} className="link">View details</Link>
                {bookmarkedIds.includes(event.id) ? (
                  <span className="chip-done">✓ Bookmarked</span>
                ) : (
                  <button className="chip-btn" onClick={() => handleBookmark(event.id)}>
                    🔖 Bookmark
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Events;