import { useState, useEffect } from "react";
import { db, auth } from "../firebase/config";
import { collection, getDocs, addDoc, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [user, setUser] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [userInterests, setUserInterests] = useState([]);

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

      // bookmarks
      const q = query(
        collection(db, "bookmarks"),
        where("studentId", "==", user.uid)
      );
      const snap = await getDocs(q);
      setBookmarkedIds(snap.docs.map((d) => d.data().eventId));

      // interests
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().interest) {
        setUserInterests(userDoc.data().interest);
      }
    };
    fetchUserData();
  }, [user]);

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

  // filter by search + category first
  let filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // then sort: matched interest events first
  filteredEvents = [...filteredEvents].sort((a, b) => {
    const aMatch = userInterests.includes(a.category) ? 1 : 0;
    const bMatch = userInterests.includes(b.category) ? 1 : 0;
    return bMatch - aMatch; // matched ones come first
  });

  if (loading) return <p>Loading events...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>All Events</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filteredEvents.length === 0 && <p>No matching events found.</p>}

      {filteredEvents.map((event) => {
        const isRecommended = userInterests.includes(event.category);
        return (
          <div
            key={event.id}
            style={{
              border: isRecommended ? "2px solid #4caf50" : "1px solid #ccc",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            {isRecommended && (
              <p style={{ color: "#4caf50", fontWeight: "bold", margin: 0 }}>
                ⭐ Recommended for you
              </p>
            )}
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>
              📅 {event.date} ⏰ {event.time}
            </p>
            <p>📍 {event.venue}</p>
            <p>🏷️ {event.category}</p>
            <p>Organized by: {event.organizerName}</p>
            <Link to={`/events/${event.id}`}>View Details</Link>
            {"  |  "}
            {bookmarkedIds.includes(event.id) ? (
              <span style={{ color: "green" }}>Bookmarked ✅</span>
            ) : (
              <button onClick={() => handleBookmark(event.id)}>
                🔖 Bookmark
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Events;