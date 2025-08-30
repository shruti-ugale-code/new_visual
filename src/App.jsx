import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import './App.css';

// Function to parse NOAA CSV data format
const parseNOAACSVData = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const ships = new Map();
  
  // Process each data row (skip header)
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < headers.length) continue;
    
    const mmsi = values[0];
    const dateTime = values[1];
    const lat = parseFloat(values[2]);
    const lon = parseFloat(values[3]);
    const sog = parseFloat(values[4]); // Speed over ground
    const cog = parseFloat(values[5]); // Course over ground
    const heading = parseFloat(values[6]);
    const vesselName = values[7];
    const imo = values[8];
    const callSign = values[9];
    const vesselType = parseInt(values[10]);
    const status = parseInt(values[11]);
    const length = parseFloat(values[12]);
    const width = parseFloat(values[13]);
    const draft = parseFloat(values[14]);
    
    // Skip invalid coordinates
    if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) continue;
    
    // Convert vessel type code to readable name
    const getShipType = (typeCode) => {
      if (typeCode >= 70 && typeCode <= 79) return 'Cargo';
      if (typeCode >= 80 && typeCode <= 89) return 'Tanker';
      if (typeCode >= 60 && typeCode <= 69) return 'Passenger';
      if (typeCode >= 30 && typeCode <= 39) return 'Fishing';
      if (typeCode >= 50 && typeCode <= 59) return 'Special Craft';
      return 'Other';
    };
    
    // Convert navigation status
    const getStatus = (statusCode) => {
      const statusMap = {
        0: 'Under way using engine',
        1: 'At anchor',
        2: 'Not under command',
        3: 'Restricted manoeuvrability',
        5: 'Moored',
        7: 'Engaged in fishing',
        8: 'Under way sailing'
      };
      return statusMap[statusCode] || 'Unknown';
    };
    
    const shipData = {
      mmsi: mmsi,
      name: vesselName || 'Unknown Vessel',
      latitude: lat,
      longitude: lon,
      heading: isNaN(heading) ? cog : heading, // Use COG if heading is not available
      speed: sog || 0,
      destination: 'N/A', // Not in NOAA format
      eta: 'N/A',
      shipType: getShipType(vesselType),
      length: length || 0,
      width: width || 0,
      draft: draft || 0,
      status: getStatus(status),
      timestamp: dateTime,
      callSign: callSign || '',
      imoNumber: imo || '',
      vesselTypeCode: vesselType
    };
    
    // Keep only the latest position for each ship
    if (!ships.has(mmsi) || new Date(dateTime) > new Date(ships.get(mmsi).timestamp)) {
      ships.set(mmsi, shipData);
    }
  }
  
  return Array.from(ships.values());
};

function App() {
  const [ships, setShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('App component mounted');
    
    // Load real NOAA AIS data from your CSV file
    const loadRealShipData = async () => {
      try {
        const response = await fetch('/noaa-ais-sample.csv');
        if (response.ok) {
          const csvText = await response.text();
          const processedShips = parseNOAACSVData(csvText);
          console.log('Loaded real ship data:', processedShips);
          setShips(processedShips);
        } else {
          console.error('Failed to load NOAA data');
          setShips([]);
        }
      } catch (error) {
        console.error('Error loading ship data:', error);
        setError(error);
        setShips([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadRealShipData();
  }, []);

  console.log('App render - loading:', loading, 'ships:', ships.length);

  if (loading) {
    return (
      <div className="app">
        <h1>AIS Ship Tracker</h1>
        <p>Loading maritime data...</p>
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="main-content">
        <MapComponent 
          ships={ships}
          selectedShip={selectedShip}
          onShipSelect={setSelectedShip}
          trajectories={new Map()}
          showTrajectories={false}
        />
        
        <div className="ship-panel">
          <h2>Ships Detected: {ships.length}</h2>
          {ships.length > 0 ? (
            ships.map(ship => (
              <div 
                key={ship.mmsi} 
                className={`ship-item ${selectedShip?.mmsi === ship.mmsi ? 'selected' : ''}`}
                onClick={() => setSelectedShip(ship)}
              >
                <h3>{ship.name}</h3>
                <div className="ship-details">
                  <p><strong>MMSI:</strong> {ship.mmsi}</p>
                  <p><strong>Type:</strong> {ship.shipType}</p>
                  <p><strong>Speed:</strong> {ship.speed} knots</p>
                  <p><strong>Heading:</strong> {ship.heading}°</p>
                  <p><strong>Destination:</strong> {ship.destination}</p>
                  <p><strong>Status:</strong> {ship.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No ships found in the data file</p>
          )}
          
          <div className="info-panel">
            <p>🚢 Click on ships in the panel or map to select them</p>
            <p>🗺️ Interactive map with real-time ship positions</p>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="loading-overlay">
          <p>Loading maritime data...</p>
        </div>
      )}
      
      <div className="error-boundary">
        {error && (
          <div className="error-message">
            <h3>Error:</h3>
            <pre>{error.message}</pre>
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;