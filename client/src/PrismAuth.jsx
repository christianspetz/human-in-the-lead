import { useState, useEffect } from "react";
import PrismL4 from "./PrismL4";

const FONT = "'DM Sans', sans-serif";
const SERIF = "'Playfair Display', serif";

export default function PrismAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("login"); // login or register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Check existing session on load
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    setError("");
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { email, password, name };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setUser(data.user);
    } catch { setError("Connection failed"); }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#111110", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      Loading...
    </div>
  );

  if (user) return <PrismL4 user={user} onLogout={handleLogout} />;

  // Login/Register form
  return (
    <div style={{ minHeight: "100vh", background: "#111110", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", maxWidth: 360, width: "100%" }}>
        <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "3px", marginBottom: 8 }}>humaninthelead.ai</div>
        <div style={{ fontSize: 28, fontFamily: SERIF, color: "#EEEAE4", marginBottom: 4 }}>PrismL4</div>
        <div style={{ fontSize: 12, color: "#B8B0A4", marginBottom: 32 }}>Bottom-Up Value Identification Engine</div>

        <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{ flex: 1, padding: "8px", background: mode === m ? "#D4A85320" : "transparent", border: `1px solid ${mode === m ? "#D4A853" : "#2A2A25"}`, color: mode === m ? "#D4A853" : "#888", fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer", borderRadius: m === "login" ? "8px 0 0 8px" : "0 8px 8px 0", textTransform: "uppercase", letterSpacing: "1px" }}>
              {m}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {mode === "register" && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={{ padding: "10px 14px", background: "#1A1A18", border: "1px solid #2A2A25", borderRadius: 8, color: "#EEEAE4", fontFamily: FONT, fontSize: 14, outline: "none" }} />
          )}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" autoFocus style={{ padding: "10px 14px", background: "#1A1A18", border: "1px solid #2A2A25", borderRadius: 8, color: "#EEEAE4", fontFamily: FONT, fontSize: 14, outline: "none" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" onKeyDown={e => e.key === "Enter" && handleSubmit()} style={{ padding: "10px 14px", background: "#1A1A18", border: "1px solid #2A2A25", borderRadius: 8, color: "#EEEAE4", fontFamily: FONT, fontSize: 14, outline: "none" }} />
          <button onClick={handleSubmit} style={{ padding: "10px 24px", borderRadius: 8, background: "#D4A853", border: "none", color: "#111110", fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

        {error && <div style={{ fontSize: 12, color: "#D48A8A", marginTop: 10 }}>{error}</div>}
        <div style={{ marginTop: 40, fontSize: 10, color: "#555" }}>humaninthelead.ai</div>
      </div>
    </div>
  );
}
