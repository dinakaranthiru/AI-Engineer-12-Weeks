import { useState } from 'react';

export default function TicketClassifier() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

  const handleSubmit = async (e) => {

    // if(hasFetched) return;
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }), // Matches TicketRequest schema
      });

      const data = await response.json();
 
      if (!response.ok) {
        // Captures either your status 400 error or Pydantic's 422 validation errors
        throw new Error(data.detail || data.error || 'Something went wrong');
      }

      setResult(data); // Matches TicketResponse schema ({ category, confidence })
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

return (
  <div
    style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      padding: "40px 20px",
      fontFamily: "'Inter', sans-serif",
    }}
  >
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          🎫 Ticket Intelligence
        </h1>

        <p
          style={{
            color: "#6b7280",
            fontSize: "15px",
          }}
        >
          Automatically classify support tickets using Machine Learning.
        </p>
      </div>

      {/* Input Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "16px",
            color: "#111827",
          }}
        >
          Ticket Description
        </h3>

        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe the issue or paste the support ticket message here..."
            rows={7}
            style={{
              width: "100%",
              padding: "16px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              fontSize: "15px",
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
              lineHeight: "1.6",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              {text.length} characters
            </span>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? "#93c5fd" : "#2563eb",
                color: "#fff",
                padding: "12px 24px",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "0.3s ease",
              }}
            >
              {loading ? "Analyzing..." : "Analyze Ticket"}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: "12px",
            padding: "14px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div
          style={{
            marginTop: "24px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                margin: 0,
                color: "#111827",
              }}
            >
              Prediction Result
            </h3>

            <span
              style={{
                backgroundColor: "#dcfce7",
                color: "#166534",
                padding: "6px 12px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              Ml Ticket Classifier
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Category */}
            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  marginBottom: "6px",
                }}
              >
                Predicted Category
              </div>

              <span
                style={{
                  backgroundColor: "#eef2ff",
                  color: "#4338ca",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                {result.category}
              </span>
            </div>

            {/* Confidence */}
            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  marginBottom: "6px",
                }}
              >
                Confidence Score
              </div>

              <div
                style={{
                  fontWeight: "700",
                  fontSize: "18px",
                  color: "#111827",
                }}
              >
                {(result.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Confidence Bar */}
          <div
            style={{
              marginTop: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              <span>Model Confidence</span>

              <span>
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: "10px",
                backgroundColor: "#e5e7eb",
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${result.confidence * 100}%`,
                  height: "100%",
                  borderRadius: "20px",
                  transition: "width 0.5s ease",
                  background:
                    result.confidence > 0.8
                      ? "#22c55e"
                      : result.confidence > 0.6
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #e5e7eb",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "13px",
                }}
              >
                Status
              </div>

              <strong style={{ color: "#16a34a" }}>
                Completed
              </strong>
            </div>

            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "13px",
                }}
              >
                Model Version
              </div>

              <strong>v1.0.0</strong>
            </div>

            <div>
              <div
                style={{
                  color: "#6b7280",
                  fontSize: "13px",
                }}
              >
                Prediction Type
              </div>

              <strong>ML Classification</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}
