import React, { useState } from 'react';
import { Search, Ship, RefreshCw, Clock, Upload, Route, Database } from 'lucide-react';
import FileUpload from './FileUpload';
import NOAADataLoader from './NOAADataLoader';
import './Header.css';

const Header = ({ 
  searchTerm, 
  onSearchChange, 
  autoRefresh, 
  onAutoRefreshToggle, 
  lastUpdate, 
  shipCount,
  onDataLoad,
  showTrajectories,
  onTrajectoryToggle
}) => {
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showNOAALoader, setShowNOAALoader] = useState(false);
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <Ship size={28} />
          <h1>AIS Ship Tracker</h1>
        </div>
        <div className="ship-count">
          <span>{shipCount} ships tracked</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search ships, MMSI, or destination..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        <div className="last-update">
          <Clock size={16} />
          <span>Last update: {formatTime(lastUpdate)}</span>
        </div>
        
        <button
          className="noaa-btn"
          onClick={() => setShowNOAALoader(true)}
          title="Load NOAA AIS data"
        >
          <Database size={16} />
          NOAA Data
        </button>
        
        <button
          className={`trajectory-btn ${showTrajectories ? 'active' : ''}`}
          onClick={() => onTrajectoryToggle(!showTrajectories)}
          title={showTrajectories ? 'Hide ship trajectories' : 'Show ship trajectories'}
        >
          <Route size={16} />
          Trajectories
        </button>
        
        <button
          className="upload-btn"
          onClick={() => setShowFileUpload(true)}
          title="Upload CSV data"
        >
          <Upload size={16} />
          Upload Data
        </button>
        
        <button
          className={`refresh-btn ${autoRefresh ? 'active' : ''}`}
          onClick={() => onAutoRefreshToggle(!autoRefresh)}
          title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
        >
          <RefreshCw 
            size={16} 
            className={autoRefresh ? 'spinning' : ''} 
          />
          Auto Refresh
        </button>
      </div>
      
      {showFileUpload && (
        <FileUpload 
          onDataLoad={onDataLoad}
          onClose={() => setShowFileUpload(false)}
        />
      )}
      
      {showNOAALoader && (
        <NOAADataLoader 
          onDataLoad={(ships, trajectories) => {
            onDataLoad(ships);
            // Handle trajectories if needed
          }}
          onClose={() => setShowNOAALoader(false)}
        />
      )}
    </header>
  );
};

export default Header;