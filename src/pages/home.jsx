import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={{ textAlign: "center", padding: "90px 20px 60px" }}>
      <span className="badge" style={{ transform: "none", marginBottom: 18 }}>
        Hajee Mohammad Danesh Science and Technology University
      </span>
      <h1 style={{ fontSize: 44, margin: "18px 0 10px" }}>
        Never miss a campus event again
      </h1>
      <p className="page-subtitle" style={{ maxWidth: 520, margin: "0 auto 32px", fontSize: 16 }}>
        Discover seminars, workshops, and cultural events picked for your interests —
        or publish your own as an organizer.
      </p>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Link to="/events" className="btn btn-primary">Browse events</Link>
        <Link to="/signup" className="btn btn-outline">Create an account</Link>
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          justifyContent: "center",
          marginTop: 70,
          flexWrap: "wrap",
        }}
      >
        {[
          { title: "Discover", text: "Search and filter events by category." },
          { title: "Get matched", text: "See events picked from your interests first." },
          { title: "Register", text: "One click to confirm your spot." },
        ].map((f) => (
          <div
            key={f.title}
            className="auth-card"
            style={{ width: 220, textAlign: "left", padding: "22px 20px" }}
          >
            <h3 style={{ fontSize: 17, marginBottom: 6 }}>{f.title}</h3>
            <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;