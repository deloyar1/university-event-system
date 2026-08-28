import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="navbar-brand-dot"></span>
        Campus Events
      </Link>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <Link to="/events" className="nav-link" onClick={closeMenu}>All Events</Link>

        {user ? (
          <>
            <Link to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
            <Link to="/create-event" className="nav-link" onClick={closeMenu}>Create Event</Link>
            <Link to="/my-events" className="nav-link" onClick={closeMenu}>My Events</Link>
            <Link to="/my-bookmarks" className="nav-link" onClick={closeMenu}>Bookmarks</Link>
            <Link to="/profile" className="nav-link" onClick={closeMenu}>Profile</Link>
            <Link to="/notifications" className="nav-link" onClick={closeMenu}>Notifications</Link>
            {role === "admin" && (
              <Link to="/admin-dashboard" className="nav-link nav-admin" onClick={closeMenu}>Admin</Link>
            )}
            <span className="nav-user-email">{user.email}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link>
            <Link to="/signup" className="nav-link" onClick={closeMenu}>Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;