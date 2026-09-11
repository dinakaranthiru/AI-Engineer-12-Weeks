import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import SinglePrediction from './components/SinglePrediction';
import BatchPrediction from './components/BatchPrediction';
import { checkBackendHealth } from './services/api';
import { AlertCircle, Terminal } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch'
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'

  const testHealth = useCallback(async () => {
    try {
      await checkBackendHealth();
      setBackendStatus('connected');
    } catch {
      setBackendStatus('disconnected');
    }
  }, []);

  const handleRetry = () => {
    setBackendStatus('checking');
    testHealth();
  };

  useEffect(() => {
    testHealth();
  }, [testHealth]);

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        onRetryHealth={handleRetry}
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
            <button type="button" className="banner-retry-btn" onClick={handleRetry}>
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
            Machine Learning Deployment • Random Forest Churn Classifier Pipeline
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
