import Papa from 'papaparse';

/**
 * Parse AIS CSV data and convert to ship objects
 * @param {string} csvText - Raw CSV text content
 * @returns {Array} Array of ship objects
 */
export const parseCSVData = (csvText) => {
  try {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
    });

    if (result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }

    return result.data.map(row => ({
      mmsi: row.mmsi || row.userid || '',
      name: row.vesselname || row.ship_name || row.name || 'Unknown Vessel',
      latitude: parseFloat(row.lat || row.latitude || 0),
      longitude: parseFloat(row.lon || row.longitude || row.lng || 0),
      heading: parseFloat(row.cog || row.heading || row.course || 0),
      speed: parseFloat(row.sog || row.speed || row.speed_over_ground || 0),
      destination: row.destination || row.dest || 'Unknown',
      eta: row.eta || row.estimated_arrival || '',
      shipType: mapShipType(row.shipandcargotype || row.ship_type || row.vesseltype || ''),
      length: parseFloat(row.length || row.vessel_length || 0),
      width: parseFloat(row.width || row.beam || row.vessel_width || 0),
      draft: parseFloat(row.draft || row.draught || 0),
      status: mapNavigationStatus(row.navstat || row.navigation_status || row.status || ''),
      timestamp: row.timestamp || row.datetime || new Date().toISOString(),
      callSign: row.callsign || row.call_sign || '',
      imoNumber: row.imo || row.imo_number || '',
      flag: row.flag || row.country || '',
      buildYear: row.year_built || row.build_year || '',
      grossTonnage: parseFloat(row.gross_tonnage || row.gt || 0),
      deadweight: parseFloat(row.deadweight || row.dwt || 0)
    })).filter(ship => 
      // Filter out invalid entries
      ship.mmsi && 
      ship.latitude !== 0 && 
      ship.longitude !== 0 &&
      Math.abs(ship.latitude) <= 90 &&
      Math.abs(ship.longitude) <= 180
    );
  } catch (error) {
    console.error('Error parsing CSV data:', error);
    return [];
  }
};

/**
 * Map ship type codes to readable names
 * @param {string|number} typeCode - Ship type code
 * @returns {string} Human readable ship type
 */
const mapShipType = (typeCode) => {
  const typeMap = {
    // AIS ship type codes
    '30': 'Fishing',
    '31': 'Towing',
    '32': 'Towing',
    '33': 'Dredging',
    '34': 'Diving',
    '35': 'Military',
    '36': 'Sailing',
    '37': 'Pleasure Craft',
    '40': 'High Speed Craft',
    '41': 'High Speed Craft',
    '42': 'High Speed Craft',
    '43': 'High Speed Craft',
    '44': 'High Speed Craft',
    '45': 'High Speed Craft',
    '46': 'High Speed Craft',
    '47': 'High Speed Craft',
    '48': 'High Speed Craft',
    '49': 'High Speed Craft',
    '50': 'Pilot Vessel',
    '51': 'Search and Rescue',
    '52': 'Tug',
    '53': 'Port Tender',
    '54': 'Anti-pollution',
    '55': 'Law Enforcement',
    '58': 'Medical Transport',
    '59': 'Special Craft',
    '60': 'Passenger',
    '61': 'Passenger',
    '62': 'Passenger',
    '63': 'Passenger',
    '64': 'Passenger',
    '65': 'Passenger',
    '66': 'Passenger',
    '67': 'Passenger',
    '68': 'Passenger',
    '69': 'Passenger',
    '70': 'Cargo',
    '71': 'Cargo',
    '72': 'Cargo',
    '73': 'Cargo',
    '74': 'Cargo',
    '75': 'Cargo',
    '76': 'Cargo',
    '77': 'Cargo',
    '78': 'Cargo',
    '79': 'Cargo',
    '80': 'Tanker',
    '81': 'Tanker',
    '82': 'Tanker',
    '83': 'Tanker',
    '84': 'Tanker',
    '85': 'Tanker',
    '86': 'Tanker',
    '87': 'Tanker',
    '88': 'Tanker',
    '89': 'Tanker'
  };

  const stringCode = String(typeCode).trim();
  
  // Check exact match first
  if (typeMap[stringCode]) {
    return typeMap[stringCode];
  }

  // Check for partial matches or common names
  const lowerType = stringCode.toLowerCase();
  if (lowerType.includes('cargo') || lowerType.includes('general')) return 'Cargo';
  if (lowerType.includes('tanker') || lowerType.includes('chemical') || lowerType.includes('oil')) return 'Tanker';
  if (lowerType.includes('container')) return 'Container';
  if (lowerType.includes('bulk')) return 'Bulk Carrier';
  if (lowerType.includes('passenger') || lowerType.includes('cruise')) return 'Passenger';
  if (lowerType.includes('fishing')) return 'Fishing';
  if (lowerType.includes('tug')) return 'Tug';
  if (lowerType.includes('pilot')) return 'Pilot Vessel';
  if (lowerType.includes('military') || lowerType.includes('naval')) return 'Military';
  if (lowerType.includes('pleasure') || lowerType.includes('yacht')) return 'Pleasure Craft';

  return stringCode || 'Other';
};

/**
 * Map navigation status codes to readable names
 * @param {string|number} statusCode - Navigation status code
 * @returns {string} Human readable navigation status
 */
const mapNavigationStatus = (statusCode) => {
  const statusMap = {
    '0': 'Under way using engine',
    '1': 'At anchor',
    '2': 'Not under command',
    '3': 'Restricted manoeuvrability',
    '4': 'Constrained by her draught',
    '5': 'Moored',
    '6': 'Aground',
    '7': 'Engaged in fishing',
    '8': 'Under way sailing',
    '9': 'Reserved for future amendment',
    '10': 'Reserved for future amendment',
    '11': 'Power-driven vessel towing astern',
    '12': 'Power-driven vessel pushing ahead',
    '13': 'Reserved for future use',
    '14': 'AIS-SART is active',
    '15': 'Not defined'
  };

  const stringCode = String(statusCode).trim();
  return statusMap[stringCode] || statusCode || 'Unknown';
};

/**
 * Load CSV data from file
 * @param {File} file - CSV file object
 * @returns {Promise<Array>} Promise resolving to array of ship objects
 */
export const loadCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        const ships = parseCSVData(csvText);
        resolve(ships);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Process multiple CSV files
 * @param {FileList} files - List of CSV files
 * @returns {Promise<Array>} Promise resolving to combined array of ship objects
 */
export const loadMultipleCSVFiles = async (files) => {
  const allShips = [];
  
  for (const file of files) {
    try {
      const ships = await loadCSVFile(file);
      allShips.push(...ships);
    } catch (error) {
      console.error(`Error loading file ${file.name}:`, error);
    }
  }
  
  // Remove duplicates based on MMSI and timestamp
  const uniqueShips = allShips.reduce((unique, ship) => {
    const key = `${ship.mmsi}_${ship.timestamp}`;
    if (!unique.has(key)) {
      unique.set(key, ship);
    }
    return unique;
  }, new Map());
  
  return Array.from(uniqueShips.values());
};

/**
 * Filter ships by geographic bounds
 * @param {Array} ships - Array of ship objects
 * @param {Object} bounds - Geographic bounds {north, south, east, west}
 * @returns {Array} Filtered array of ships
 */
export const filterShipsByBounds = (ships, bounds) => {
  return ships.filter(ship => 
    ship.latitude >= bounds.south &&
    ship.latitude <= bounds.north &&
    ship.longitude >= bounds.west &&
    ship.longitude <= bounds.east
  );
};

/**
 * Sort ships by various criteria
 * @param {Array} ships - Array of ship objects
 * @param {string} sortBy - Sort criteria ('name', 'speed', 'distance', etc.)
 * @param {boolean} ascending - Sort order
 * @returns {Array} Sorted array of ships
 */
export const sortShips = (ships, sortBy, ascending = true) => {
  const sorted = [...ships].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'speed':
        valueA = a.speed;
        valueB = b.speed;
        break;
      case 'mmsi':
        valueA = a.mmsi;
        valueB = b.mmsi;
        break;
      case 'destination':
        valueA = a.destination.toLowerCase();
        valueB = b.destination.toLowerCase();
        break;
      case 'type':
        valueA = a.shipType.toLowerCase();
        valueB = b.shipType.toLowerCase();
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return ascending ? -1 : 1;
    if (valueA > valueB) return ascending ? 1 : -1;
    return 0;
  });
  
  return sorted;
};

/**
 * Process trajectory data from CSV to create ship paths
 * @param {string} csvText - Raw CSV text content with time-series data
 * @returns {Object} Object with ships array and trajectories map
 */
export const parseTrajectoryData = (csvText) => {
  try {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
    });

    if (result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }

    const shipMap = new Map();
    const trajectoryMap = new Map();

    result.data.forEach(row => {
      const mmsi = row.mmsi || row.userid || '';
      if (!mmsi) return;

      const shipData = {
        mmsi,
        name: row.vesselname || row.ship_name || row.name || 'Unknown Vessel',
        latitude: parseFloat(row.lat || row.latitude || 0),
        longitude: parseFloat(row.lon || row.longitude || row.lng || 0),
        heading: parseFloat(row.cog || row.heading || row.course || 0),
        speed: parseFloat(row.sog || row.speed || row.speed_over_ground || 0),
        destination: row.destination || row.dest || 'Unknown',
        eta: row.eta || row.estimated_arrival || '',
        shipType: mapShipType(row.shipandcargotype || row.ship_type || row.vesseltype || ''),
        length: parseFloat(row.length || row.vessel_length || 0),
        width: parseFloat(row.width || row.beam || row.vessel_width || 0),
        draft: parseFloat(row.draft || row.draught || 0),
        status: mapNavigationStatus(row.navstat || row.navigation_status || row.status || ''),
        timestamp: row.timestamp || row.datetime || new Date().toISOString(),
        callSign: row.callsign || row.call_sign || '',
        imoNumber: row.imo || row.imo_number || '',
        flag: row.flag || row.country || '',
        buildYear: row.year_built || row.build_year || '',
        grossTonnage: parseFloat(row.gross_tonnage || row.gt || 0),
        deadweight: parseFloat(row.deadweight || row.dwt || 0)
      };

      // Filter out invalid entries
      if (shipData.latitude === 0 || shipData.longitude === 0 ||
          Math.abs(shipData.latitude) > 90 || Math.abs(shipData.longitude) > 180) {
        return;
      }

      // Update ship info (keep latest)
      if (!shipMap.has(mmsi) || new Date(shipData.timestamp) > new Date(shipMap.get(mmsi).timestamp)) {
        shipMap.set(mmsi, shipData);
      }

      // Add to trajectory
      const trajectoryPoint = {
        lat: shipData.latitude,
        lng: shipData.longitude,
        timestamp: shipData.timestamp,
        speed: shipData.speed,
        heading: shipData.heading
      };

      if (trajectoryMap.has(mmsi)) {
        trajectoryMap.get(mmsi).push(trajectoryPoint);
      } else {
        trajectoryMap.set(mmsi, [trajectoryPoint]);
      }
    });

    // Sort trajectories by timestamp
    trajectoryMap.forEach((trajectory, mmsi) => {
      trajectory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    return {
      ships: Array.from(shipMap.values()),
      trajectories: trajectoryMap
    };
  } catch (error) {
    console.error('Error parsing trajectory data:', error);
    return { ships: [], trajectories: new Map() };
  }
};