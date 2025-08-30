import React from 'react';
import { Ship, Navigation, Clock, Anchor, MapPin, Gauge } from 'lucide-react';
import './ShipPanel.css';

const ShipPanel = ({ ships, selectedShip, onShipSelect }) => {
  const formatSpeed = (speed) => `${speed.toFixed(1)} kts`;
  
  const formatHeading = (heading) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(heading / 22.5) % 16;
    return `${heading.toFixed(0)}° ${directions[index]}`;
  };

  const formatCoordinates = (lat, lon) => {
    const formatDegrees = (deg, isLat) => {
      const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
      const abs = Math.abs(deg);
      return `${abs.toFixed(4)}° ${dir}`;
    };
    return `${formatDegrees(lat, true)}, ${formatDegrees(lon, false)}`;
  };

  const getShipTypeColor = (shipType) => {
    const colors = {
      'Cargo': '#60a5fa',
      'Tanker': '#f97316',
      'Container': '#22c55e',
      'Bulk Carrier': '#eab308',
      'Passenger': '#a855f7',
      'Fishing': '#06b6d4',
      'Other': '#6b7280'
    };
    return colors[shipType] || colors['Other'];
  };

  return (
    <div className="ship-panel">
      <div className="panel-header">
        <Ship size={20} />
        <h2>Ship List</h2>
        <span className="ship-count">{ships.length}</span>
      </div>

      <div className="ship-list">
        {ships.map((ship) => (
          <div
            key={ship.mmsi}
            className={`ship-item ${selectedShip?.mmsi === ship.mmsi ? 'selected' : ''}`}
            onClick={() => onShipSelect(ship)}
          >
            <div className="ship-item-header">
              <div className="ship-name-container">
                <div 
                  className="ship-type-indicator"
                  style={{ backgroundColor: getShipTypeColor(ship.shipType) }}
                ></div>
                <div className="ship-name-info">
                  <h3 className="ship-name">{ship.name}</h3>
                  <span className="ship-type">{ship.shipType}</span>
                </div>
              </div>
              <div className="mmsi">MMSI: {ship.mmsi}</div>
            </div>

            <div className="ship-details">
              <div className="detail-group">
                <div className="detail-item">
                  <Gauge size={14} />
                  <span className="label">Speed:</span>
                  <span className="value">{formatSpeed(ship.speed)}</span>
                </div>
                <div className="detail-item">
                  <Navigation size={14} />
                  <span className="label">Heading:</span>
                  <span className="value">{formatHeading(ship.heading)}</span>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <MapPin size={14} />
                  <span className="label">Position:</span>
                  <span className="value small">{formatCoordinates(ship.latitude, ship.longitude)}</span>
                </div>
              </div>

              <div className="detail-group">
                <div className="detail-item">
                  <Anchor size={14} />
                  <span className="label">Destination:</span>
                  <span className="value">{ship.destination}</span>
                </div>
                <div className="detail-item">
                  <Clock size={14} />
                  <span className="label">ETA:</span>
                  <span className="value">{ship.eta}</span>
                </div>
              </div>

              <div className="status-bar">
                <div className="status">
                  <div className="status-indicator active"></div>
                  <span>{ship.status}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedShip && (
        <div className="selected-ship-details">
          <div className="details-header">
            <h3>Detailed Information</h3>
            <div 
              className="ship-type-badge"
              style={{ backgroundColor: getShipTypeColor(selectedShip.shipType) }}
            >
              {selectedShip.shipType}
            </div>
          </div>

          <div className="details-content">
            <div className="detail-section">
              <h4>Vessel Details</h4>
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="label">Name:</span>
                  <span className="value">{selectedShip.name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">MMSI:</span>
                  <span className="value">{selectedShip.mmsi}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{selectedShip.shipType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Length:</span>
                  <span className="value">{selectedShip.length}m</span>
                </div>
                <div className="detail-row">
                  <span className="label">Width:</span>
                  <span className="value">{selectedShip.width}m</span>
                </div>
                <div className="detail-row">
                  <span className="label">Draft:</span>
                  <span className="value">{selectedShip.draft}m</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Navigation</h4>
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="label">Speed:</span>
                  <span className="value">{formatSpeed(selectedShip.speed)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Heading:</span>
                  <span className="value">{formatHeading(selectedShip.heading)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Position:</span>
                  <span className="value small">{formatCoordinates(selectedShip.latitude, selectedShip.longitude)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Destination:</span>
                  <span className="value">{selectedShip.destination}</span>
                </div>
                <div className="detail-row">
                  <span className="label">ETA:</span>
                  <span className="value">{selectedShip.eta}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className="value status">{selectedShip.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipPanel;