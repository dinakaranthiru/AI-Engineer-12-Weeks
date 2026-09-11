import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Download,
  AlertCircle,
  Search,
  Users,
  UserX,
  TrendingDown,
  PieChart,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { predictFromFile, getSampleCsvUrl } from '../services/api';

export default function BatchPrediction() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL'); // 'ALL' | 'CHURN' | 'STAY' | 'HIGH_RISK'
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['csv', 'xlsx', 'xls', 'txt'];
    if (!validExts.includes(ext)) {
      setError(`Unsupported file type (.${ext}). Please upload a .csv, .xlsx, .xls, or .txt file.`);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const processFile = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const data = await predictFromFile(selectedFile);
      setBatchResult(data);
    } catch (err) {
      setError(err.message || 'Batch prediction failed. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };

  const exportResultsCsv = () => {
    if (!batchResult || !batchResult.records.length) return;

    const headers = [
      'row_index',
      'customer_id',
      'churn_prediction',
      'verdict',
      'churn_probability_pct',
      'risk_level',
      'credit_score',
      'country',
      'gender',
      'age',
      'tenure',
      'balance',
      'products_number',
      'credit_card',
      'active_member',
      'estimated_salary',
      'recommendation',
    ];

    const rows = batchResult.records.map((r) => [
      r.row_index,
      r.customer_id || '',
      r.churn,
      r.label,
      r.probability_percent,
      r.risk_level,
      r.credit_score,
      r.country,
      r.gender,
      r.age,
      r.tenure,
      r.balance,
      r.products_number,
      r.credit_card,
      r.active_member,
      r.estimated_salary,
      `"${(r.recommendation || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `predicted_${batchResult.filename || 'customers'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setSelectedFile(null);
    setBatchResult(null);
    setError(null);
    setSearchTerm('');
    setFilterRisk('ALL');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Filtered records
  const filteredRecords = (batchResult?.records || []).filter((record) => {
    // Filter by risk/verdict
    if (filterRisk === 'CHURN' && record.churn !== 1) return false;
    if (filterRisk === 'STAY' && record.churn !== 0) return false;
    if (filterRisk === 'HIGH_RISK' && record.risk_level !== 'High') return false;

    // Filter by search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = (record.customer_id || '').toLowerCase().includes(q);
      const matchCountry = (record.country || '').toLowerCase().includes(q);
      const matchGender = (record.gender || '').toLowerCase().includes(q);
      const matchIndex = String(record.row_index).includes(q);
      return matchId || matchCountry || matchGender || matchIndex;
    }

    return true;
  });

  return (
    <div className="batch-container">
      {/* Upload Box Card */}
      <div className="card upload-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Batch Customer Prediction & File Ingestion</h2>
            <p className="card-description">
              Upload multi-row customer datasets in <strong>CSV, Excel (.xlsx, .xls), or TXT</strong> format to run high-throughput batch inference.
            </p>
          </div>
          <a
            href={getSampleCsvUrl()}
            download="bank_churn_sample.csv"
            className="sample-download-btn"
            title="Download formatted sample CSV"
          >
            <Download size={15} />
            <span>Download Sample CSV</span>
          </a>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`dropzone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'file-ready' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls, .txt, text/csv, text/plain, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {selectedFile ? (
            <div className="dropzone-file-info">
              <FileCheck size={48} className="drop-icon-active" />
              <div className="drop-text">
                <h3 className="file-name">{selectedFile.name}</h3>
                <p className="file-meta">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for ML prediction
                </p>
              </div>
              <button
                type="button"
                className="change-file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Change File
              </button>
            </div>
          ) : (
            <div className="dropzone-prompt">
              <UploadCloud size={48} className="drop-icon" />
              <h3>Drag & drop your customer file here</h3>
              <p>or click to browse from your computer</p>
              <div className="file-types-supported">
                <span className="type-pill">
                  <FileSpreadsheet size={13} /> .CSV
                </span>
                <span className="type-pill">
                  <FileSpreadsheet size={13} /> .XLSX / .XLS
                </span>
                <span className="type-pill">
                  <FileText size={13} /> .TXT (Delimited)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="upload-actions">
          {selectedFile && (
            <button
              type="button"
              className="submit-btn primary"
              onClick={processFile}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="spin" size={18} />
                  <span>Processing Dataset & Computing Inference...</span>
                </>
              ) : (
                <>
                  <FileCheck size={18} />
                  <span>Run Batch Prediction on {selectedFile.name}</span>
                </>
              )}
            </button>
          )}

          {batchResult && (
            <button type="button" className="secondary-btn" onClick={resetAll}>
              Upload Another File
            </button>
          )}
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Batch Results View */}
      {batchResult && (
        <div className="results-section">
          {/* Summary Stat Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap icon-blue">
                <Users size={22} />
              </div>
              <div className="stat-data">
                <span className="stat-label">Total Records Evaluated</span>
                <span className="stat-value">{batchResult.summary.total_records.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-red">
                <UserX size={22} />
              </div>
              <div className="stat-data">
                <span className="stat-label">Customers At Churn Risk</span>
                <span className="stat-value">{batchResult.summary.churn_count.toLocaleString()}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-amber">
                <TrendingDown size={22} />
              </div>
              <div className="stat-data">
                <span className="stat-label">Overall Churn Rate</span>
                <span className="stat-value">{batchResult.summary.churn_rate_pct}%</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-purple">
                <PieChart size={22} />
              </div>
              <div className="stat-data">
                <span className="stat-label">High Risk Interventions</span>
                <span className="stat-value">{batchResult.summary.high_risk_count.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Table Header & Controls */}
          <div className="card table-card">
            <div className="table-toolbar">
              <div className="table-title-group">
                <h3 className="card-title">Prediction Breakdown</h3>
                <span className="badge-records">
                  Showing {filteredRecords.length} of {batchResult.records.length} records
                </span>
              </div>

              <div className="table-controls">
                {/* Search Bar */}
                <div className="table-search">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by ID, Country, Gender..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Selector */}
                <div className="table-filter-tabs">
                  <button
                    type="button"
                    className={`filter-btn ${filterRisk === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilterRisk('ALL')}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${filterRisk === 'CHURN' ? 'active danger' : ''}`}
                    onClick={() => setFilterRisk('CHURN')}
                  >
                    Churn Risk ({batchResult.summary.churn_count})
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${filterRisk === 'STAY' ? 'active success' : ''}`}
                    onClick={() => setFilterRisk('STAY')}
                  >
                    Stay ({batchResult.summary.stay_count})
                  </button>
                  <button
                    type="button"
                    className={`filter-btn ${filterRisk === 'HIGH_RISK' ? 'active warn' : ''}`}
                    onClick={() => setFilterRisk('HIGH_RISK')}
                  >
                    High Risk ({batchResult.summary.high_risk_count})
                  </button>
                </div>

                {/* Export CSV Button */}
                <button type="button" className="export-csv-btn" onClick={exportResultsCsv}>
                  <Download size={15} />
                  <span>Export Predictions CSV</span>
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="table-scroll-wrap">
              <table className="prediction-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer ID</th>
                    <th>Verdict</th>
                    <th>Churn Probability</th>
                    <th>Risk Tier</th>
                    <th>Credit Score</th>
                    <th>Country</th>
                    <th>Age / Gender</th>
                    <th>Products</th>
                    <th>Balance</th>
                    <th>Active</th>
                    <th>Action Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr
                        key={record.row_index}
                        className={record.churn === 1 ? 'row-churn-warning' : ''}
                      >
                        <td className="cell-muted">{record.row_index}</td>
                        <td className="cell-mono font-bold">
                          {record.customer_id || `ID-${record.row_index}`}
                        </td>
                        <td>
                          <span
                            className={`badge-pill ${
                              record.churn === 1 ? 'badge-danger' : 'badge-success'
                            }`}
                          >
                            {record.label}
                          </span>
                        </td>
                        <td>
                          <div className="prob-cell">
                            <span className="prob-pct font-mono">
                              {record.probability_percent}%
                            </span>
                            <div className="table-progress-bar">
                              <div
                                className={`table-progress-fill ${
                                  record.probability_percent >= 70
                                    ? 'fill-red'
                                    : record.probability_percent >= 40
                                    ? 'fill-amber'
                                    : 'fill-green'
                                }`}
                                style={{ width: `${record.probability_percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`tier-badge tier-${(record.risk_level || 'low').toLowerCase()}`}
                          >
                            {record.risk_level}
                          </span>
                        </td>
                        <td className="font-mono">{record.credit_score}</td>
                        <td>{record.country}</td>
                        <td>
                          {record.age}y • {record.gender}
                        </td>
                        <td>{record.products_number}</td>
                        <td className="font-mono">${Number(record.balance).toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-dot ${record.active_member === 1 ? 'green' : 'gray'}`}
                            title={record.active_member === 1 ? 'Active' : 'Inactive'}
                          ></span>
                          {record.active_member === 1 ? 'Active' : 'Inactive'}
                        </td>
                        <td className="cell-action-text" title={record.recommendation}>
                          {record.recommendation}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="table-empty">
                        No customer records matched the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

