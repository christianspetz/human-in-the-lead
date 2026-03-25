import { useState } from "react";
import AccentureCPG from "../AccentureCPG";

const C = {
  bg: "#F5F0E8",
  surface: "#FDFAF5",
  border: "#D4CCB8",
  text: "#0F0C08",
  textMuted: "#3A3228",
  textDim: "#6C6050",
  accent: "#8C6814",
  red: "#7A1C0C",
};

const PASSWORD = "ACC-OPP-2026";

export default function AccentureCPGGate() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === PASSWORD) {
      setAuthed(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (authed) return <AccentureCPG />;

  return (
    <div style={{
      background: C.bg, minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "Georgia, serif", color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "48px 40px", maxWidth: 400,
        width: "100%", textAlign: "center",
        boxShadow: "0 2px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          fontSize: 9, letterSpacing: 3, color: C.accent,
          fontFamily: "JetBrains Mono, monospace", marginBottom: 12,
          textTransform: "uppercase",
        }}>
          Restricted Access
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 8px", letterSpacing: -0.3, fontFamily: "Georgia, serif" }}>
          CPG Intelligence Briefing
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 28px", lineHeight: 1.7 }}>
          This briefing is password-protected.<br />Enter the access code to continue.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Access code"
            autoFocus
            style={{
              width: "100%", padding: "12px 16px", background: C.bg,
              border: `1px solid ${error ? C.red : C.border}`, borderRadius: 6,
              color: C.text, fontSize: 14, fontFamily: "JetBrains Mono, monospace",
              outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: C.red, marginTop: 8, fontFamily: "JetBrains Mono, monospace" }}>
              Incorrect password
            </div>
          )}
          <button
            type="submit"
            style={{
              width: "100%", marginTop: 16, padding: "12px",
              background: `${C.accent}18`, border: `1px solid ${C.accent}40`,
              borderRadius: 6, color: C.accent, fontSize: 11,
              fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
              cursor: "pointer", letterSpacing: 2, textTransform: "uppercase",
            }}
          >
            Enter
          </button>
        </form>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 24, fontFamily: "JetBrains Mono, monospace", letterSpacing: 1 }}>
          humaninthelead.ai
        </div>
      </div>
    </div>
  );
}
