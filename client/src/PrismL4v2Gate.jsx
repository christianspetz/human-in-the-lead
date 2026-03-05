import { useState } from "react";
import PrismL4v2 from "./PrismL4v2";

const PASS = "Betterquestions2026@";
const SESSION_KEY = "prisml4v2_unlocked";

export default function PrismL4v2Gate() {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === "true");
  const [error, setError] = useState(false);

  if (unlocked) return <PrismL4v2 />;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === PASS) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111110",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
        padding: "3rem 2.5rem",
        background: "#1A1A18",
        border: "1px solid #2A2A25",
        borderRadius: "12px",
        minWidth: "320px",
      }}>
        <h1 style={{
          color: "#D4A853",
          fontSize: "1.5rem",
          fontWeight: 600,
          margin: 0,
          letterSpacing: "0.02em",
        }}>
          Prism L4 v2
        </h1>
        <p style={{
          color: "#B8B0A4",
          fontSize: "0.85rem",
          margin: 0,
          textAlign: "center",
        }}>
          Enter password to continue
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            fontSize: "0.95rem",
            fontFamily: "'DM Sans', sans-serif",
            background: "#111110",
            color: "#EEEAE4",
            border: error ? "1px solid #D48A8A" : "1px solid #2A2A25",
            borderRadius: "8px",
            outline: "none",
            transition: "border-color 0.2s",
            boxSizing: "border-box",
          }}
        />
        <button type="submit" style={{
          width: "100%",
          padding: "0.75rem",
          fontSize: "0.95rem",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          background: "#D4A853",
          color: "#111110",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "opacity 0.2s",
        }}>
          Enter
        </button>
        {error && (
          <p style={{ color: "#D48A8A", fontSize: "0.8rem", margin: 0 }}>
            Incorrect password
          </p>
        )}
      </form>
    </div>
  );
}
