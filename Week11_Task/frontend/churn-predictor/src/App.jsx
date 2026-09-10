import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SinglePrediction from './components/SinglePrediction';
import BatchPrediction from './components/BatchPrediction';
import { checkBackendHealth } from './services/api';
import { AlertCircle, Terminal, CheckCircle2 } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch'
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'
  const [backendInfo, setBackendInfo] = useState(null);

  const testHealth = async () => {
    setBackendStatus('checking');
    try {
      const data = await checkBackendHealth();
      setBackendStatus('connected');
      setBackendInfo(data);
    } catch {
      setBackendStatus('disconnected');
      setBackendInfo(null);
    }
  };

  useEffect(() => {
    testHealth();
    // Periodically verify connection every 15 seconds
    // const timer = setInterval(testHealth, 15000);
    // return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        onRetryHealth={testHealth}
      />

      {/* Disconnection Warning Banner if backend is down */}
      {backendStatus === 'disconnected' && (
        <div className="backend-offline-banner">
          <div className="banner-content">
            <AlertCircle size={20} className="banner-icon" />
            <div className="banner-text">
              <strong>Backend Server is Offline:</strong> The React frontend cannot reach the
              FastAPI service at <code>http://127.0.0.1:8000</code>.
            </div>
            <div className="banner-command">
              <Terminal size={14} />
              <code>cd churn-predictor-api && uvicorn app.main:app --reload --port 8000</code>
            </div>
            <button type="button" className="banner-retry-btn" onClick={testHealth}>
              Check Again
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Content - Kept mounted so state & batch predictions persist */}
      <main className="main-content">
        <div className={`tab-panel ${activeTab === 'single' ? 'active' : 'hidden'}`}>
          <SinglePrediction />
        </div>
        <div className={`tab-panel ${activeTab === 'batch' ? 'active' : 'hidden'}`}>
          <BatchPrediction />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-content">
          <p>
            Week 11 Machine Learning Deployment • Random Forest Churn Classifier Pipeline
          </p>
          <div className="footer-badges">
            <span className="footer-badge">FastAPI 1.1</span>
            <span className="footer-badge">React 19 + Vite</span>
            <span className="footer-badge">Scikit-Learn Pipeline</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
