import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) setRole(userDoc.data().role);
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/events" className="navbar-brand">
        <span className="navbar-brand-dot"></span>
        Campus Events
      </Link>

      <Link to="/events" className="nav-link">All Events</Link>

      {user ? (
        <>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/create-event" className="nav-link">Create Event</Link>
          <Link to="/my-events" className="nav-link">My Events</Link>
          <Link to="/my-bookmarks" className="nav-link">Bookmarks</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/notifications" className="nav-link">Notifications</Link>
          {role === "admin" && (
            <Link to="/admin-dashboard" className="nav-link nav-admin">Admin</Link>
          )}
          <span className="nav-user-email">{user.email}</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="nav-link">Sign up</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;