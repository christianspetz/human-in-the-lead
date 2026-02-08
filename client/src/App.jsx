import React, { useState, useCallback } from 'react';
import Landing from './components/Landing';
import Diagnostic from './components/Diagnostic';
import Analysis from './components/Analysis';
import Results from './components/Results';

const SCREENS = { LANDING: 'landing', DIAGNOSTIC: 'diagnostic', ANALYSIS: 'analysis', RESULTS: 'results' };

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleStart = useCallback((name, email) => {
    setUserData({ name, email });
    setScreen(SCREENS.DIAGNOSTIC);
  }, []);

  const handleDiagnosticComplete = useCallback(async (allAnswers) => {
    setAnswers(allAnswers);
    setScreen(SCREENS.ANALYSIS);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: allAnswers, name: userData.name, email: userData.email })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis failed');
      }
      const data = await res.json();
      setResults(data);
      setScreen(SCREENS.RESULTS);
    } catch (err) {
      setError(err.message);
      setScreen(SCREENS.RESULTS);
    }
  }, [userData]);

  const handleRestart = useCallback(() => {
    setScreen(SCREENS.LANDING); setAnswers({}); setResults(null);
    setError(null); setUserData({ name: '', email: '' });
  }, []);

  return (
    <div className="app-container">
      <div className="bg-glow" /><div className="bg-glow-2" />
      {screen === SCREENS.LANDING && <Landing onStart={handleStart} />}
      {screen === SCREENS.DIAGNOSTIC && <Diagnostic onComplete={handleDiagnosticComplete} onBack={() => setScreen(SCREENS.LANDING)} />}
      {screen === SCREENS.ANALYSIS && <Analysis />}
      {screen === SCREENS.RESULTS && <Results results={results} answers={answers} userName={userData.name} error={error} onRestart={handleRestart} />}
      <footer className="app-footer">
        <p>
          Built by <a href="https://linkedin.com/in/christianspetz" target="_blank" rel="noopener noreferrer">Christian Spetz</a> — Transformation & AI Strategy
          <a href="https://linkedin.com/in/christianspetz" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg className="linkedin-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </p>
      </footer>
    </div>
  );
}
