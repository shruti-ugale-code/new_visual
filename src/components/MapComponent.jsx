import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import './MapComponent.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ship icon
const createShipIcon = (heading = 0, shipType = 'Cargo', isSelected = false) => {
  const getShipColor = (type) => {
    const colors = {
      'Cargo': '#60a5fa',
      'Tanker': '#f97316',
      'Container': '#22c55e',
      'Bulk Carrier': '#eab308',
      'Passenger': '#a855f7',
      'Fishing': '#06b6d4',
      'Other': '#6b7280'
    };
    return colors[type] || colors['Other'];
  };

  const color = getShipColor(shipType);
  const size = isSelected ? 24 : 18;
  const strokeWidth = isSelected ? 3 : 2;

  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${heading} 12 12)">
        <path d="M12 2 L20 20 L12 16 L4 20 Z" 
              fill="${color}" 
              stroke="#ffffff" 
              stroke-width="${strokeWidth}" 
              stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="2" fill="#ffffff"/>
      </g>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'ship-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const MapUpdater = ({ ships, selectedShip }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedShip) {
      map.setView([selectedShip.latitude, selectedShip.longitude], 12, {
        animate: true,
        duration: 1
      });
    } else if (ships.length > 0) {
      const bounds = L.latLngBounds(ships.map(ship => [ship.latitude, ship.longitude]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, ships, selectedShip]);

  return null;
};

const MapComponent = ({ ships, selectedShip, onShipSelect, trajectories, showTrajectories }) => {
  const mapRef = useRef();

  const getShipTrajectoryColor = (shipType) => {
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

  const formatSpeed = (speed) => {
    return `${speed.toFixed(1)} kts`;
  };

  const formatHeading = (heading) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(heading / 22.5) % 16;
    return `${heading.toFixed(0)}° (${directions[index]})`;
  };

  return (
    <div className="map-container">
      <MapContainer
        ref={mapRef}
        center={[51.505, -0.09]}
        zoom={10}
        className="leaflet-map"
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        <MapUpdater ships={ships} selectedShip={selectedShip} />
        
        {/* Ship Trajectories */}
        {showTrajectories && trajectories && Array.from(trajectories.entries()).map(([mmsi, trajectory]) => {
          if (trajectory.length < 2) return null;
          
          const ship = ships.find(s => s.mmsi === mmsi);
          const shipType = ship ? ship.shipType : 'Other';
          const isSelected = selectedShip?.mmsi === mmsi;
          
          const pathPositions = trajectory.map(point => [point.lat, point.lng]);
          
          return (
            <Polyline
              key={`trajectory-${mmsi}`}
              positions={pathPositions}
              pathOptions={{
                color: getShipTrajectoryColor(shipType),
                weight: isSelected ? 4 : 2,
                opacity: isSelected ? 0.8 : 0.6,
                dashArray: isSelected ? '10, 5' : '5, 5'
              }}
            />
          );
        })}
        
        {ships.map((ship) => (
          <Marker
            key={ship.mmsi}
            position={[ship.latitude, ship.longitude]}
            icon={createShipIcon(
              ship.heading, 
              ship.shipType, 
              selectedShip?.mmsi === ship.mmsi
            )}
            eventHandlers={{
              click: () => onShipSelect(ship),
            }}
          >
            <Popup className="ship-popup">
              <div className="popup-content">
                <div className="popup-header">
                  <h3>{ship.name}</h3>
                  <span className="ship-type">{ship.shipType}</span>
                </div>
                <div className="popup-details">
                  <div className="detail-row">
                    <span className="label">MMSI:</span>
                    <span className="value">{ship.mmsi}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Speed:</span>
                    <span className="value">{formatSpeed(ship.speed)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Heading:</span>
                    <span className="value">{formatHeading(ship.heading)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Destination:</span>
                    <span className="value">{ship.destination}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className="value status">{ship.status}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="map-controls">
        <div className="legend">
          <h4>Ship Types</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#60a5fa'}}></div>
              <span>Cargo</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#f97316'}}></div>
              <span>Tanker</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#22c55e'}}></div>
              <span>Container</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#eab308'}}></div>
              <span>Bulk Carrier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;