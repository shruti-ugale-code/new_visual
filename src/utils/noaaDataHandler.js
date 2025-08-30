import Papa from 'papaparse';

/**
 * NOAA AIS Data Handler
 * Specialized parser for NOAA AIS data format with streaming support
 */

/**
 * Parse NOAA AIS CSV data format
 * @param {string} csvText - Raw CSV text content
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed data with ships and trajectories
 */
export const parseNOAAAISData = (csvText, options = {}) => {
  const {
    maxRecords = 10000,
    timeWindow = 24, // hours
    boundingBox = null, // {north, south, east, west}
    vesselTypes = null, // array of vessel types to include
    onProgress = null
  } = options;

  try {
    let processedRecords = 0;
    const shipMap = new Map();
    const trajectoryMap = new Map();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      step: (row, parser) => {
        if (processedRecords >= maxRecords) {
          parser.abort();
          return;
        }

        const data = row.data;
        const shipData = parseNOAARecord(data);
        
        if (!shipData || !isValidRecord(shipData, options)) {
          return;
        }

        // Update ship info (keep latest)
        const mmsi = shipData.mmsi;
        if (!shipMap.has(mmsi) || 
            new Date(shipData.timestamp) > new Date(shipMap.get(mmsi).timestamp)) {
          shipMap.set(mmsi, shipData);
        }

        // Add to trajectory
        addToTrajectory(trajectoryMap, shipData);
        
        processedRecords++;
        
        if (onProgress && processedRecords % 1000 === 0) {
          onProgress({
            processed: processedRecords,
            total: maxRecords,
            percentage: (processedRecords / maxRecords) * 100
          });
        }
      },
      complete: () => {
        if (onProgress) {
          onProgress({
            processed: processedRecords,
            total: processedRecords,
            percentage: 100,
            completed: true
          });
        }
      }
    });

    // Sort trajectories by timestamp
    trajectoryMap.forEach((trajectory) => {
      trajectory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    return {
      ships: Array.from(shipMap.values()),
      trajectories: trajectoryMap,
      metadata: {
        totalRecords: processedRecords,
        uniqueVessels: shipMap.size,
        dataSource: 'NOAA AIS',
        processingTime: Date.now()
      }
    };
  } catch (error) {
    console.error('Error parsing NOAA AIS data:', error);
    return { ships: [], trajectories: new Map(), metadata: { error: error.message } };
  }
};

/**
 * Parse a single NOAA AIS record
 * @param {Object} record - Raw CSV record
 * @returns {Object|null} Parsed ship data
 */
const parseNOAARecord = (record) => {
  try {
    const mmsi = record.MMSI || record.mmsi;
    if (!mmsi) return null;

    const lat = parseFloat(record.LAT || record.lat || 0);
    const lon = parseFloat(record.LON || record.lon || 0);
    
    if (lat === 0 || lon === 0 || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return null;
    }

    return {
      mmsi: mmsi.toString(),
      name: cleanVesselName(record.VesselName || record.vesselname || 'Unknown Vessel'),
      latitude: lat,
      longitude: lon,
      heading: parseFloat(record.Heading || record.COG || record.heading || 0),
      speed: parseFloat(record.SOG || record.speed || 0),
      courseOverGround: parseFloat(record.COG || record.cog || 0),
      destination: 'Unknown', // NOAA data typically doesn't include destination
      eta: '', // NOAA data typically doesn't include ETA
      shipType: mapNOAAVesselType(record.VesselType || record.vesseltype || '0'),
      length: parseFloat(record.Length || record.length || 0),
      width: parseFloat(record.Width || record.width || 0),
      draft: parseFloat(record.Draft || record.draft || 0),
      status: mapNOAANavigationStatus(record.Status || record.status || '0'),
      timestamp: parseNOAADateTime(record.BaseDateTime || record.basedatetime || record.timestamp),
      callSign: record.CallSign || record.callsign || '',
      imoNumber: record.IMO || record.imo || '',
      cargo: record.Cargo || record.cargo || '',
      transceiverClass: record.TransceiverClass || record.transceiverclass || 'A',
      
      // Additional NOAA-specific fields
      baseDateTime: record.BaseDateTime || record.basedatetime,
      vesselName: record.VesselName || record.vesselname,
      vesselType: record.VesselType || record.vesseltype,
      grossTonnage: parseFloat(record.GrossTonnage || record.grosstonnage || 0),
      deadweight: parseFloat(record.Deadweight || record.deadweight || 0)
    };
  } catch (error) {
    console.warn('Error parsing NOAA record:', error, record);
    return null;
  }
};

/**
 * Clean and format vessel names
 * @param {string} name - Raw vessel name
 * @returns {string} Cleaned vessel name
 */
const cleanVesselName = (name) => {
  if (!name || name === '0' || name.toLowerCase() === 'unknown') {
    return 'Unknown Vessel';
  }
  return name.trim().toUpperCase();
};

/**
 * Parse NOAA date/time format
 * @param {string} dateTimeStr - NOAA datetime string
 * @returns {string} ISO datetime string
 */
const parseNOAADateTime = (dateTimeStr) => {
  if (!dateTimeStr) return new Date().toISOString();
  
  try {
    // NOAA format: 2022-01-01T00:05:00 or similar
    const date = new Date(dateTimeStr);
    return date.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
};

/**
 * Map NOAA vessel type codes to readable names
 * @param {string|number} typeCode - NOAA vessel type code
 * @returns {string} Human readable ship type
 */
const mapNOAAVesselType = (typeCode) => {
  const typeMap = {
    // NOAA vessel type codes (based on AIS standards)
    '20': 'Wing in ground',
    '21': 'Wing in ground',
    '22': 'Wing in ground',
    '23': 'Wing in ground',
    '24': 'Wing in ground',
    '25': 'Wing in ground',
    '26': 'Wing in ground',
    '27': 'Wing in ground',
    '28': 'Wing in ground',
    '29': 'Wing in ground',
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
    '56': 'Spare',
    '57': 'Spare',
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
    '89': 'Tanker',
    '90': 'Other',
    '91': 'Other',
    '92': 'Other',
    '93': 'Other',
    '94': 'Other',
    '95': 'Other',
    '96': 'Other',
    '97': 'Other',
    '98': 'Other',
    '99': 'Other'
  };

  const stringCode = String(typeCode).trim();
  return typeMap[stringCode] || 'Other';
};

/**
 * Map NOAA navigation status codes
 * @param {string|number} statusCode - Navigation status code
 * @returns {string} Human readable status
 */
const mapNOAANavigationStatus = (statusCode) => {
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
  return statusMap[stringCode] || 'Unknown';
};

/**
 * Validate if a record should be included
 * @param {Object} shipData - Parsed ship data
 * @param {Object} options - Filtering options
 * @returns {boolean} Whether record is valid
 */
const isValidRecord = (shipData, options = {}) => {
  const { boundingBox, vesselTypes, timeWindow } = options;

  // Bounding box filter
  if (boundingBox) {
    const { north, south, east, west } = boundingBox;
    if (shipData.latitude < south || shipData.latitude > north ||
        shipData.longitude < west || shipData.longitude > east) {
      return false;
    }
  }

  // Vessel type filter
  if (vesselTypes && vesselTypes.length > 0) {
    if (!vesselTypes.includes(shipData.shipType)) {
      return false;
    }
  }

  // Time window filter
  if (timeWindow) {
    const recordTime = new Date(shipData.timestamp);
    const cutoffTime = new Date(Date.now() - (timeWindow * 60 * 60 * 1000));
    if (recordTime < cutoffTime) {
      return false;
    }
  }

  return true;
};

/**
 * Add ship data to trajectory map
 * @param {Map} trajectoryMap - Trajectory map
 * @param {Object} shipData - Ship data
 */
const addToTrajectory = (trajectoryMap, shipData) => {
  const mmsi = shipData.mmsi;
  const trajectoryPoint = {
    lat: shipData.latitude,
    lng: shipData.longitude,
    timestamp: shipData.timestamp,
    speed: shipData.speed,
    heading: shipData.heading
  };

  if (trajectoryMap.has(mmsi)) {
    const trajectory = trajectoryMap.get(mmsi);
    trajectory.push(trajectoryPoint);
    
    // Keep only last 100 points per ship to prevent memory issues
    if (trajectory.length > 100) {
      trajectory.splice(0, trajectory.length - 100);
    }
  } else {
    trajectoryMap.set(mmsi, [trajectoryPoint]);
  }
};

/**
 * Load NOAA AIS data from URL with progress tracking
 * @param {string} url - URL to NOAA data file
 * @param {Object} options - Loading options
 * @returns {Promise} Promise resolving to parsed data
 */
export const loadNOAAData = async (url, options = {}) => {
  const { onProgress } = options;
  
  try {
    if (onProgress) {
      onProgress({ stage: 'downloading', percentage: 0 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = parseInt(contentLength, 10);
    let loaded = 0;

    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      if (onProgress && total) {
        onProgress({
          stage: 'downloading',
          percentage: (loaded / total) * 50 // 50% for download
        });
      }
    }

    if (onProgress) {
      onProgress({ stage: 'parsing', percentage: 50 });
    }

    const text = new TextDecoder().decode(new Uint8Array(chunks.flat()));
    
    const parseOptions = {
      ...options,
      onProgress: (progress) => {
        if (onProgress) {
          onProgress({
            stage: 'parsing',
            percentage: 50 + (progress.percentage * 0.5)
          });
        }
      }
    };

    return parseNOAAAISData(text, parseOptions);
  } catch (error) {
    console.error('Error loading NOAA data:', error);
    throw error;
  }
};

/**
 * Generate NOAA data file URLs for date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Array of NOAA data URLs
 */
export const generateNOAAUrls = (startDate, endDate) => {
  const urls = [];
  const baseUrl = 'https://coast.noaa.gov/htdata/CMSP/AISDataHandler/2022/';
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    
    const filename = `AIS_${year}_${month}_${day}.zip`;
    urls.push(`${baseUrl}${filename}`);
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return urls;
};

export default {
  parseNOAAAISData,
  loadNOAAData,
  generateNOAAUrls
};