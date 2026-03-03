import { useState, useEffect } from "react";
import PrismL4 from "./PrismL4";

const FONT = "'DM Sans', sans-serif";
const SERIF = "'Playfair Display', serif";
const GOLD = "#D4A853", GREEN = "#7CB9A8", BLUE = "#7BA7CC", RED = "#D48A8A", PURPLE = "#C4A1D4";

export default function PrismAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("login"); // login or register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  // Assessment picker state
  const [assessments, setAssessments] = useState(null);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [creating, setCreating] = useState(false);

  // Check existing session on load
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch assessments when user authenticates
  useEffect(() => {
    if (!user) { setAssessments(null); return; }
    fetchAssessments();
  }, [user]);

  const fetchAssessments = async () => {
    setLoadingAssessments(true);
    try {
      const res = await fetch("/api/assessments", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAssessments(data);
      }
    } catch {}
    setLoadingAssessments(false);
  };

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
    setActiveAssessment(null);
    setAssessments(null);
  };

  const handleCreateAssessment = async () => {
    if (!newCompany.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ companyName: newCompany.trim(), functionId: "finance", functionName: "Finance" }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowNewModal(false);
        setNewCompany("");
        await openAssessment(data.id);
      }
    } catch {}
    setCreating(false);
  };

  const openAssessment = async (id) => {
    setLoadingAssessments(true);
    try {
      const res = await fetch(`/api/assessments/${id}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setActiveAssessment({ id: data.id, data: data.data, company_name: data.company_name, function_name: data.function_name, user_id: data.user_id });
      }
    } catch {}
    setLoadingAssessments(false);
  };

  const handleBack = () => {
    setActiveAssessment(null);
    fetchAssessments();
  };

  const handleDeleteAssessment = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this assessment? This cannot be undone.")) return;
    try {
      await fetch(`/api/assessments/${id}`, { method: "DELETE", credentials: "include" });
      fetchAssessments();
    } catch {}
  };

  const cardStyle = { background: "#1A1A18", border: "1px solid #2A2A25", borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "all 0.2s" };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#111110", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      Loading...
    </div>
  );

  // ─── ACTIVE ASSESSMENT → render PrismL4 ───
  if (user && activeAssessment) {
    return (
      <PrismL4
        user={user}
        onLogout={handleLogout}
        assessmentId={activeAssessment.id}
        initialData={activeAssessment.data}
        isOwner={activeAssessment.user_id === user.id}
        onBack={handleBack}
      />
    );
  }

  // ─── ASSESSMENT PICKER ───
  if (user && !activeAssessment) {
    const own = assessments?.own || [];
    const shared = assessments?.shared || [];

    return (
      <div style={{ minHeight: "100vh", background: "#111110", fontFamily: FONT, color: "#EEEAE4" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 28px", borderBottom: "1px solid #2A2A25", background: "#131312" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18, fontFamily: SERIF, color: GOLD, fontWeight: 500 }}>PrismL4</span>
            <div style={{ height: 14, width: 1, background: "#2A2A25" }} />
            <span style={{ fontSize: 12, color: "#B8B0A4" }}>Assessments</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#B8B0A4" }}>{user.name}</span>
            <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: GOLD + "20", color: GOLD, fontWeight: 600 }}>{user.role}</span>
            <button onClick={handleLogout} style={{ background: "none", border: `1px solid ${RED}33`, borderRadius: 6, padding: "3px 10px", color: RED, cursor: "pointer", fontSize: 10, fontFamily: FONT }}>
              Logout
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 28px" }}>
          <div style={{ fontSize: 28, fontFamily: SERIF, color: "#EEEAE4", marginBottom: 4 }}>
            Welcome back, {user.name}
          </div>
          <div style={{ fontSize: 14, color: "#B8B0A4", marginBottom: 32 }}>Select an assessment or create a new one.</div>

          {loadingAssessments && <div style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>Loading assessments...</div>}

          {/* My Assessments */}
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>My Assessments</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 32 }}>
            {own.map(a => (
              <div key={a.id} onClick={() => openAssessment(a.id)}
                style={{ ...cardStyle, position: "relative" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.background = GOLD + "08"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A2A25"; e.currentTarget.style.background = "#1A1A18"; }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#EEEAE4", marginBottom: 4 }}>{a.company_name}</div>
                <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, marginBottom: 6 }}>{a.function_name || "Finance"}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: a.status === "complete" ? GREEN + "20" : BLUE + "20", color: a.status === "complete" ? GREEN : BLUE, fontWeight: 600, textTransform: "uppercase" }}>{a.status || "draft"}</span>
                  <span style={{ fontSize: 10, color: "#888" }}>{a.updated_at ? new Date(a.updated_at).toLocaleDateString() : ""}</span>
                </div>
                <button onClick={(e) => handleDeleteAssessment(a.id, e)}
                  style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14, padding: "2px 6px" }}
                  title="Delete assessment">
                  ✕
                </button>
              </div>
            ))}

            {/* New Assessment card */}
            <div onClick={() => setShowNewModal(true)}
              style={{ ...cardStyle, border: `2px dashed ${GOLD}44`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 100 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = GOLD + "44"; }}>
              <div style={{ fontSize: 28, color: GOLD, marginBottom: 4 }}>+</div>
              <div style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>New Assessment</div>
            </div>
          </div>

          {/* Shared With Me */}
          {shared.length > 0 && <>
            <div style={{ fontSize: 11, color: PURPLE, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>Shared With Me</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 32 }}>
              {shared.map(a => (
                <div key={a.id} onClick={() => openAssessment(a.id)}
                  style={{ ...cardStyle }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.background = PURPLE + "08"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2A2A25"; e.currentTarget.style.background = "#1A1A18"; }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#EEEAE4", marginBottom: 4 }}>{a.company_name}</div>
                  <div style={{ fontSize: 11, color: PURPLE, fontWeight: 600, marginBottom: 6 }}>{a.function_name || "Finance"}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: PURPLE + "20", color: PURPLE, fontWeight: 600, textTransform: "uppercase" }}>{a.share_role}</span>
                    <span style={{ fontSize: 10, color: "#888" }}>{a.updated_at ? new Date(a.updated_at).toLocaleDateString() : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </>}
        </div>

        {/* New Assessment Modal */}
        {showNewModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
            onClick={() => setShowNewModal(false)}>
            <div style={{ background: "#1A1A18", border: "1px solid #2A2A25", borderRadius: 16, padding: "32px", maxWidth: 400, width: "100%" }}
              onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 18, fontFamily: SERIF, color: "#EEEAE4", marginBottom: 4 }}>New Assessment</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>Create a new value assessment for a client.</div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Company Name</div>
                <input value={newCompany} onChange={e => setNewCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleCreateAssessment()}
                  style={{ width: "100%", padding: "10px 14px", background: "#111110", border: "1px solid #2A2A25", borderRadius: 8, color: "#EEEAE4", fontFamily: FONT, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Function</div>
                <div style={{ padding: "10px 14px", background: "#111110", border: "1px solid #2A2A25", borderRadius: 8, color: GOLD, fontSize: 13, fontWeight: 600 }}>
                  Finance (O2C, R2R, P2P)
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleCreateAssessment} disabled={creating || !newCompany.trim()}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, background: GOLD, border: "none", color: "#111110", fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: creating ? "wait" : "pointer", opacity: newCompany.trim() ? 1 : 0.4 }}>
                  {creating ? "Creating..." : "Create Assessment"}
                </button>
                <button onClick={() => setShowNewModal(false)}
                  style={{ padding: "10px 20px", borderRadius: 8, background: "transparent", border: "1px solid #2A2A25", color: "#888", fontFamily: FONT, fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── LOGIN / REGISTER ───
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
