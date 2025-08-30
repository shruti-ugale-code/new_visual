import React from 'react';
import { Download, FileText, Database, CheckCircle, AlertCircle } from 'lucide-react';
import './DataLoadingProgress.css';

const DataLoadingProgress = ({ 
  isVisible,
  progress,
  onCancel,
  onClose 
}) => {
  if (!isVisible) return null;

  const { stage, percentage, processed, total, completed, error } = progress;

  const getStageIcon = () => {
    switch (stage) {
      case 'downloading':
        return <Download size={24} />;
      case 'parsing':
        return <FileText size={24} />;
      case 'processing':
        return <Database size={24} />;
      default:
        return <Database size={24} />;
    }
  };

  const getStageTitle = () => {
    switch (stage) {
      case 'downloading':
        return 'Downloading NOAA AIS Data';
      case 'parsing':
        return 'Parsing CSV Data';
      case 'processing':
        return 'Processing Ship Records';
      default:
        return 'Loading Data';
    }
  };

  const getStageDescription = () => {
    switch (stage) {
      case 'downloading':
        return 'Downloading compressed AIS data files from NOAA servers...';
      case 'parsing':
        return 'Parsing CSV data and extracting ship information...';
      case 'processing':
        return `Processing ship records and building trajectories... (${processed || 0}/${total || 0})`;
      default:
        return 'Preparing data for visualization...';
    }
  };

  return (
    <div className="data-loading-overlay">
      <div className="data-loading-modal">
        <div className="loading-header">
          <div className="loading-icon">
            {completed ? (
              <CheckCircle size={24} className="success-icon" />
            ) : error ? (
              <AlertCircle size={24} className="error-icon" />
            ) : (
              getStageIcon()
            )}
          </div>
          <h3>
            {completed ? 'Data Loading Complete!' : 
             error ? 'Data Loading Error' : 
             getStageTitle()}
          </h3>
        </div>

        <div className="loading-content">
          {error ? (
            <div className="error-content">
              <p className="error-message">{error}</p>
              <button className="btn btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          ) : completed ? (
            <div className="success-content">
              <p>Successfully loaded and processed AIS data!</p>
              <div className="success-stats">
                <div className="stat-item">
                  <span className="stat-label">Ships Loaded:</span>
                  <span className="stat-value">{processed || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Data Source:</span>
                  <span className="stat-value">NOAA AIS</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={onClose}>
                View Ships
              </button>
            </div>
          ) : (
            <div className="progress-content">
              <p className="progress-description">
                {getStageDescription()}
              </p>
              
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${percentage || 0}%` }}
                  ></div>
                </div>
                <span className="progress-percentage">
                  {Math.round(percentage || 0)}%
                </span>
              </div>

              {stage === 'processing' && processed && total && (
                <div className="record-progress">
                  <span>{processed.toLocaleString()} / {total.toLocaleString()} records processed</span>
                </div>
              )}

              <div className="loading-stages">
                <div className={`stage-item ${stage === 'downloading' ? 'active' : 
                                              percentage > 50 ? 'completed' : ''}`}>
                  <div className="stage-indicator"></div>
                  <span>Download</span>
                </div>
                <div className={`stage-item ${stage === 'parsing' ? 'active' : 
                                              percentage > 75 ? 'completed' : ''}`}>
                  <div className="stage-indicator"></div>
                  <span>Parse</span>
                </div>
                <div className={`stage-item ${stage === 'processing' ? 'active' : 
                                              completed ? 'completed' : ''}`}>
                  <div className="stage-indicator"></div>
                  <span>Process</span>
                </div>
              </div>

              {onCancel && (
                <button className="btn btn-secondary cancel-btn" onClick={onCancel}>
                  Cancel Loading
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataLoadingProgress;