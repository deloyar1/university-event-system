import { useState } from "react";
import { db, auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [category, setCategory] = useState("Seminar");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError("");

    if (!auth.currentUser) {
      setError("You must be logged in to create an event.");
      return;
    }

    try {
      const eventRef = await addDoc(collection(db, "events"), {
        title, description, date, time, venue, category,
        organizerId: auth.currentUser.uid,
        organizerName: auth.currentUser.displayName || auth.currentUser.email,
        createdAt: new Date().toISOString(),
      });

      const usersSnap = await getDocs(collection(db, "users"));
      const notifyPromises = usersSnap.docs
        .filter((docSnap) => {
          const data = docSnap.data();
          return data.role === "student" && Array.isArray(data.interest) && data.interest.includes(category);
        })
        .map((docSnap) =>
          addDoc(collection(db, "notifications"), {
            userId: docSnap.id,
            message: `New event "${title}" matches your interest in ${category}.`,
            eventId: eventRef.id, isRead: false, createdAt: new Date().toISOString(),
          })
        );
      await Promise.all(notifyPromises);
      navigate("/events");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-narrow">
      <h1 className="page-title">Create an event</h1>
      <p className="page-subtitle">Publish an event for students to discover.</p>
      <div className="auth-card">
        <form onSubmit={handleCreateEvent}>
          <input className="field" placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className="field" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <input className="field" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          <input className="field" placeholder="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
          <select className="field" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="Seminar">Seminar</option>
            <option value="Workshop">Workshop</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Career">Career</option>
          </select>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">Create event</button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;