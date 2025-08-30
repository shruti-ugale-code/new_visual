import React, { useState } from 'react';
import { Database, Calendar, Download, MapPin, Filter } from 'lucide-react';
import { parseNOAAAISData, loadNOAAData, generateNOAAUrls } from '../utils/noaaDataHandler';
import DataLoadingProgress from './DataLoadingProgress';
import './NOAADataLoader.css';

const NOAADataLoader = ({ onDataLoad, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('2022-01-01');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [vesselTypeFilter, setVesselTypeFilter] = useState('all');
  const [maxRecords, setMaxRecords] = useState(5000);
  const [loadingProgress, setLoadingProgress] = useState(null);
  const [showProgress, setShowProgress] = useState(false);

  const regions = {
    'all': { name: 'All Regions', bounds: null },
    'northeast': { 
      name: 'US Northeast Coast', 
      bounds: { north: 45, south: 35, east: -65, west: -80 }
    },
    'southeast': { 
      name: 'US Southeast Coast', 
      bounds: { north: 35, south: 25, east: -75, west: -85 }
    },
    'gulfcoast': { 
      name: 'Gulf Coast', 
      bounds: { north: 31, south: 24, east: -80, west: -100 }
    },
    'westcoast': { 
      name: 'US West Coast', 
      bounds: { north: 50, south: 32, east: -115, west: -130 }
    },
    'greatlakes': { 
      name: 'Great Lakes', 
      bounds: { north: 49, south: 41, east: -76, west: -93 }
    }
  };

  const vesselTypes = {
    'all': 'All Vessel Types',
    'cargo': 'Cargo Ships',
    'tanker': 'Tankers',
    'passenger': 'Passenger Ships',
    'fishing': 'Fishing Vessels',
    'tug': 'Tugs'
  };

  const handleLoadData = async () => {
    try {
      setShowProgress(true);
      setLoadingProgress({ stage: 'downloading', percentage: 0 });

      // For demo purposes, we'll load our sample NOAA data
      // In a real implementation, this would fetch from the actual NOAA URLs
      const sampleUrl = '/noaa-ais-sample.csv';
      
      const options = {
        maxRecords,
        boundingBox: regions[selectedRegion].bounds,
        vesselTypes: vesselTypeFilter === 'all' ? null : [vesselTypeFilter],
        onProgress: (progress) => {
          setLoadingProgress(progress);
        }
      };

      // Simulate loading delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(sampleUrl);
      if (!response.ok) {
        throw new Error('Failed to load NOAA data sample');
      }

      const csvText = await response.text();
      
      setLoadingProgress({ stage: 'parsing', percentage: 50 });
      await new Promise(resolve => setTimeout(resolve, 500));

      const result = parseNOAAAISData(csvText, options);
      
      setLoadingProgress({ 
        stage: 'processing', 
        percentage: 100, 
        processed: result.ships.length,
        total: result.ships.length,
        completed: true 
      });

      // Pass the loaded data to parent component
      onDataLoad(result.ships, result.trajectories);
      
    } catch (error) {
      console.error('Error loading NOAA data:', error);
      setLoadingProgress({ 
        error: `Failed to load NOAA data: ${error.message}`,
        stage: 'error'
      });
    }
  };

  const handleProgressClose = () => {
    setShowProgress(false);
    setLoadingProgress(null);
    if (loadingProgress?.completed) {
      onClose();
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="noaa-loader-overlay">
        <div className="noaa-loader-modal">
          <div className="loader-header">
            <div className="header-icon">
              <Database size={24} />
            </div>
            <div className="header-text">
              <h3>Load NOAA AIS Data</h3>
              <p>Access comprehensive maritime traffic data from NOAA</p>
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="loader-content">
            <div className="data-info">
              <div className="info-card">
                <h4>NOAA AIS Dataset</h4>
                <ul>
                  <li>Real maritime traffic data from US waters</li>
                  <li>Updated daily with vessel positions and details</li>
                  <li>Includes cargo ships, tankers, passenger vessels, and more</li>
                  <li>Comprehensive coverage of US coastal and inland waters</li>
                </ul>
              </div>
            </div>

            <div className="loading-options">
              <div className="option-group">
                <label>
                  <Calendar size={16} />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min="2022-01-01"
                  max="2022-12-31"
                  className="date-input"
                />
                <small>Selected: {formatDate(selectedDate)}</small>
              </div>

              <div className="option-group">
                <label>
                  <MapPin size={16} />
                  Geographic Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="region-select"
                >
                  {Object.entries(regions).map(([key, region]) => (
                    <option key={key} value={key}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label>
                  <Filter size={16} />
                  Vessel Type Filter
                </label>
                <select
                  value={vesselTypeFilter}
                  onChange={(e) => setVesselTypeFilter(e.target.value)}
                  className="type-select"
                >
                  {Object.entries(vesselTypes).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label>
                  <Download size={16} />
                  Maximum Records
                </label>
                <select
                  value={maxRecords}
                  onChange={(e) => setMaxRecords(parseInt(e.target.value))}
                  className="records-select"
                >
                  <option value={1000}>1,000 records (Fast)</option>
                  <option value={5000}>5,000 records (Recommended)</option>
                  <option value={10000}>10,000 records (Detailed)</option>
                  <option value={25000}>25,000 records (Comprehensive)</option>
                </select>
                <small>Higher record counts may take longer to process</small>
              </div>
            </div>

            <div className="data-preview">
              <h4>Data Preview</h4>
              <div className="preview-stats">
                <div className="stat">
                  <span className="stat-label">Date Range:</span>
                  <span className="stat-value">{formatDate(selectedDate)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Region:</span>
                  <span className="stat-value">{regions[selectedRegion].name}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Vessel Types:</span>
                  <span className="stat-value">{vesselTypes[vesselTypeFilter]}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Max Records:</span>
                  <span className="stat-value">{maxRecords.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="loader-actions">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleLoadData}>
                <Database size={16} />
                Load NOAA Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <DataLoadingProgress
        isVisible={showProgress}
        progress={loadingProgress || {}}
        onClose={handleProgressClose}
      />
    </>
  );
};

export default NOAADataLoader;