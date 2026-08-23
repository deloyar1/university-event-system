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
      title,
      description,
      date,
      time,
      venue,
      category,
      organizerId: auth.currentUser.uid,
      organizerName: auth.currentUser.displayName || auth.currentUser.email,
      createdAt: new Date().toISOString(),
    });

    // matched students-দের খুঁজে notify করা
    const usersSnap = await getDocs(collection(db, "users"));
    const notifyPromises = usersSnap.docs
      .filter((docSnap) => {
        const data = docSnap.data();
        return (
          data.role === "student" &&
          Array.isArray(data.interest) &&
          data.interest.includes(category)
        );
      })
      .map((docSnap) =>
        addDoc(collection(db, "notifications"), {
          userId: docSnap.id,
          message: `New event "${title}" matches your interest in ${category}.`,
          eventId: eventRef.id,
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      );

    await Promise.all(notifyPromises);

    navigate("/events");
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>Create Event</h2>
      <form onSubmit={handleCreateEvent}>
        <input
          type="text"
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <br /><br />
        <input
          type="text"
          placeholder="Venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          required
        />
        <br /><br />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Seminar">Seminar</option>
          <option value="Workshop">Workshop</option>
          <option value="Cultural">Cultural</option>
          <option value="Sports">Sports</option>
          <option value="Career">Career</option>
        </select>
        <br /><br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}

export default CreateEvent;