import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        borderBottom: "1px solid #ccc",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Link to="/events">All Events</Link>

      {user ? (
        <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/create-event">Create Event</Link>
          <Link to="/my-events">My Events</Link>
          <Link to="/my-bookmarks">My Bookmarks</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/notifications">Notifications</Link>
          <span style={{ marginLeft: "auto" }}>{user.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign up</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;