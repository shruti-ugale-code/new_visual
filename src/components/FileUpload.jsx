import React, { useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { loadCSVFile, loadMultipleCSVFiles, parseTrajectoryData } from '../utils/csvParser';
import './FileUpload.css';

const FileUpload = ({ onDataLoad, onClose }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const csvFiles = selectedFiles.filter(file => 
      file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')
    );
    
    if (csvFiles.length !== selectedFiles.length) {
      setError('Please select only CSV files');
      return;
    }
    
    setFiles(csvFiles);
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one CSV file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let shipData;
      if (files.length === 1) {
        shipData = await loadCSVFile(files[0]);
      } else {
        shipData = await loadMultipleCSVFiles(files);
      }

      if (shipData.length === 0) {
        setError('No valid ship data found in the selected files');
        return;
      }

      onDataLoad(shipData);
      onClose();
    } catch (err) {
      setError(`Error processing files: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-overlay">
      <div className="file-upload-modal">
        <div className="modal-header">
          <h3>
            <Upload size={20} />
            Upload AIS Data
          </h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="upload-info">
            <p>Upload your AIS CSV files to visualize ship tracking data on the map.</p>
            <div className="supported-formats">
              <h4>Supported Formats:</h4>
              <ul>
                <li>NOAA AIS Data (US Coast Guard)</li>
                <li>MarineTraffic CSV exports</li>
                <li>Custom AIS CSV files</li>
              </ul>
            </div>
          </div>

          <div className="file-input-area">
            <input
              type="file"
              id="csv-files"
              accept=".csv"
              multiple
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="csv-files" className="file-input-label">
              <Upload size={24} />
              <span>Choose CSV Files</span>
              <small>Click to browse or drag and drop</small>
            </label>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              <h4>Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <FileText size={16} />
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleUpload}
              disabled={loading || files.length === 0}
            >
              {loading ? 'Processing...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;