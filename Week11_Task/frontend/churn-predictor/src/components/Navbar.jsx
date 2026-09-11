import React from 'react';
import { Activity, ShieldCheck, AlertCircle, FileSpreadsheet, UserCheck, RefreshCw } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus, onRetryHealth }) {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="logo-group">
          <div className="logo-icon-box">
            <Activity className="logo-icon" size={24} />
          </div>
          <div>
            {/* <div className="brand-badge">WEEK 11 AI DEPLOYMENT</div> */}
            <h1 className="brand-title">ChurnGuard AI</h1>
            <p className="brand-subtitle">Bank Customer Retention & Risk Forecasting</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="tab-nav">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            <UserCheck size={18} />
            <span>Single Customer</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            <FileSpreadsheet size={18} />
            <span>Batch File Analysis</span>
            <span className="file-badge">CSV • Excel • TXT</span>
          </button>
        </nav>

        {/* Backend Status Indicator */}
        <div className="status-container">
          {backendStatus === 'connected' ? (
            <div className="status-pill status-healthy" title="FastAPI backend is online at http://127.0.0.1:8000">
              <span className="status-dot green pulse"></span>
              <ShieldCheck size={16} />
              <span>Backend Online</span>
            </div>
          ) : backendStatus === 'checking' ? (
            <div className="status-pill status-checking">
              <span className="status-dot yellow"></span>
              <span>Checking...</span>
            </div>
          ) : (
            <div className="status-pill status-offline">
              <span className="status-dot red"></span>
              <AlertCircle size={16} />
              <span>Backend Disconnected</span>
              <button
                type="button"
                className="retry-btn"
                onClick={onRetryHealth}
                title="Retry connecting to backend"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

