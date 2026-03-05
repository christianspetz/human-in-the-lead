import { useState } from "react";
import PanasonicAdvisor from "../PanasonicAdvisor";

const C = {
  bg: "#08080A",
  surface: "#111114",
  border: "#222228",
  text: "#E4E2DC",
  textMuted: "#908E86",
  textDim: "#58564F",
  accent: "#D4A843",
  red: "#D45443",
};

const PASSWORD = "NewHorizon2026";

export default function PanasonicGate() {
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

  if (authed) return <PanasonicAdvisor />;

  return (
    <div style={{
      background: C.bg, minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Newsreader', 'Georgia', serif", color: C.text,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "48px 40px", maxWidth: 400,
        width: "100%", textAlign: "center",
      }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: C.accent,
          fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>
          Restricted Access
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.5 }}>
          Panasonic Go
        </h1>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 28px", lineHeight: 1.6 }}>
          This briefing is password-protected.<br />Enter the access code to continue.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password" value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Access code" autoFocus
            style={{
              width: "100%", padding: "12px 16px", background: C.bg,
              border: `1px solid ${error ? C.red : C.border}`, borderRadius: 6,
              color: C.text, fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
              outline: "none", boxSizing: "border-box",
            }}
          />
          {error && <div style={{ fontSize: 12, color: C.red, marginTop: 8 }}>Incorrect password</div>}
          <button type="submit" style={{
            width: "100%", marginTop: 16, padding: "12px",
            background: `${C.accent}20`, border: `1px solid ${C.accent}40`,
            borderRadius: 6, color: C.accent, fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
            cursor: "pointer", letterSpacing: 1, textTransform: "uppercase",
          }}>
            Enter
          </button>
        </form>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 24 }}>humaninthelead.ai</div>
      </div>
    </div>
  );
}