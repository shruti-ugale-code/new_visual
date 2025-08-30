import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import ShipPanel from './components/ShipPanel';
import Header from './components/Header';
import { parseCSVData, parseTrajectoryData } from './utils/csvParser';
import { parseNOAAAISData } from './utils/noaaDataHandler';
import './App.css';

function App() {
  const [ships, setShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [shipTrajectories, setShipTrajectories] = useState(new Map());
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [maxTrajectoryPoints, setMaxTrajectoryPoints] = useState(50);

  // Load initial data
  useEffect(() => {
    loadShipData();
  }, []);

  // Auto refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadShipData();
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadShipData = async () => {
    try {
      // Try to load NOAA data first
      const noaaResponse = await fetch('/noaa-ais-sample.csv');
      if (noaaResponse.ok) {
        const csvText = await noaaResponse.text();
        const noaaData = parseNOAAAISData(csvText, { maxRecords: 1000 });
        if (noaaData.ships.length > 0) {
          setShips(noaaData.ships);
          setShipTrajectories(noaaData.trajectories);
          return;
        }
      }
      
      // Try to load trajectory data
      const trajectoryResponse = await fetch('/sample-trajectory-data.csv');
      if (trajectoryResponse.ok) {
        const csvText = await trajectoryResponse.text();
        const trajectoryData = parseTrajectoryData(csvText);
        if (trajectoryData.ships.length > 0) {
          setShips(trajectoryData.ships);
          setShipTrajectories(trajectoryData.trajectories);
          return;
        }
      }
      
      // Fallback to regular AIS data
      const response = await fetch('/sample-ais-data.csv');
      if (response.ok) {
        const csvText = await response.text();
        const csvData = parseCSVData(csvText);
        if (csvData.length > 0) {
          // Add some random movement to simulate real-time tracking
          const updatedData = csvData.map(ship => ({
            ...ship,
            latitude: ship.latitude + (Math.random() - 0.5) * 0.01,
            longitude: ship.longitude + (Math.random() - 0.5) * 0.01,
            heading: ship.heading + (Math.random() - 0.5) * 10,
            speed: Math.max(0, ship.speed + (Math.random() - 0.5) * 2)
          }));
          setShips(updatedData);
          updateTrajectories(updatedData);
          return;
        }
      }
      
      // Final fallback to sample data
      const sampleData = generateSampleShipData();
      setShips(sampleData);
      updateTrajectories(sampleData);
    } catch (error) {
      console.error('Error loading ship data:', error);
      // Fallback to sample data
      const sampleData = generateSampleShipData();
      setShips(sampleData);
      updateTrajectories(sampleData);
    }
  };

  const handleDataLoad = (newShipData) => {
    setShips(newShipData);
    setLastUpdate(new Date());
    setSelectedShip(null); // Clear selection when new data is loaded
    // Reset trajectories for new data
    setShipTrajectories(new Map());
    updateTrajectories(newShipData);
  };

  const updateTrajectories = (currentShips) => {
    setShipTrajectories(prevTrajectories => {
      const newTrajectories = new Map(prevTrajectories);
      
      currentShips.forEach(ship => {
        const mmsi = ship.mmsi;
        const currentPosition = {
          lat: ship.latitude,
          lng: ship.longitude,
          timestamp: new Date().toISOString(),
          speed: ship.speed,
          heading: ship.heading
        };
        
        if (newTrajectories.has(mmsi)) {
          const existingPath = newTrajectories.get(mmsi);
          const updatedPath = [...existingPath, currentPosition];
          
          // Keep only the last N points to prevent memory issues
          if (updatedPath.length > maxTrajectoryPoints) {
            updatedPath.splice(0, updatedPath.length - maxTrajectoryPoints);
          }
          
          newTrajectories.set(mmsi, updatedPath);
        } else {
          newTrajectories.set(mmsi, [currentPosition]);
        }
      });
      
      return newTrajectories;
    });
  };

  const generateSampleShipData = () => {
    const sampleShips = [
      {
        mmsi: '367123456',
        name: 'OCEAN VOYAGER',
        latitude: 51.505,
        longitude: -0.09,
        heading: 45,
        speed: 12.5,
        destination: 'LONDON',
        eta: '2024-08-31 14:30',
        shipType: 'Cargo',
        length: 180,
        width: 25,
        draft: 8.5,
        status: 'Under way using engine'
      },
      {
        mmsi: '244567890',
        name: 'ATLANTIC STAR',
        latitude: 51.515,
        longitude: -0.1,
        heading: 180,
        speed: 8.2,
        destination: 'SOUTHAMPTON',
        eta: '2024-08-31 16:45',
        shipType: 'Tanker',
        length: 220,
        width: 32,
        draft: 12.2,
        status: 'Under way using engine'
      },
      {
        mmsi: '538123789',
        name: 'PACIFIC DREAM',
        latitude: 51.52,
        longitude: -0.08,
        heading: 90,
        speed: 15.1,
        destination: 'FELIXSTOWE',
        eta: '2024-09-01 08:15',
        shipType: 'Container',
        length: 350,
        width: 45,
        draft: 14.8,
        status: 'Under way using engine'
      },
      {
        mmsi: '219456123',
        name: 'NORTH WIND',
        latitude: 51.49,
        longitude: -0.11,
        heading: 270,
        speed: 6.8,
        destination: 'LIVERPOOL',
        eta: '2024-09-01 12:00',
        shipType: 'Bulk Carrier',
        length: 175,
        width: 28,
        draft: 10.5,
        status: 'Under way using engine'
      }
    ];

    // Add some random movement to simulate real-time tracking
    return sampleShips.map(ship => ({
      ...ship,
      latitude: ship.latitude + (Math.random() - 0.5) * 0.01,
      longitude: ship.longitude + (Math.random() - 0.5) * 0.01,
      heading: ship.heading + (Math.random() - 0.5) * 10,
      speed: Math.max(0, ship.speed + (Math.random() - 0.5) * 2)
    }));
  };

  const filteredShips = ships.filter(ship =>
    ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.mmsi.includes(searchTerm) ||
    ship.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        autoRefresh={autoRefresh}
        onAutoRefreshToggle={setAutoRefresh}
        lastUpdate={lastUpdate}
        shipCount={ships.length}
        onDataLoad={handleDataLoad}
        showTrajectories={showTrajectories}
        onTrajectoryToggle={setShowTrajectories}
      />
      
      <div className="main-content">
        <MapComponent 
          ships={filteredShips}
          selectedShip={selectedShip}
          onShipSelect={setSelectedShip}
          trajectories={shipTrajectories}
          showTrajectories={showTrajectories}
        />
        
        <ShipPanel 
          ships={filteredShips}
          selectedShip={selectedShip}
          onShipSelect={setSelectedShip}
        />
      </div>
    </div>
  );
}

export default App;