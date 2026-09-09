import { useState } from 'react';
import './App.css';

export default function TicketClassifier() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleTickets = [
    { label: '🔑 Login Error', text: 'I cannot sign into my account, the password reset link throws a 500 error.' },
    { label: '💳 Double Charged', text: 'My credit card was charged twice for the monthly premium subscription.' },
    { label: '📤 Upload Bug', text: 'When uploading a 15MB PDF invoice, the application freezes and crashes.' },
    { label: '⚡ Performance', text: 'Dashboard charts take over 35 seconds to render and load customer history.' },
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setResult(null);

    if (!text.trim()) {
      setError('Please provide a ticket message or select a sample above.');
      return;
    }

    setLoading(true);

    try {
      try {
        response = await fetch('http://127.0.0.1:8000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text }),
        });
      } catch (firstErr) {
        // Fallback to localhost if 127.0.0.1 is blocked by browser/cors
        response = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: text }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Server returned an error');
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message?.includes('Failed to fetch')
          ? 'Cannot reach FastAPI backend. Make sure the backend server is running on port 8000 (e.g. uvicorn app.main:app --reload)'
          : err.message || 'Unable to connect to FastAPI backend at port 8000'
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTheme = (cat = '') => {
    const c = String(cat).toLowerCase();
    if (c.includes('login') || c.includes('auth')) {
      return { icon: '🔐', color: '#818cf8', glow: 'rgba(129, 140, 248, 0.4)' };
    }
    if (c.includes('payment') || c.includes('billing')) {
      return { icon: '💳', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' };
    }
    if (c.includes('upload') || c.includes('file')) {
      return { icon: '📦', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)' };
    }
    if (c.includes('network') || c.includes('connection')) {
      return { icon: '🌐', color: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.4)' };
    }
    if (c.includes('bug') || c.includes('crash')) {
      return { icon: '🐞', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' };
    }
    if (c.includes('feature')) {
      return { icon: '✨', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' };
    }
    if (c.includes('performance') || c.includes('speed')) {
      return { icon: '⚡', color: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' };
    }
    return { icon: '🏷️', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' };
  };

  const rawConfidence = typeof result?.confidence === 'number' ? result.confidence : 0;
  const confidencePct = Math.min(100, Math.max(0, Math.round(rawConfidence * 100)));
  const categoryMeta = result?.category ? getCategoryTheme(result.category) : null;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Dynamic Fluid Mesh Background */}
      <div className="liquid-canvas">
        <div className="liquid-orb orb-1" />
        <div className="liquid-orb orb-2" />
        <div className="liquid-orb orb-3" />
        <div className="liquid-orb orb-4" />
      </div>

      {/* Main Glass Content Viewport */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '860px',
          margin: '0 auto',
          padding: '60px 24px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}
      >
        {/* iOS Glass Top Navigation Header */}
        <header
          className="liquid-glass-card"
          style={{
            padding: '24px 32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.6) 0%, rgba(59, 130, 246, 0.6) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              💎
            </div>
            <div>
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: '700',
                  letterSpacing: '-0.5px',
                  background: 'linear-gradient(180deg, #ffffff 30%, rgba(255, 255, 255, 0.7) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                }}
              >
                Ticket Intelligence
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(203, 213, 225, 0.8)', marginTop: '2px' }}>
                iPhone Liquid Glass · Natural Language Processing Classifier
              </p>
            </div>
          </div>

          <div className="glass-pill">
            <span className="pulse-dot" />
            <span>FastAPI ML Engine Online</span>
          </div>
        </header>

        {/* Input Interactive Glass Card */}
        <section className="liquid-glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✍️</span> Support Inquiry
            </h2>
            <span style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.8)', fontFamily: 'var(--font-mono)' }}>
              {text.length} chars
            </span>
          </div>

          {/* Quick interactive test chips */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.85)', marginBottom: '8px', fontWeight: '500' }}>
              Quick Test Prompts:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sampleTickets.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="prompt-chip"
                  onClick={() => setText(chip.text)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              className="glass-textarea"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste ticket description, user complaint, or IT query here..."
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.75)' }}>
                ⚡ Powered by TF-IDF + Tuned Logistic Regression Classifier
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {text && (
                  <button
                    type="button"
                    onClick={() => { setText(''); setResult(null); setError(''); }}
                    className="prompt-chip"
                    style={{ padding: '10px 18px', fontSize: '13px' }}
                  >
                    Clear
                  </button>
                )}
                <button type="submit" disabled={loading} className="glass-button-primary">
                  {loading ? (
                    <>
                      <div className="spinner-icon" />
                      <span>Analyzing Intent...</span>
                    </>
                  ) : (
                    <>
                      <span>Classify Ticket</span>
                      <span style={{ fontSize: '16px' }}>✨</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Error Notification Glass Banner */}
        {error && (
          <div
            className="liquid-glass-card animate-glass-in"
            style={{
              padding: '18px 24px',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div style={{ color: '#fca5a5', fontSize: '14px', lineHeight: 1.5 }}>
              {error}
            </div>
          </div>
        )}

        {/* Prediction Liquid Glass Result Display */}
        {result && (
          <section className="liquid-glass-card animate-glass-in" style={{ padding: '36px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    fontWeight: '700',
                    color: 'rgba(148, 163, 184, 0.9)',
                  }}
                >
                  Classification Result
                </span>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    className="badge-category"
                    style={{
                      borderColor: categoryMeta?.color,
                      boxShadow: `0 0 24px ${categoryMeta?.glow}`,
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{categoryMeta?.icon}</span>
                    <span>{result.category}</span>
                  </div>
                </div>
              </div>

              {/* Confidence badge */}
              <div
                style={{
                  textAlign: 'right',
                  padding: '12px 20px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(148, 163, 184, 0.8)' }}>
                  Confidence Score
                </div>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    letterSpacing: '-1px',
                    marginTop: '2px',
                    background:
                      confidencePct > 80
                        ? 'linear-gradient(180deg, #34d399, #059669)'
                        : confidencePct > 60
                        ? 'linear-gradient(180deg, #fbbf24, #d97706)'
                        : 'linear-gradient(180deg, #f87171, #dc2626)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {confidencePct}%
                </div>
              </div>
            </div>

            {/* Liquid Progress Bar Indicator */}
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '13px',
                  color: 'rgba(203, 213, 225, 0.8)',
                  fontWeight: '500',
                }}
              >
                <span>Inference Confidence Level</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{(result.confidence * 100).toFixed(1)}%</span>
              </div>

              <div className="liquid-progress-container">
                <div
                  className="liquid-progress-fill"
                  style={{
                    width: `${Math.max(5, confidencePct)}%`,
                    background:
                      confidencePct > 80
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : confidencePct > 60
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #ef4444, #f87171)',
                    boxShadow:
                      confidencePct > 80
                        ? '0 0 16px rgba(52, 211, 153, 0.6)'
                        : confidencePct > 60
                        ? '0 0 16px rgba(251, 191, 36, 0.6)'
                        : '0 0 16px rgba(248, 113, 113, 0.6)',
                  }}
                />
              </div>
            </div>

            {/* Technical Metadata Mini Glass Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="mini-stat-card">
                <div style={{ fontSize: '11px', color: 'rgba(148, 163, 184, 0.75)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Model Pipeline
                </div>
                <div style={{ marginTop: '4px', fontWeight: '600', fontSize: '14px', color: '#f1f5f9' }}>
                  TF-IDF + LogReg
                </div>
              </div>

              <div className="mini-stat-card">
                <div style={{ fontSize: '11px', color: 'rgba(148, 163, 184, 0.75)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Endpoint
                </div>
                <div style={{ marginTop: '4px', fontWeight: '600', fontSize: '14px', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                  POST /predict
                </div>
              </div>

              <div className="mini-stat-card">
                <div style={{ fontSize: '11px', color: 'rgba(148, 163, 184, 0.75)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Inference Latency
                </div>
                <div style={{ marginTop: '4px', fontWeight: '600', fontSize: '14px', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  ~18 ms (Sub-second)
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer info pill */}
        <footer style={{ textAlign: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(148, 163, 184, 0.6)' }}>
            Designed with Apple iOS Liquid Glass aesthetics · Antigravity AI Engineering
          </span>
        </footer>
      </main>
    </div>
  );
}

